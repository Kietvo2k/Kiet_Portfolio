const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const config = fs.readFileSync(path.join(root, "site.config.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

function setup(t, { hash = "", storage = {}, customize = "" } = {}) {
  const dom = new JSDOM(html, { url: `https://portfolio.example/${hash}`, runScripts: "outside-only", pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const { window } = dom;
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.animate = () => ({ cancel() {} });
  window.matchMedia = () => ({ matches: false, addEventListener() {} });
  window.ResizeObserver = class { observe() {} disconnect() {} };
  window.HTMLCanvasElement.prototype.getContext = () => null;
  window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  window.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.removeAttribute("open");
    this.dispatchEvent(new window.Event("close"));
  };
  const copied = [];
  Object.defineProperty(window.navigator, "clipboard", { value: { writeText: async (text) => { copied.push(text); } } });
  for (const [key, value] of Object.entries(storage)) window.localStorage.setItem(`kiet-portfolio:${key}`, value);
  const context = dom.getInternalVMContext();
  vm.runInContext(config, context);
  if (customize) vm.runInContext(customize, context);
  vm.runInContext(app, context);
  const document = window.document;
  const click = (selector) => {
    const target = document.querySelector(selector);
    assert.ok(target, selector);
    target.click();
  };
  const type = (selector, value) => {
    const target = document.querySelector(selector);
    assert.ok(target, selector);
    target.value = value;
    target.dispatchEvent(new window.Event("input", { bubbles: true }));
  };
  const navigate = (route) => {
    window.history.replaceState(null, "", `#${route}`);
    window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  };
  return { window, document, click, type, navigate, context, copied };
}

test("all routes mount, keep navigation current, and work under a subdirectory", (t) => {
  const { document, navigate, window } = setup(t);
  for (const route of ["home", "work", "about", "playground", "contact"]) {
    navigate(route);
    assert.equal(document.querySelectorAll("main h1").length, 1, route);
    if (route !== "contact") assert.equal(document.querySelector("[aria-current=page]").dataset.nav, route);
    assert.ok(document.querySelector("main").textContent.length > 400);
  }
  window.history.replaceState(null, "", "/some/subdirectory/index.html#project/smartgarden");
  window.dispatchEvent(new window.HashChangeEvent("hashchange"));
  assert.equal(document.querySelector("#project-title").textContent, "SmartGarden AI");
});

test("project filtering, search, saved collection and empty-state recovery compose", (t) => {
  const { document, click, type, window } = setup(t, { hash: "#work" });
  assert.equal(document.querySelectorAll(".project-card").length, 6);
  click('[data-filter="AI & Công nghệ"]');
  assert.equal(document.querySelectorAll(".project-card").length, 2);
  type("#project-search", "python");
  assert.equal(document.querySelectorAll(".project-card").length, 1);
  assert.equal(document.querySelector(".project-title").textContent.trim(), "Thermal Server");
  click('[data-save="thermal"]');
  assert.equal(JSON.parse(window.localStorage.getItem("kiet-portfolio:saved"))[0], "thermal");
  click('[data-filter="Đã lưu"]');
  assert.equal(document.querySelectorAll(".project-card").length, 1);
  click('[data-save="thermal"]');
  assert.ok(document.querySelector(".empty-state"));
  click('[data-action="clear-filters"]');
  assert.equal(document.querySelectorAll(".project-card").length, 6);
  assert.equal(document.querySelector("#project-search").value, "");
});

test("invalid stored preferences and malicious saved IDs do not break startup", (t) => {
  const { document } = setup(t, { storage: { saved: '{"bad":true}', accent: '"unknown"', theme: "{broken", motion: "null" } });
  assert.equal(document.documentElement.dataset.accent, "orange");
  assert.equal(document.documentElement.dataset.theme, "light");
  assert.ok(document.querySelector(".hero"));
});

test("editable strings are escaped and unsafe navigation/image schemes are rejected", (t) => {
  const { document, click, context } = setup(t, {
    hash: "#work",
    customize: `siteConfig.projects[0].title = '<img src=x onerror=alert(1)>'; siteConfig.projects[0].url = 'javascript:alert(1)'; siteConfig.projects[0].image = 'data:image/svg+xml,dangerous';`
  });
  assert.equal(document.querySelectorAll('img[onerror]').length, 0);
  click('[data-project="smartgarden"]');
  assert.equal(document.querySelector("#project-title").textContent, "<img src=x onerror=alert(1)>");
  assert.equal(document.querySelector(".detail-actions a"), null);
  assert.equal(vm.runInContext("safeLink('javascript:alert(1)')", context), "");
  assert.equal(vm.runInContext("safeImage('assets/../private.svg')", context), "");
  assert.equal(vm.runInContext("safeImage('assets/my-product.webp')", context), "assets/my-product.webp");
});

test("command palette searches and executes keyboard-selected navigation", (t) => {
  const { document, window, click, type } = setup(t);
  click('[data-action="command"]');
  assert.equal(document.querySelector("#command-dialog").open, true);
  type("#command-input", "playground");
  assert.equal(document.querySelectorAll("[data-command-index]").length, 2);
  document.querySelector("#command-input").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  assert.equal(document.querySelector("#command-input").getAttribute("aria-activedescendant"), "command-1");
  document.querySelector("#command-input").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  document.querySelector("#command-input").dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.equal(window.location.hash, "#playground");
  assert.equal(document.querySelector("#command-dialog").open, false);
});

test("direct project links open details, close to work, and reject malformed hashes", (t) => {
  const { document, click, navigate } = setup(t, { hash: "#project/smartgarden" });
  assert.equal(document.querySelector("#project-dialog").open, true);
  assert.equal(document.querySelector("#project-title").textContent, "SmartGarden AI");
  assert.match(document.querySelector(".detail-actions a").href, /^https:\/\/github.com\//);
  click(".dialog-close");
  assert.equal(document.querySelector("#project-dialog").open, false);
  navigate("%E0%A4%A");
  assert.ok(document.querySelector(".hero"));
});

test("studio updates appearance, disables motion, and restores config defaults", (t) => {
  const { document, click, window } = setup(t);
  click('[data-action="studio"]');
  click('button[data-accent="violet"]');
  click('button[data-mode="dark"]');
  assert.equal(document.documentElement.dataset.theme, "dark");
  assert.equal(document.documentElement.dataset.accent, "violet");
  assert.equal(JSON.parse(window.localStorage.getItem("kiet-portfolio:theme")), "dark");
  click("#motion-toggle");
  assert.equal(document.documentElement.dataset.motion, "off");
  click("#inspector-toggle");
  assert.equal(document.documentElement.classList.contains("inspect-mode"), true);
  click('[data-action="reset"]');
  assert.equal(document.documentElement.dataset.theme, "light");
  assert.equal(document.documentElement.dataset.accent, "orange");
  assert.equal(document.documentElement.classList.contains("inspect-mode"), false);
});

test("terminal supports predefined commands, history, safe unknown input, and clear", (t) => {
  const { document, window, type } = setup(t, { hash: "#playground" });
  const run = (text) => {
    type("#terminal-input", text);
    document.querySelector("#terminal-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  };
  run("projects");
  assert.match(document.querySelector("#terminal-output").textContent, /SmartGarden AI/);
  run("<img src=x onerror=alert(1)>");
  assert.equal(document.querySelector("#terminal-output img"), null);
  document.querySelector("#terminal-input").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  assert.equal(document.querySelector("#terminal-input").value, "<img src=x onerror=alert(1)>");
  run("clear");
  assert.equal(document.querySelector("#terminal-output").textContent, "");
  assert.equal(document.querySelector("#terminal-input").value, "");
});

test("demo contact drafts copy safely without claiming to send a message", async (t) => {
  const { document, window, type, copied } = setup(t, { hash: "#contact" });
  type("#contact-name", "Test User");
  type("#contact-email", "test@example.net");
  type("#contact-message", "Mình muốn trao đổi một dự án mới.");
  document.querySelector("#contact-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  await Promise.resolve();
  assert.equal(copied.length, 1);
  assert.match(copied[0], /Test User/);
  assert.match(copied[0], /test@example.net/);
  assert.match(document.querySelector(".toast").textContent, /nội dung mẫu/);
  assert.equal(window.location.protocol, "https:");
});

test("all shipped local asset references exist", (t) => {
  const { context } = setup(t);
  const assets = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((match) => match[1]);
  assets.push(vm.runInContext("siteConfig.hero.artwork", context));
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assets.push(...[...css.matchAll(/url\("(assets\/[^"]+)"\)/g)].map((match) => match[1]));
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset)), asset);
});

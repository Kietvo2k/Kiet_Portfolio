// @ts-check

/** @param {string} selector @param {ParentNode} [scope] @returns {HTMLElement} */
function element(selector, scope = document) {
  const node = scope.querySelector(selector);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing element: ${selector}`);
  return node;
}
/** @param {string} selector @returns {HTMLInputElement} */
function input(selector) {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLInputElement)) throw new Error(`Missing input: ${selector}`);
  return node;
}
/** @param {string} selector @returns {HTMLDialogElement} */
function dialog(selector) {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLDialogElement)) throw new Error(`Missing dialog: ${selector}`);
  return node;
}
/** @param {string | number} value */
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}
/** @param {string} value */
function safeLink(value) {
  if (/^#(?:home|work|about|playground|contact)$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch { return ""; }
}
/** @param {string | undefined} value */
function safeImage(value) {
  if (!value) return "";
  if (/^assets\/[\w./-]+\.(webp|png|jpe?g|svg|avif)$/i.test(value) && !value.includes("..")) return value;
  return safeLink(value).startsWith("https://") ? safeLink(value) : "";
}
/** @param {string} key @returns {unknown} */
function readStore(key) {
  try { return JSON.parse(localStorage.getItem(`kiet-portfolio:${key}`) || "null"); }
  catch { return null; }
}
/** @param {string} key @param {unknown} value */
function writeStore(key, value) {
  try { localStorage.setItem(`kiet-portfolio:${key}`, JSON.stringify(value)); } catch { /* Storage is optional. */ }
}
/** @type {Record<string, string>} */
const icons = {
  "arrow-up-right": '<path d="M7 17 17 7M7 7h10v10"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-up": '<path d="M12 20V4m-6 6 6-6 6 6"/>',
  "arrow-down": '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
  terminal: '<path d="m5 6 6 6-6 6m9 0h6"/>',
  sliders: '<path d="M5 3v7m0 4v7M12 3v12m0 4v2m7-18v3m0 4v11M2 10h6m1 9h6m1-13h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M20 15.7A9 9 0 0 1 8.3 4 9 9 0 1 0 20 15.7Z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  spark: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  layers: '<path d="m2 8 10-5 10 5-10 5Zm0 5 10 5 10-5M2 18l10 5 10-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.1-2-1-2 4-.5 6-2 6-6 0-1-.4-3-1.5-4 .4-1 .4-3 0-4-2 0-3 1-4 2a15 15 0 0 0-5 0C8 3 7 2 5 2c-.4 1-.4 3 0 4C4 7 4 9 4 10c0 4 2 5.5 6 6-1 .5-1 1-1 2v4"/>',
};
/** @param {string} name */
function icon(name) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}
function hydrateIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    if (node instanceof HTMLElement) node.innerHTML = icon(node.dataset.icon || "spark");
  });
}

const root = document.documentElement;
const main = element("#main");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const storedAccent = readStore("accent");
const storedTheme = readStore("theme");
const storedMotion = readStore("motion");
/** @type {string[]} */
const accents = ["orange", "violet", "blue", "green"];
let accent = typeof storedAccent === "string" && accents.includes(storedAccent) ? storedAccent : siteConfig.theme.accent;
let theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : siteConfig.theme.mode;
let motion = typeof storedMotion === "boolean" ? storedMotion : !reducedMotion.matches;
let inspector = false;
const saved = readStore("saved");
/** @type {Set<string>} */
const favorites = new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === "string" && siteConfig.projects.some((project) => project.id === id)) : []);
let currentRoute = "";
let projectCategory = "Tất cả";
let projectQuery = "";
let toastTimer = 0;
/** @type {(() => void) | null} */
let stopParticles = null;
/** @type {(() => void) | null} */
let restartParticles = null;
const categories = ["Tất cả", ...new Set(siteConfig.projects.map((project) => project.category)), "Đã lưu"];
const routes = ["home", "work", "about", "playground", "contact"];

/** @param {string} text */
function toast(text) {
  const node = element(".toast");
  node.textContent = text;
  node.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.classList.remove("visible"), 3500);
}
function applyPreferences() {
  root.dataset.theme = theme;
  root.dataset.accent = accent;
  root.dataset.motion = motion ? "on" : "off";
  root.classList.toggle("inspect-mode", inspector);
  document.querySelectorAll("button[data-accent]").forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-accent") === accent)));
  document.querySelectorAll("button[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-mode") === theme)));
  input("#motion-toggle").checked = motion;
  input("#inspector-toggle").checked = inspector;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f6f5f1" : "#171816");
  restartParticles?.();
}

/** @param {ProjectVisual} type */
function projectArt(type) {
  const visuals = {
    garden: `<div class="garden-app"><div class="mock-sidebar">${icon("spark")}<i></i><i></i><i></i><i></i><span>↗</span></div><div class="garden-content"><div class="mock-top"><b>Good morning, Gardener <span>↗</span></b><span>Overview ⌄</span></div><div class="garden-leaf"><div class="leaf leaf-one"></div><div class="leaf leaf-two"></div><div class="leaf leaf-three"></div><div class="stem"></div><span class="leaf-label">Monstera deliciosa <b>Healthy ↗</b></span></div><div class="garden-metrics"><div><small>MOISTURE</small><strong>64<span>%</span></strong><i></i></div><div><small>TEMPERATURE</small><strong>26<span>°C</span></strong><i></i></div><div><small>LIGHT LEVEL</small><strong>Good</strong><i></i></div></div></div></div>`,
    thermal: `<div class="thermal-app"><div class="thermal-top"><span class="thermal-logo">◈ thermal<span> / analytics</span></span><span class="signal-dot"></span></div><div class="thermal-info"><small>SYSTEM OVERVIEW</small><strong>See beyond<br>the surface<span>.</span></strong><div class="thermal-pills"><span>Real-time data</span><span>Python powered ↗</span></div></div><div class="heatmap"></div><div class="thermal-bottom"><span>LIVE FEED <i></i></span><span>01 — 06</span></div></div>`,
    memories: `<div class="memory-app"><div class="memory-top"><b>a6<span>®</span></b><span>our little universe ↗</span></div><div class="memory-title">the good<br><em>old days.</em></div><div class="polaroid polaroid-one"><div class="memory-landscape"><i></i><b></b></div><span>we were here. '26</span></div><div class="polaroid polaroid-two"><div class="memory-pattern">a6<br>together.</div><span>moments that stay ♡</span></div><span class="memory-star">✳</span></div>`,
    chess: `<div class="chess-art"><div class="chess-board"></div><span class="chess-piece">♞</span><div class="chess-caption">YOUR NEXT MOVE.<small>think. play. repeat.</small></div></div>`,
    orbit: `<div class="orbit-art"><div class="orbit-path"></div><div class="orbit-path second"></div><span class="orbit-center">o.</span><span class="orbit-note note-one">a little idea ↗</span><span class="orbit-note note-two">what if…</span><span class="orbit-note note-three">make it happen.</span><strong>Space for your mind.</strong></div>`,
    particles: `<div class="particle-art"><div class="css-sphere"></div><span>CREATIVE CODING / 001</span><strong>Order in<br>the chaos.</strong></div>`,
  };
  return visuals[type] || visuals.particles;
}
/** @param {Project} project */
function projectCard(project) {
  const active = favorites.has(project.id);
  const image = safeImage(project.image);
  return `<article class="project-card" data-component="ProjectCard" data-reveal>
    <div class="project-visual visual-${escapeHTML(project.visual)}"><button class="project-art-button" data-project="${escapeHTML(project.id)}" aria-label="Xem chi tiết ${escapeHTML(project.title)}"><div class="art-inner" aria-hidden="true">${image ? `<img class="custom-project-image" src="${escapeHTML(image)}" alt="" loading="lazy">` : projectArt(project.visual)}</div><span class="project-open">${icon("arrow-up-right")}</span></button>
    ${image ? "" : '<span class="visual-label">UI CONCEPT</span>'}<button class="save-button ${active ? "saved" : ""}" data-save="${escapeHTML(project.id)}" aria-label="Lưu ${escapeHTML(project.title)}" aria-pressed="${active}">${icon("bookmark")}</button></div>
    <div class="project-meta"><span>${escapeHTML(project.category)}</span><span>${escapeHTML(project.year)}</span></div>
    <button class="project-title" data-project="${escapeHTML(project.id)}">${escapeHTML(project.title)} ${icon("arrow-up-right")}</button>
    <p>${escapeHTML(project.subtitle)}</p><div class="project-tags">${project.tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}</div>
  </article>`;
}
/** @param {string} number @param {string} text */
function sectionLabel(number, text) {
  return `<div class="section-label"><span class="section-number">${number}</span><span>${text}</span></div>`;
}
function homePage() {
  const avatar = safeImage(siteConfig.avatar);
  const artwork = safeImage(siteConfig.hero.artwork) || "assets/hero-sculpture.webp";
  return `<section class="hero container" data-component="Hero">
    <div class="hero-copy"><div class="availability"><span class="${siteConfig.available ? "status-dot" : "offline-dot"}"></span>${escapeHTML(siteConfig.availability)}</div>
    <p class="hero-eyebrow">${escapeHTML(siteConfig.hero.eyebrow)}</p>
    <h1>${escapeHTML(siteConfig.hero.firstLine)}<br><span>${escapeHTML(siteConfig.hero.secondLine)}</span><span class="heading-dot">.</span></h1>
    <p class="hero-description">${escapeHTML(siteConfig.hero.description)}</p>
    <div class="hero-actions"><a class="button button-accent" href="#work">Khám phá sản phẩm ${icon("arrow-up-right")}</a><a class="hero-about" href="#about">Một chút về mình <span>${icon("arrow-right")}</span></a></div>
    <div class="hero-signature"><span class="signature-avatar">${avatar ? `<img src="${escapeHTML(avatar)}" alt="">` : escapeHTML(siteConfig.initials)}<i></i></span><div><strong>${escapeHTML(siteConfig.name)}</strong><span>${escapeHTML(siteConfig.role)}</span></div><span class="signature-scribble" aria-hidden="true">${escapeHTML(siteConfig.shortName.toLowerCase())}.</span></div></div>
    <div class="hero-art" data-component="InteractiveArtwork"><div class="art-grid"></div><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><span class="art-coordinate coordinate-top">FIG. 001 / CREATIVE ENERGY</span><img class="hero-sculpture" src="${escapeHTML(artwork)}" alt="${escapeHTML(siteConfig.hero.artworkAlt)}" width="1024" height="1024" fetchpriority="high"><div class="floating-label floating-code">${icon("code")}<span>Code with purpose<span>Build with curiosity.</span></span><i></i></div><div class="floating-label floating-design">${icon("spark")}<span>A little different.</span></div><span class="art-coordinate coordinate-bottom"><span class="tiny-dot"></span> WHERE LOGIC MEETS IMAGINATION</span><span class="art-cross">+</span></div>
    <div class="hero-bottom"><span>${escapeHTML(siteConfig.hero.note)}</span><a href="#selected-work" data-scroll="selected-work">CUỘN ĐỂ KHÁM PHÁ <span>${icon("arrow-down")}</span></a></div>
  </section>
  <section class="tech-strip" aria-label="Công nghệ và lĩnh vực"><div class="container tech-strip-inner"><span class="tech-intro">Ý TƯỞNG ĐƯỢC XÂY BẰNG</span><div class="tech-items">${siteConfig.skills.map((skill, index) => `<span>${icon(["code", "terminal", "layers", "spark", "sliders", "globe"][index % 6])}${escapeHTML(skill)}</span>`).join("")}</div></div></section>
  <section id="selected-work" class="section container" data-component="SelectedWork">${sectionLabel("01", "SELECTED WORK")}<div class="section-heading"><div><h2>Không chỉ là ý tưởng<span class="accent">.</span></h2><p>Một vài điều mình đã và đang đưa vào thế giới.</p></div><a class="text-link" href="#work">Tất cả sản phẩm <span class="count-badge">${String(siteConfig.projects.length).padStart(2, "0")}</span>${icon("arrow-up-right")}</a></div><div class="projects-grid home-projects">${siteConfig.projects.filter((project) => project.featured).slice(0, 3).map(projectCard).join("")}</div></section>
  <section class="about-preview container" data-component="AboutPreview" data-reveal><div class="about-preview-title">${sectionLabel("02", "THE HUMAN BEHIND THE CODE")}<h2>Tư duy kỹ thuật.<br>Trái tim sáng tạo<span class="accent">.</span></h2><a class="text-link" href="#about">Gặp người đứng sau ${icon("arrow-up-right")}</a></div><div class="about-preview-content"><p>${escapeHTML(siteConfig.about.philosophy)}</p><div class="mini-principles"><span>${icon("globe")} Tư duy sản phẩm</span><span>${icon("spark")} Luôn tò mò</span><span>${icon("code")} Học bằng cách làm</span></div><div class="currently"><span class="status-dot"></span><span>${escapeHTML(siteConfig.about.currently)}</span></div></div></section>
  <section class="lab-preview container" data-component="PlaygroundPreview" data-reveal><div class="lab-preview-copy">${sectionLabel("03", "JUST FOR THE FUN OF IT")}<span class="lab-tag">EXPERIMENTAL SPACE</span><h2>Một góc nhỏ.<br>Vô hạn khả năng<span>✳</span></h2><p>Nơi code được phép nghịch ngợm. Chơi với những hạt chuyển động, mở terminal và khám phá vài điều bất ngờ.</p><a class="button button-light" href="#playground">Bước vào Playground ${icon("arrow-up-right")}</a></div><div class="lab-preview-art" aria-hidden="true"><div class="css-sphere"></div><span class="lab-coordinate">x: ∞ &nbsp; y: curiosity</span><span class="lab-corner">INTERACTIVE<br>BY NATURE</span></div></section>
  ${contactBanner()}`;
}
function contactBanner() {
  return `<section class="contact-banner container" data-component="ContactBanner" data-reveal><div class="contact-pretitle"><span class="status-dot"></span> MỌI ĐIỀU THÚ VỊ ĐỀU BẮT ĐẦU BẰNG MỘT LỜI CHÀO.</div><a href="#contact"><h2>Cùng xây điều<br><span>tiếp theo.</span></h2><span class="contact-round">${icon("arrow-up-right")}</span></a><div class="contact-banner-bottom"><p>Có một ý tưởng hay? Mình muốn nghe đấy.</p><span>${escapeHTML(siteConfig.location)} <span class="tiny-dot"></span> OPEN TO THE WORLD</span></div></section>`;
}
function workPage() {
  return `<section class="page-intro container">${sectionLabel("01", "THE PROJECT COLLECTION")}<div class="page-heading"><h1>Ý tưởng.<br>Sản phẩm. <span>Khác biệt.</span></h1><p>Mỗi sản phẩm là một câu chuyện về những gì mình đã học, đã thử và muốn làm tốt hơn.</p></div><div class="collection-note">${icon("layers")}Giao diện trong thẻ là concept minh họa. Chi tiết dự án có liên kết mã nguồn và ghi rõ ý tưởng mẫu.</div></section>
  <section class="container work-collection" data-component="ProjectCollection"><div class="work-toolbar"><div class="filter-tabs" role="group" aria-label="Lọc sản phẩm">${categories.map((category) => `<button data-filter="${escapeHTML(category)}" aria-pressed="${category === projectCategory}">${category === "Đã lưu" ? icon("bookmark") : ""}${escapeHTML(category)}</button>`).join("")}</div><label class="project-search">${icon("search")}<input id="project-search" type="search" aria-label="Tìm sản phẩm" placeholder="Tìm sản phẩm…" value="${escapeHTML(projectQuery)}"></label></div><div class="collection-status" role="status" aria-live="polite"></div><div class="projects-grid" id="project-grid"></div></section>${contactBanner()}`;
}
function renderProjects() {
  const query = projectQuery.trim().toLocaleLowerCase("vi");
  const projects = siteConfig.projects.filter((project) => (projectCategory === "Tất cả" || (projectCategory === "Đã lưu" ? favorites.has(project.id) : project.category === projectCategory)) && `${project.title} ${project.description} ${project.tags.join(" ")}`.toLocaleLowerCase("vi").includes(query));
  element("#project-grid").innerHTML = projects.length ? projects.map(projectCard).join("") : `<div class="empty-state">${icon("search")}<h2>Chưa tìm thấy sản phẩm.</h2><p>Thử một từ khóa khác${projectCategory === "Đã lưu" ? " hoặc lưu một sản phẩm bằng biểu tượng bookmark" : ""} nhé.</p><button class="button button-outline" data-action="clear-filters">Xem tất cả sản phẩm ${icon("arrow-right")}</button></div>`;
  element(".collection-status").textContent = `${String(projects.length).padStart(2, "0")} SẢN PHẨM / ${projectCategory.toLocaleUpperCase("vi")}`;
  document.querySelectorAll("[data-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-filter") === projectCategory)));
  revealElements();
}
function aboutPage() {
  return `<section class="page-intro container">${sectionLabel("02", "A LITTLE ABOUT ME")}<div class="page-heading"><h1>Đằng sau code,<br>là một người <span>tò mò.</span></h1><p>${escapeHTML(siteConfig.role)}<br>Based in ${escapeHTML(siteConfig.location)}. Thinking everywhere.</p></div></section>
  <section class="about-grid container" data-component="AboutStory"><div class="profile-card"><span class="profile-edition">THE BUILDER / ${new Date().getFullYear()}</span><div class="profile-monogram">${escapeHTML(siteConfig.initials)}<span>✳</span></div><div class="profile-info"><h2>${escapeHTML(siteConfig.name)}</h2><span>${escapeHTML(siteConfig.role)}</span></div><div class="profile-location">${icon("globe")} ${escapeHTML(siteConfig.location)}<span class="local-time"></span></div></div><div class="about-story"><span class="eyebrow">HELLO, WORLD.</span><h2>${escapeHTML(siteConfig.about.headline).replace(/\n/g, "<br>")}</h2><p>${escapeHTML(siteConfig.about.description)}</p><p>${escapeHTML(siteConfig.about.philosophy)}</p><div class="currently"><span class="status-dot"></span>${escapeHTML(siteConfig.about.currently)}</div><a class="button button-dark" href="#contact">Kết nối với mình ${icon("arrow-up-right")}</a></div></section>
  <section class="section container" data-component="Principles">${sectionLabel("A", "WHAT I BELIEVE IN")}<div class="section-heading"><h2>Cách mình tạo ra giá trị<span class="accent">.</span></h2></div><div class="principles-grid">${siteConfig.about.principles.map((principle, index) => `<article data-reveal><span class="principle-number">0${index + 1} /</span>${icon(["globe", "code", "spark"][index % 3])}<h3>${escapeHTML(principle.title)}</h3><p>${escapeHTML(principle.description)}</p></article>`).join("")}</div></section>
  <section class="journey-section container" data-component="Journey"><div>${sectionLabel("B", "ALWAYS IN PROGRESS")}<h2>Hành trình<br>vẫn đang tiếp diễn<span class="accent">.</span></h2><p>Không phải một đường thẳng.<br>Nhưng luôn tiến về phía trước.</p></div><div class="timeline">${siteConfig.about.journey.map((milestone) => `<article data-reveal><span class="eyebrow">${escapeHTML(milestone.date)}</span><h3>${escapeHTML(milestone.title)}</h3><p>${escapeHTML(milestone.description)}</p></article>`).join("")}</div></section><section class="skills-section container"><span class="eyebrow">MY EVER-EVOLVING TOOLBOX</span><div>${siteConfig.skills.map((skill) => `<span>${escapeHTML(skill)} ${icon("arrow-up-right")}</span>`).join("")}</div></section>${contactBanner()}`;
}
function playgroundPage() {
  return `<section class="page-intro container">${sectionLabel("03", "A SPACE FOR HAPPY ACCIDENTS")}<div class="page-heading"><h1>Ít quy tắc hơn.<br>Nhiều <span>“what if?”</span> hơn.</h1><p>Một phòng thí nghiệm nhỏ cho những ý tưởng chưa cần nghiêm túc. Chạm, kéo, gõ. Cứ thử đi.</p></div></section>
  <section class="playground-grid container" data-component="ParticlePlayground"><div class="particle-stage"><div class="stage-top"><span><i class="status-dot"></i> PARTICLE FIELD</span><span>EXPERIMENT 001</span></div><canvas id="particle-canvas" aria-label="Hoạt cảnh các hạt tạo thành hình cầu hoặc vòng xoắn"></canvas><div class="stage-caption"><span>Move your cursor.<br><b>Make a little chaos.</b></span><span id="particle-count">360 PARTICLES</span></div></div>
  <div class="lab-controls"><span class="eyebrow">YOU’RE IN CONTROL</span><h2>Chút toán học.<br>Chút ma thuật.</h2><p>Các điểm trong không gian 3D được chiếu lên một mặt phẳng 2D. Không thư viện 3D. Chỉ Canvas và sự tò mò.</p><fieldset><legend>Hình dạng</legend><div class="segmented"><button data-shape="sphere" aria-pressed="true">Hình cầu</button><button data-shape="helix" aria-pressed="false">Vòng xoắn</button></div></fieldset><label class="range-label" for="particle-speed">Tốc độ <output id="speed-value">0.6×</output></label><input id="particle-speed" type="range" min="0" max="2" step="0.1" value="0.6"><label class="range-label" for="particle-density">Mật độ <output id="density-value">360</output></label><input id="particle-density" type="range" min="80" max="600" step="20" value="360"><div class="lab-controls-bottom"><button class="button button-dark" data-action="pause-particles">${icon("play")}<span>${motion ? "Tạm dừng" : "Tiếp tục"}</span></button><button class="icon-button" data-action="reset-particles" aria-label="Khôi phục hoạt cảnh">↺</button></div><p class="lab-hint">Hỗ trợ giảm chuyển động. Tự dừng khi bạn chuyển tab.</p></div></section>
  <section class="terminal-section container" data-component="InteractiveTerminal"><div class="terminal-description"><span class="eyebrow">EXPERIMENT 002</span><h2>Portfolio,<br>phiên bản terminal<span class="accent">.</span></h2><p>Một lối đi khác dành cho những người thích bàn phím hơn chuột. Gõ <code>help</code> để bắt đầu.</p><div class="terminal-suggestions"><button data-command="whoami">whoami ↵</button><button data-command="projects">projects ↵</button><button data-command="surprise">surprise ↵</button></div><small>Terminal mô phỏng — chỉ chạy các lệnh có sẵn, không truy cập hệ thống.</small></div><div class="terminal-window"><div class="terminal-titlebar"><span><i></i><i></i><i></i></span><span>visitor@${escapeHTML(siteConfig.shortName.toLowerCase())} ~ portfolio</span>${icon("terminal")}</div><div class="terminal-output" id="terminal-output" role="log" aria-live="polite"><p><span class="terminal-accent">Welcome to ${escapeHTML(siteConfig.shortName)} OS.</span> [Version 1.0.0]</p><p>Mọi ý tưởng lớn đều bắt đầu từ một dòng nhỏ.<br>Gõ <b>help</b> để khám phá.</p></div><form id="terminal-form"><label for="terminal-input">visitor <span>~ $</span></label><input id="terminal-input" autocomplete="off" spellcheck="false" aria-label="Nhập lệnh terminal" placeholder="help"><button type="submit" aria-label="Chạy lệnh">${icon("arrow-right")}</button></form></div></section>
  <section class="experiments-banner container"><span>✳</span><div><h3>Giao diện này cũng là một playground.</h3><p>Thử đổi màu, bật chế độ tối hoặc nhìn xuyên thiết kế bằng Design X-ray.</p></div><button class="button button-outline" data-action="studio">Mở Design Studio ${icon("sliders")}</button></section>${contactBanner()}`;
}
function contactPage() {
  return `<section class="page-intro container">${sectionLabel("04", "LET’S MAKE SOMETHING GOOD")}<div class="page-heading"><h1>Ý tưởng của bạn.<br><span>Chương tiếp theo.</span></h1><p>Một dự án, một câu hỏi hay chỉ là lời chào. Hộp thư của mình luôn mở.</p></div></section><section class="contact-grid container" data-component="Contact"><div class="contact-info"><div class="availability"><span class="${siteConfig.available ? "status-dot" : "offline-dot"}"></span>${escapeHTML(siteConfig.availability)}</div><h2>Cùng bắt đầu<br>một cuộc trò chuyện.</h2><p>Mình muốn gặp những người có cùng sự tò mò, cùng xây sản phẩm hoặc đơn giản là trao đổi một ý tưởng thú vị.</p><div class="contact-email"><span class="eyebrow">DROP ME A LINE</span><button class="email-copy" data-action="copy-email">${escapeHTML(siteConfig.email)} ${icon("copy")}</button>${siteConfig.emailIsPlaceholder ? '<small>Email mẫu — thay bằng email của bạn trong site.config.js.</small>' : ""}</div><a class="contact-social" href="${escapeHTML(safeLink(siteConfig.github))}" target="_blank" rel="noopener noreferrer">${icon("github")}Khám phá GitHub ${icon("arrow-up-right")}</a><div class="contact-location">${icon("globe")}<span>${escapeHTML(siteConfig.location)}<small class="local-time"></small></span><span>LOCAL TIME</span></div></div><form id="contact-form" class="contact-form"><span class="eyebrow">TELL ME ABOUT YOUR IDEA</span><h3>Bắt đầu từ một lời chào.</h3><label for="contact-name">Tên của bạn <span>*</span></label><input id="contact-name" name="name" autocomplete="name" required maxlength="100" placeholder="Mình nên gọi bạn là gì?"><label for="contact-email">Email <span>*</span></label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><label for="contact-topic">Bạn muốn nói về…</label><select id="contact-topic" name="topic"><option>Một dự án mới</option>Hợp tác & kết nối</option>Cơ hội học tập</option>Chỉ muốn chào thôi</option></select><label for="contact-message">Ý tưởng của bạn <span>*</span></label><textarea id="contact-message" name="message" rows="4" required minlength="10" maxlength="5000" placeholder="Kể mình nghe một chút nhé…"></textarea><button type="submit" class="button button-accent full-width">Soạn email ${icon("arrow-up-right")}</button><p class="form-note">${siteConfig.emailIsPlaceholder ? "Đang dùng email mẫu. Bạn có thể sao chép nội dung để thử prototype." : "Mở ứng dụng email của bạn với nội dung đã điền. Website không lưu hay gửi dữ liệu."}</p><button type="button" class="text-button full-width" data-action="copy-message">Sao chép nội dung thay thế ${icon("copy")}</button></form></section>`;
}

/** @param {string} id */
function openProject(id) {
  const project = siteConfig.projects.find((item) => item.id === id);
  if (!project) return;
  const url = safeLink(project.url);
  const image = safeImage(project.image);
  element("#project-detail").innerHTML = `<div class="detail-art visual-${escapeHTML(project.visual)}"><div class="art-inner" aria-hidden="true">${image ? `<img class="custom-project-image" src="${escapeHTML(image)}" alt="">` : projectArt(project.visual)}</div>${image ? "" : '<span class="visual-label">CONCEPT MINH HỌA / KHÔNG PHẢI ẢNH CHỤP SẢN PHẨM</span>'}</div><div class="detail-content"><div class="detail-eyebrow"><span>${escapeHTML(project.category)}</span><span>${escapeHTML(project.status)}</span></div><h2 id="project-title">${escapeHTML(project.title)}</h2><p class="detail-description">${escapeHTML(project.description)}</p><div class="detail-facts"><div><span>VAI TRÒ</span><p>${escapeHTML(project.role)}</p></div><div><span>STACK</span><p>${project.tags.map(escapeHTML).join(" / ")}</p></div></div><div class="case-sections">${[["01", "Bài toán", project.challenge], ["02", "Cách tiếp cận", project.approach], ["03", "Điều mang theo", project.learning]].map(([number, title, text]) => `<section><span>${number}</span><div><h3>${title}</h3><p>${escapeHTML(text)}</p></div></section>`).join("")}</div><div class="detail-actions">${url ? `<a class="button button-accent" href="${escapeHTML(url)}" ${url.startsWith("#") ? 'data-close' : 'target="_blank" rel="noopener noreferrer"'}>${escapeHTML(project.linkLabel)} ${icon("arrow-up-right")}</a>` : '<span class="concept-note">Ý tưởng mẫu — chưa có bản phát hành.</span>'}<button class="button button-outline" data-share="${escapeHTML(project.id)}">${icon("copy")}Chia sẻ</button></div></div>`;
  dialog("#command-dialog").close();
  dialog("#project-dialog").showModal();
  element("#project-dialog").scrollTop = 0;
}
let isFirstRoute = true;
function renderRoute() {
  let hash = "";
  try { hash = decodeURI(location.hash.slice(1)); } catch { hash = "home"; }
  if (hash === "main" || hash === "selected-work") {
    if (currentRoute === "home") {
      element(hash === "main" ? "#main" : "#selected-work").scrollIntoView({ behavior: motion ? "smooth" : "instant" });
      return;
    }
  }
  const requested = hash.split("/")[0] || "home";
  const route = requested === "project" ? "work" : routes.includes(requested) ? requested : "home";
  if (currentRoute !== route) {
    stopParticles?.();
    stopParticles = null;
    restartParticles = null;
    currentRoute = route;
    const pages = { home: homePage, work: workPage, about: aboutPage, playground: playgroundPage, contact: contactPage };
    main.innerHTML = pages[/** @type {keyof typeof pages} */ (route)]();
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.getAttribute("data-nav") === route) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const titles = { home: "Creative Developer & AI Builder", work: "Sản phẩm", about: "Về tôi", playground: "Playground", contact: "Kết nối" };
    document.title = `${siteConfig.shortName} — ${titles[/** @type {keyof typeof titles} */ (route)]}`;
    if (route === "work") renderProjects();
    if (route === "playground") setupParticles();
    revealElements();
    updateClock();
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!isFirstRoute) main.focus({ preventScroll: true });
    isFirstRoute = false;
  }
  element("#mobile-nav").hidden = true;
  element(".mobile-toggle").setAttribute("aria-expanded", "false");
  if (requested === "project") openProject(hash.slice("project/".length));
  else if (dialog("#project-dialog").open) dialog("#project-dialog").close();
}
/** @type {IntersectionObserver | null} */
const revealObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver?.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }) : null;
function revealElements() {
  document.querySelectorAll("[data-reveal]").forEach((node) => {
    if (revealObserver && motion) revealObserver.observe(node);
    else node.classList.add("in-view");
  });
}

function setupParticles() {
  const canvas = document.querySelector("#particle-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const controller = new AbortController();
  const signal = controller.signal;
  let shape = "sphere";
  let count = 360;
  let speed = 0.6;
  let paused = !motion;
  let angle = 0;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let lastTime = 0;
  let width = 0;
  let height = 0;
  /** @type {{x:number, y:number, z:number}[]} */
  let points = [];
  function generatePoints() {
    points = Array.from({ length: count }, (_, index) => {
      const t = index / count;
      if (shape === "helix") {
        const a = t * Math.PI * 12;
        return { x: Math.cos(a) * 0.72, y: (t - 0.5) * 2, z: Math.sin(a) * 0.72 };
      }
      const phi = Math.acos(1 - 2 * (index + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      return { x: Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta) };
    });
  }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * 0.32;
    const rotation = angle + pointerX * 0.45;
    const tilt = 0.2 + pointerY * 0.4;
    const color = { orange: "247, 128, 80", violet: "173, 153, 255", blue: "100, 172, 255", green: "135, 218, 154" }[accent] || "247, 128, 80";
    const projected = points.map((point) => {
      const x = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
      const depth = point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
      const y = point.y * Math.cos(tilt) - depth * Math.sin(tilt);
      const z = point.y * Math.sin(tilt) + depth * Math.cos(tilt);
      const perspective = 3.5 / (3.5 + z);
      return { x: width / 2 + x * scale * perspective, y: height / 2 + y * scale * perspective, z, perspective };
    }).sort((a, b) => b.z - a.z);
    for (const point of projected) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, (1.35 + (1 - point.z) * 0.5) * point.perspective, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${0.3 + (1 - point.z) * 0.32})`;
      ctx.fill();
    }
  }
  /** @param {number} time */
  function tick(time) {
    if (paused || !motion || document.hidden) { frame = 0; return; }
    const delta = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    angle += delta * 0.0003 * speed;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    element('[data-action="pause-particles"] span').textContent = paused || !motion ? "Tiếp tục" : "Tạm dừng";
    draw();
    if (!paused && motion && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (!(canvas instanceof HTMLCanvasElement) || !ctx) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  main.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.shape) {
      shape = button.dataset.shape;
      document.querySelectorAll("[data-shape]").forEach((item) => item.setAttribute("aria-pressed", String(item.getAttribute("data-shape") === shape)));
      generatePoints(); draw();
    }
    if (button.dataset.action === "pause-particles") {
      if (!motion) { motion = true; paused = false; writeStore("motion", true); applyPreferences(); }
      else paused = !paused;
      update();
    }
    if (button.dataset.action === "reset-particles") {
      speed = 0.6; count = 360; shape = "sphere"; angle = 0; pointerX = 0; pointerY = 0; paused = !motion;
      input("#particle-speed").value = "0.6";
      input("#particle-density").value = "360";
      element("#speed-value").textContent = "0.6×";
      element("#density-value").textContent = "360";
      element("#particle-count").textContent = "360 PARTICLES";
      document.querySelectorAll("[data-shape]").forEach((item) => item.setAttribute("aria-pressed", String(item.getAttribute("data-shape") === shape)));
      generatePoints(); update();
    }
  }, { signal });
  input("#particle-speed").addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement) {
      speed = Number(event.target.value);
      element("#speed-value").textContent = `${speed.toFixed(1)}×`;
    }
  }, { signal });
  input("#particle-density").addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement) {
      count = Number(event.target.value);
      element("#density-value").textContent = String(count);
      element("#particle-count").textContent = `${count} PARTICLES`;
      generatePoints(); draw();
    }
  }, { signal });
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    if (motion) draw();
  }, { signal });
  document.addEventListener("visibilitychange", update, { signal });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  generatePoints(); resize(); update();
  restartParticles = update;
  stopParticles = () => { controller.abort(); observer.disconnect(); cancelAnimationFrame(frame); };
}

/** @typedef {{label: string, description: string, symbol: string, action: () => void}} Command */
/** @type {Command[]} */
let commandResults = [];
let selectedCommand = 0;
/** @returns {Command[]} */
function commands() {
  return [
    ...[["home", "Tổng quan"], ["work", "Tất cả sản phẩm"], ["about", "Về tôi"], ["playground", "Playground"], ["contact", "Kết nối"]].map(([route, label]) => ({ label, description: "Đi đến trang", symbol: "arrow-up-right", action: () => { location.hash = route; } })),
    ...siteConfig.projects.map((project) => ({ label: project.title, description: project.category, symbol: "layers", action: () => openProject(project.id) })),
    { label: "Đổi sáng / tối", description: "Thay đổi không gian", symbol: "moon", action: () => { theme = theme === "light" ? "dark" : "light"; writeStore("theme", theme); applyPreferences(); } },
    { label: "Design Studio", description: "Màu sắc, chuyển động & Design X-ray", symbol: "sliders", action: () => dialog("#studio-dialog").showModal() },
    { label: "Sao chép email", description: siteConfig.email, symbol: "copy", action: () => { void copyText(siteConfig.email, "Đã sao chép email."); } },
  ];
}
function renderCommands() {
  const query = input("#command-input").value.trim().toLocaleLowerCase("vi");
  commandResults = commands().filter((command) => `${command.label} ${command.description}`.toLocaleLowerCase("vi").includes(query));
  selectedCommand = 0;
  element("#command-results").innerHTML = commandResults.length ? commandResults.map((command, index) => `<button role="option" id="command-${index}" tabindex="-1" aria-selected="${index === 0}" data-command-index="${index}"><span class="command-symbol">${icon(command.symbol)}</span><span>${escapeHTML(command.label)}<small>${escapeHTML(command.description)}</small></span>${icon("arrow-right")}</button>`).join("") : '<p class="command-empty">Không tìm thấy. Thử “sản phẩm”, “theme” hoặc tên dự án.</p>';
  if (commandResults.length) input("#command-input").setAttribute("aria-activedescendant", "command-0");
  else input("#command-input").removeAttribute("aria-activedescendant");
}
function openCommands() {
  input("#command-input").value = "";
  renderCommands();
  dialog("#command-dialog").showModal();
  input("#command-input").focus();
}
/** @param {number} index */
function runCommand(index) {
  const command = commandResults[index];
  if (!command) return;
  dialog("#command-dialog").close();
  command.action();
}
input("#command-input").addEventListener("input", renderCommands);
input("#command-input").addEventListener("keydown", (event) => {
  if (!commandResults.length) return;
  if (event.key === "Enter") { event.preventDefault(); runCommand(selectedCommand); }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    selectedCommand = (selectedCommand + (event.key === "ArrowDown" ? 1 : -1) + commandResults.length) % commandResults.length;
    document.querySelectorAll("[data-command-index]").forEach((button, index) => button.setAttribute("aria-selected", String(index === selectedCommand)));
    input("#command-input").setAttribute("aria-activedescendant", `command-${selectedCommand}`);
    element(`#command-${selectedCommand}`).scrollIntoView({ block: "nearest" });
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (dialog("#command-dialog").open) dialog("#command-dialog").close();
    else if (!document.querySelector("dialog[open]")) openCommands();
  }
});

const terminalHistory = /** @type {string[]} */ ([]);
let terminalHistoryIndex = 0;
/** @param {string} text */
function terminalCommand(text) {
  const command = text.trim().toLowerCase();
  if (!command) return;
  const output = element("#terminal-output");
  terminalHistory.push(text.trim());
  terminalHistoryIndex = terminalHistory.length;
  input("#terminal-input").value = "";
  if (command === "clear") { output.replaceChildren(); input("#terminal-input").focus(); return; }
  const prompt = document.createElement("p");
  prompt.className = "terminal-prompt";
  prompt.textContent = `visitor ~ $ ${text}`;
  output.append(prompt);
  const reply = document.createElement("p");
  const replies = {
    help: "Các lệnh có sẵn:\nwhoami    → Người đứng sau portfolio\nprojects  → Các sản phẩm\nskills    → Bộ công cụ\ncontact   → Email liên hệ\ntheme     → Đổi sáng / tối\nsurprise  → Một chút bất ngờ\nclear     → Dọn terminal\n\nMẹo: ↑ / ↓ để gọi lại lệnh. Ctrl/⌘ K mở lối tắt.",
    whoami: `${siteConfig.name}\n${siteConfig.role}\n${siteConfig.location}\n\n${siteConfig.about.currently}`,
    projects: siteConfig.projects.map((project, index) => `${String(index + 1).padStart(2, "0")}  ${project.title} — ${project.status}`).join("\n"),
    skills: siteConfig.skills.join("  /  "),
    contact: `${siteConfig.email}${siteConfig.emailIsPlaceholder ? "\n[Email mẫu — có thể sửa trong site.config.js]" : ""}`,
    theme: "Đã đổi không gian. Một góc nhìn mới cũng là một khởi đầu.",
    surprise: "      *\n   *  |  *\n * —  ✳  — *\n   *  |  *\n      *\n\nBạn vừa tìm thấy một easter egg.\n01001000 01101001 = Hi.\n\nKeep building. The world needs your weird little ideas.",
  };
  reply.textContent = replies[/** @type {keyof typeof replies} */ (command)] || `Không tìm thấy lệnh “${text}”. Gõ help để xem các lệnh có sẵn.`;
  if (command === "theme") { theme = theme === "light" ? "dark" : "light"; writeStore("theme", theme); applyPreferences(); }
  if (command === "surprise") { reply.className = "terminal-accent"; if (motion) element(".terminal-window").animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-0.6deg)" }, { transform: "rotate(0.6deg)" }, { transform: "rotate(0deg)" }], { duration: 400 }); }
  output.append(reply);
  while (output.childElementCount > 60) output.firstElementChild?.remove();
  output.scrollTop = output.scrollHeight;
  input("#terminal-input").value = "";
  input("#terminal-input").focus();
}

/** @param {string} text @param {string} success */
async function copyText(text, success) {
  try {
    await navigator.clipboard.writeText(text);
    toast(success);
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.className = "clipboard-fallback";
    const active = document.activeElement;
    (document.querySelector("dialog[open]") || document.body).append(fallback);
    fallback.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { copied = false; }
    fallback.remove();
    if (active instanceof HTMLElement) active.focus();
    toast(copied ? success : "Không thể sao chép tự động. Hãy chọn nội dung và sao chép thủ công.");
  }
}
function messageDraft() {
  const form = element("#contact-form");
  if (!(form instanceof HTMLFormElement)) return null;
  if (!form.reportValidity()) return null;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const topic = String(data.get("topic") || "");
  const message = String(data.get("message") || "").trim();
  if (!name || message.length < 10) { toast("Vui lòng nhập tên và lời nhắn ít nhất 10 ký tự."); return null; }
  return { subject: `${topic} — ${name}`, body: `Xin chào ${siteConfig.shortName},\n\n${message}\n\n${name}\n${email}` };
}
document.addEventListener("submit", (event) => {
  if (!(event.target instanceof HTMLFormElement)) return;
  if (event.target.id === "terminal-form") { event.preventDefault(); terminalCommand(input("#terminal-input").value); }
  if (event.target.id === "contact-form") {
    event.preventDefault();
    const draft = messageDraft();
    if (!draft) return;
    if (siteConfig.emailIsPlaceholder) {
      void copyText(`${draft.subject}\n\n${draft.body}`, "Đã sao chép nội dung mẫu. Hãy cấu hình email thật để liên hệ.");
    } else {
      location.href = `mailto:${encodeURIComponent(siteConfig.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
      toast("Đang mở ứng dụng email. Chưa gửi? Bạn có thể sao chép nội dung.");
    }
  }
});
document.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement && event.target.id === "project-search") {
    projectQuery = event.target.value; renderProjects();
  }
});
document.addEventListener("keydown", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.id !== "terminal-input") return;
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    terminalHistoryIndex = Math.max(0, Math.min(terminalHistory.length, terminalHistoryIndex + (event.key === "ArrowUp" ? -1 : 1)));
    event.target.value = terminalHistory[terminalHistoryIndex] || "";
  }
});
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("button, a");
  if (!(target instanceof HTMLElement)) return;
  const data = target.dataset;
  if (data.close !== undefined) target.closest("dialog")?.close();
  if (data.project) openProject(data.project);
  if (data.save) {
    const id = data.save;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    writeStore("saved", [...favorites]);
    document.querySelectorAll("[data-save]").forEach((button) => {
      const active = favorites.has(button.getAttribute("data-save") || "");
      button.classList.toggle("saved", active); button.setAttribute("aria-pressed", String(active));
    });
    if (currentRoute === "work" && projectCategory === "Đã lưu") renderProjects();
    toast(favorites.has(id) ? "Đã lưu sản phẩm vào bộ sưu tập của bạn." : "Đã bỏ lưu sản phẩm.");
  }
  if (data.share) {
    const url = new URL(location.href); url.hash = `project/${data.share}`;
    void copyText(url.href, "Đã sao chép liên kết dự án.");
  }
  if (data.filter) { projectCategory = data.filter; renderProjects(); }
  if (data.commandIndex !== undefined) runCommand(Number(data.commandIndex));
  if (data.command) terminalCommand(data.command);
  if (data.accent && accents.includes(data.accent)) { accent = data.accent; writeStore("accent", accent); applyPreferences(); }
  if (data.mode === "dark" || data.mode === "light") { theme = data.mode; writeStore("theme", theme); applyPreferences(); }
  if (data.scroll) { event.preventDefault(); element(`#${data.scroll}`).scrollIntoView({ behavior: motion ? "smooth" : "instant" }); }
  switch (data.action) {
    case "command": openCommands(); break;
    case "studio": dialog("#studio-dialog").showModal(); break;
    case "menu": {
      const menu = element("#mobile-nav");
      menu.hidden = !menu.hidden; target.setAttribute("aria-expanded", String(!menu.hidden)); break;
    }
    case "top": window.scrollTo({ top: 0, behavior: motion ? "smooth" : "instant" }); break;
    case "copy-email": void copyText(siteConfig.email, "Đã sao chép email."); break;
    case "copy-message": {
      const draft = messageDraft();
      if (draft) void copyText(`${draft.subject}\n\n${draft.body}`, "Đã sao chép lời nhắn. Bạn có thể dán vào ứng dụng email.");
      break;
    }
    case "clear-filters": projectCategory = "Tất cả"; projectQuery = ""; input("#project-search").value = ""; renderProjects(); break;
    case "reset":
      accent = siteConfig.theme.accent; theme = siteConfig.theme.mode; motion = !reducedMotion.matches; inspector = false;
      writeStore("accent", accent); writeStore("theme", theme); writeStore("motion", motion); applyPreferences(); toast("Đã khôi phục giao diện mặc định."); break;
  }
});
input("#motion-toggle").addEventListener("change", () => { motion = input("#motion-toggle").checked; writeStore("motion", motion); applyPreferences(); revealElements(); });
input("#inspector-toggle").addEventListener("change", () => { inspector = input("#inspector-toggle").checked; applyPreferences(); });
reducedMotion.addEventListener("change", () => {
  if (readStore("motion") === null) { motion = !reducedMotion.matches; applyPreferences(); }
});
document.querySelectorAll("dialog").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
  });
  modal.addEventListener("close", () => {
    if (modal.id === "project-dialog" && location.hash.startsWith("#project/")) history.replaceState(null, "", "#work");
  });
});
document.addEventListener("pointermove", (event) => {
  if (!motion || event.pointerType === "touch") return;
  const artwork = document.querySelector(".hero-art");
  if (!(artwork instanceof HTMLElement)) return;
  const bounds = artwork.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left - bounds.width / 2) / bounds.width));
  const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top - bounds.height / 2) / bounds.height));
  artwork.style.setProperty("--pointer-x", `${x * 13}px`);
  artwork.style.setProperty("--pointer-y", `${y * 10}px`);
});
function updateClock() {
  let time = "";
  try {
    time = new Intl.DateTimeFormat("en-GB", { timeZone: siteConfig.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
  } catch { time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date()); }
  document.querySelectorAll(".local-time").forEach((node) => { node.textContent = `${time} / ${siteConfig.location}`; });
}
window.addEventListener("scroll", () => {
  const available = document.documentElement.scrollHeight - innerHeight;
  element(".scroll-progress").style.width = `${available > 0 ? scrollY / available * 100 : 0}%`;
  element(".site-header").classList.toggle("scrolled", scrollY > 20);
}, { passive: true });
window.addEventListener("hashchange", renderRoute);
document.querySelectorAll(".brand-name").forEach((node) => { node.textContent = siteConfig.shortName; });
element(".owner-name").textContent = siteConfig.name;
element("#copyright-year").textContent = String(new Date().getFullYear());
element(".nav-count").textContent = String(siteConfig.projects.length).padStart(2, "0");
element(".footer-github").setAttribute("href", safeLink(siteConfig.github));
document.querySelector('meta[name="description"]')?.setAttribute("content", siteConfig.hero.description);
element(".command-trigger kbd").textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K";
hydrateIcons();
applyPreferences();
renderRoute();
setInterval(updateClock, 30_000);

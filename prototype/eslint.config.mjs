export default [
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script" },
    rules: {
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-unsafe-finally": "error",
      "no-constant-binary-expression": "error",
      "eqeqeq": "error",
      "no-var": "error",
      "prefer-const": "error"
    }
  }
];

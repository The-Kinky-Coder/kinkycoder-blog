const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

loadLanguages([
  "markup",
  "css",
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "json",
  "bash",
  "clike",
  "c",
  "cpp",
  "csharp",
  "java",
  "python",
  "ruby",
  "go",
  "rust",
  "php",
  "sql",
  "yaml",
  "toml"
]);

const languageAliases = {
  js: "javascript",
  node: "javascript",
  nodejs: "javascript",
  ts: "typescript",
  "c#": "csharp",
  cs: "csharp",
  "c++": "cpp",
  html: "markup",
  shell: "bash",
  sh: "bash",
  yml: "yaml"
};

const languageLabels = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  csharp: "C#",
  cpp: "C++",
  c: "C",
  bash: "Shell",
  json: "JSON",
  markup: "HTML",
  css: "CSS",
  python: "Python",
  java: "Java",
  php: "PHP",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  sql: "SQL",
  yaml: "YAML",
  toml: "TOML"
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeCssColor = (value) => {
  if (!value && value !== 0) {
    return "";
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return "";
  }
  const allowed = [
    /^#[0-9a-fA-F]{3,8}$/,
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/,
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*(0|1|0?\.\d+)\s*\)$/,
    /^[a-zA-Z]+$/,
    /^var\(--[A-Za-z0-9-_]+\)$/
  ];
  if (allowed.some((pattern) => pattern.test(trimmed))) {
    return trimmed;
  }
  return "";
};

const normalizeLanguage = (value) => {
  if (!value) {
    return "markup";
  }
  const normalized = String(value).trim().toLowerCase();
  return languageAliases[normalized] || normalized;
};

const parseLineNumbers = (value) => {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  const normalized = String(value).trim().toLowerCase();
  return !["false", "0", "no", "off", "none"].includes(normalized);
};

module.exports = () => {
  let codeblockCounter = 0;

  return function (content, language, accentColor, lineNumbers, showHeader) {
    const rawContent = content || "";
    let trimmedContent = rawContent
      .replace(/^(?:\s*\r?\n)+/, "")
      .replace(/(?:\r?\n\s*)+$/, "");
    const lines = trimmedContent.split(/\r?\n/);
    const indents = lines
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const match = line.match(/^[\t ]+/);
        return match ? match[0].length : 0;
      });
    const minIndent = indents.length ? Math.min(...indents) : 0;
    if (minIndent > 0) {
      trimmedContent = lines
        .map((line) => (line.length >= minIndent ? line.slice(minIndent) : line))
        .join("\n");
    }
    const normalizedLanguage = normalizeLanguage(language);
    const grammar = Prism.languages[normalizedLanguage];
    const highlightLanguage = grammar ? normalizedLanguage : "markup";
    const displayLabel = grammar
      ? languageLabels[highlightLanguage] ||
        highlightLanguage.charAt(0).toUpperCase() + highlightLanguage.slice(1)
      : "Text";
    const highlighted = Prism.highlight(
      trimmedContent,
      Prism.languages[highlightLanguage],
      highlightLanguage
    );

    let resolvedAccent = accentColor;
    let resolvedLineNumbers = lineNumbers;
    let resolvedShowHeader = showHeader;
    if (resolvedLineNumbers === undefined) {
      if (typeof resolvedAccent === "boolean" || typeof resolvedAccent === "number") {
        resolvedLineNumbers = resolvedAccent;
        resolvedAccent = "";
      } else if (typeof resolvedAccent === "string") {
        const normalizedFlag = resolvedAccent.trim().toLowerCase();
        if (["false", "0", "no", "off", "none"].includes(normalizedFlag)) {
          resolvedLineNumbers = resolvedAccent;
          resolvedAccent = "";
        }
      }
    }

    if (resolvedShowHeader === undefined) {
      const headerFlags = ["noheader", "no-header", "headerless"];
      if (typeof resolvedLineNumbers === "string") {
        const normalizedHeader = resolvedLineNumbers.trim().toLowerCase();
        if (headerFlags.includes(normalizedHeader)) {
          resolvedShowHeader = false;
          resolvedLineNumbers = true;
        }
      }
      if (resolvedShowHeader === undefined && typeof resolvedAccent === "string") {
        const normalizedHeader = resolvedAccent.trim().toLowerCase();
        if (headerFlags.includes(normalizedHeader)) {
          resolvedShowHeader = false;
          resolvedAccent = "";
        }
      }
    }

    const normalizedShowHeader = resolvedShowHeader === undefined
      ? ""
      : String(resolvedShowHeader).trim().toLowerCase();
    const showHeaderValue = resolvedShowHeader === undefined
      ? true
      : !["false", "0", "no", "off", "none", "noheader", "no-header", "headerless"].includes(normalizedShowHeader);

    const showLineNumbers = parseLineNumbers(resolvedLineNumbers);
    const codeHtml = showLineNumbers
      ? highlighted
          .split(/\n/)
          .map((line) => `<span class="codeblock-line">${line || " "}</span>`)
          .join("\n")
      : highlighted;
    const sanitizedAccent = sanitizeCssColor(resolvedAccent);
    const id = `codeblock-${Date.now().toString(36)}-${codeblockCounter++}`;
    const accentStyle = sanitizedAccent
      ? ` style=\"--codeblock-accent: ${escapeHtml(sanitizedAccent)};\"`
      : "";
    const lineNumberClass = showLineNumbers ? "has-line-numbers" : "";
    const languageClass = `language-${highlightLanguage}`;
    const headerClass = showHeaderValue ? "" : "no-header";
    const headerHtml = showHeaderValue
      ? `\n  <div class=\"codeblock-header\">\n    <span class=\"codeblock-language\">${escapeHtml(displayLabel)}</span>\n    <button class=\"codeblock-copy\" type=\"button\" data-copy-target=\"${id}\" aria-label=\"Copy code to clipboard\">Copy</button>\n  </div>`
      : "";
    const classNames = ["codeblock", headerClass].filter(Boolean).join(" ");

    return `\n<div class=\"${classNames}\" id=\"${id}\" data-language=\"${escapeHtml(
      highlightLanguage
    )}\"${accentStyle}>${headerHtml}\n  <pre class=\"codeblock-pre ${lineNumberClass} ${languageClass}\"><code class=\"${languageClass}\">${codeHtml}</code></pre>\n</div>`;
  };
};

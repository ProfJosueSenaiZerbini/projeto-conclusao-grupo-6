import fs from "node:fs";
import path from "node:path";

const roots = ["views/pages", "views/partials"];
const voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function formatTemplate(source) {
  const expressions = [];
  const protectedSource = source.replace(/<%[\s\S]*?%>/g, expression => {
    const placeholder = `___EJS_${expressions.length}___`;
    expressions.push(expression);
    return placeholder;
  });
  const normalized = protectedSource
    .replace(/<[^>]+>/g, tag => tag.replace(/\s+/g, " ").trim())
    .replace(/\s*(___EJS_\d+___)\s*/g, "$1");
  const tokens = normalized.match(/<\/?[^>]+>|___EJS_\d+___|[^<]+/g) ?? [];
  const lines = [];
  let indent = 0;
  const write = (value, level = indent) => {
    const text = value.trim();
    if (text) lines.push(`${"  ".repeat(Math.max(0, level))}${text}`);
  };
  const restore = value =>
    value.replace(/___EJS_(\d+)___/g, (_, index) => expressions[Number(index)]);

  for (const rawToken of tokens) {
    const value = restore(rawToken.trim());
    if (!value) continue;

    if (value.startsWith("<%")) {
      const closes =
        /\b(end|else|else\s+if|catch|finally)\b|^<%\s*\}/.test(value) ||
        value.includes("})");
      if (closes) indent -= 1;
      write(value);
      if (/[{]\s*%>$/.test(value) || /forEach\([^)]*\)\s*=>\s*\{/.test(value))
        indent += 1;
      continue;
    }

    if (value.startsWith("</")) {
      indent -= 1;
      write(value);
      continue;
    }

    if (value.startsWith("<") && value.endsWith(">")) {
      write(value);
      const name = value.match(/^<\s*([\w-]+)/)?.[1]?.toLowerCase();
      const selfClosing = value.endsWith("/>") || voidTags.has(name);
      if (!selfClosing && !value.startsWith("<!--")) indent += 1;
      continue;
    }

    write(value);
  }

  return `${lines.join("\n")}\n`;
}

for (const root of roots) {
  for (const file of fs
    .readdirSync(root)
    .filter(name => name.endsWith(".ejs"))) {
    const filename = path.join(root, file);
    fs.writeFileSync(
      filename,
      formatTemplate(fs.readFileSync(filename, "utf8"))
    );
    console.log(filename);
  }
}

import fs from "node:fs";

// Regenera o agregador comum sem reorganizar as folhas específicas de cada página.
const sharedStylesheets = ["base", "estrutura", "componentes"];
const missing = sharedStylesheets.filter(
  name => !fs.existsSync(`public/css/${name}.css`)
);
if (missing.length) {
  console.error(`Folhas compartilhadas não encontradas: ${missing.join(", ")}`);
  process.exit(1);
}
fs.writeFileSync(
  "public/css/estilos.css",
  `${sharedStylesheets.map(name => `@import url(\"/css/${name}.css\");`).join("\n")}\n`
);
console.log("Agregador compartilhado atualizado: public/css/estilos.css");

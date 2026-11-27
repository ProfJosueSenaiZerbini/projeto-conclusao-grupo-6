import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { validarComposicao } from "../src/app/models/composicaoSelo.ts";
import { curadoria, montarSelo } from "./selos-demonstrativos-curadoria.mjs";

const aplicar = process.argv.includes("--aplicar");
const destino = path.resolve(
  process.env.CYPHER_DB_PATH || "data/cypher.sqlite"
);
const db = new Database(destino, { fileMustExist: true, readonly: !aplicar });
try {
  if (db.pragma("user_version", { simple: true }) !== 44)
    throw Error("Use uma base Cypher na versão de esquema 44.");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  const consultar = db.prepare(`
    SELECT p.usuario_id AS id, c.chave, p.identificador,
      EXISTS(SELECT 1 FROM selos_perfil s WHERE s.autor_id=p.usuario_id) AS temSelo,
      EXISTS(SELECT 1 FROM rascunhos_selo_perfil r WHERE r.autor_id=p.usuario_id) AS temRascunho
    FROM catalogo_cena c
    JOIN perfis p ON p.usuario_id=c.id
    JOIN usuarios u ON u.id=p.usuario_id
    WHERE c.tipo='perfil' AND c.ficcional=1 AND u.tipo_conta='profissional'
      AND u.email_confirmado_em IS NOT NULL AND p.perfil_publico=1
    ORDER BY c.chave`);
  const preparar = () =>
    consultar.all().map(r => {
      const slug = r.chave.slice("perfil:".length);
      if (!Object.hasOwn(curadoria, slug))
        return { ...r, slug, estado: "sem curadoria" };
      if (r.temRascunho || r.temSelo)
        return { ...r, slug, estado: "preservado" };
      try {
        return {
          ...r,
          slug,
          estado: "pronto",
          composicao: validarComposicao(montarSelo(slug), true),
        };
      } catch (e) {
        throw Error(slug + ": " + e.message);
      }
    });
  const plano = preparar();
  const contar = (itens, estado) =>
    itens.filter(i => i.estado === estado).length;
  if (contar(plano, "sem curadoria"))
    throw Error(
      "Perfis sem desenho definido: " +
        plano
          .filter(i => i.estado === "sem curadoria")
          .map(i => i.slug)
          .join(", ")
    );
  if (!aplicar || !contar(plano, "pronto")) {
    console.log(
      JSON.stringify({
        perfis: plano.length,
        prontos: contar(plano, "pronto"),
        preservados: contar(plano, "preservado"),
        inseridos: 0,
      })
    );
  } else {
    const pasta = path.join(path.dirname(destino), "backups");
    fs.mkdirSync(pasta, { recursive: true });
    const backup = path.join(
      pasta,
      "antes-selos-demo-" +
        new Date().toISOString().replace(/[:.]/g, "-") +
        ".sqlite"
    );
    await db.backup(backup);
    const inserir = db.prepare(`
      INSERT INTO selos_perfil (id, autor_id, letras, forma, cor, simbolo, criado_em, composicao_json)
      VALUES (?, ?, ?, ?, ?, 'nenhum', ?, ?)`);
    const executado = db
      .transaction(() => {
        const atual = preparar().filter(i => i.estado === "pronto");
        for (const { id, composicao } of atual) {
          const letras = composicao.camadas.find(
            c => c.tipo === "letras"
          ).valor;
          inserir.run(
            randomUUID(),
            id,
            letras,
            composicao.forma,
            composicao.paleta,
            Date.now(),
            JSON.stringify(composicao)
          );
        }
        if (db.pragma("foreign_key_check").length)
          throw Error("A base não passou na conferência de chaves.");
        return atual.length;
      })
      .immediate();
    console.log(
      JSON.stringify({ perfis: plano.length, inseridos: executado, backup })
    );
  }
} finally {
  db.close();
}

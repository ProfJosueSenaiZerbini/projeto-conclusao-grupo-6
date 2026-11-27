import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { caminhoBancoCypher, conexaoInternaCypher } from "./bancoDados.js";
import { pastaMidias } from "./projetosTrabalho.js";
import { validarComposicao } from "./composicaoSelo.js";

type Linha = Record<string, string | number | null>;
type Asset = {
  grupo: "beat" | "projeto";
  id: string;
  origem: string;
  bytes: number;
  sha256: string;
};
type Acervo = {
  versao: number;
  tabelas: Record<string, Linha[]>;
  assets: Asset[];
};
const tabelas = [
  "usuarios",
  "perfis",
  "identificadores_usuario",
  "profissoes_usuario",
  "respostas_atuacao_categoria",
  "respostas_atuacao_profissao",
  "vertentes_profissionais_usuario",
  "portfolio_config",
  "preferencias_contato",
  "obras",
  "atuacoes_obra",
  "creditos",
  "fonogramas",
  "curtidas_obras",
  "lancamentos",
  "faixas_lancamento",
  "historico_lancamentos",
  "beats",
  "beat_arquivos",
  "beat_catalogo",
  "ofertas_beats",
  "beat_oferta_versoes",
  "eventos",
  "eventos_configuracoes",
  "eventos_acompanhamentos",
  "projetos_trabalho",
  "detalhes_projetos",
  "midias_trabalho",
  "itens_projeto",
  "oportunidades_profissionais",
  "funcoes_oportunidade",
  "colaboracoes",
  "comentarios_conteudo",
  "profissionais_seguidos",
  "selos_perfil",
  "catalogo_cena",
];
const nomeSql = (nome: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(nome)) throw Error("Coluna de seed inválida.");
  return '"' + nome + '"';
};
const hash = (dados: Buffer) =>
  createHash("sha256").update(dados).digest("hex");
const existe = (arquivo: string) => fs.existsSync(arquivo);

export function popularCatalogoPortatil() {
  const acervo: Acervo = JSON.parse(
    fs.readFileSync(path.resolve("seeds/catalogo-cypher.json"), "utf8")
  );
  if (
    acervo.versao !== 1 ||
    Object.keys(acervo.tabelas).some(t => !tabelas.includes(t))
  )
    throw Error("Formato do catálogo de demonstração incompatível.");
  if (
    acervo.tabelas.usuarios.some(
      r => Object.hasOwn(r, "email") || Object.hasOwn(r, "senha_hash")
    )
  )
    throw Error("O catálogo não aceita credenciais.");
  const db = conexaoInternaCypher();
  const ids = acervo.tabelas.usuarios
    .filter(r => r.demonstracao !== 1)
    .map(r => r.id);
  const reservado = db.prepare("SELECT 1 FROM usuarios WHERE id=?");
  const pertence = db.prepare(
    "SELECT 1 FROM catalogo_cena WHERE tipo='perfil' AND ficcional=1 AND id=?"
  );
  const criados: string[] = [];
  const inseridos: Record<string, number> = {};
  const audio = path.join(path.dirname(caminhoBancoCypher()), "arquivos-beats");
  try {
    return db
      .transaction(() => {
        db.pragma("defer_foreign_keys = ON");
        for (const id of ids)
          if (reservado.get(id) && !pertence.get(id))
            throw Error(
              "Identidade de catálogo em conflito. Restaure em base separada."
            );
        for (const l of acervo.tabelas.selos_perfil)
          validarComposicao(JSON.parse(String(l.composicao_json)), true);
        const ativos = db.prepare(
          "SELECT 1 FROM selos_perfil WHERE autor_id=? LIMIT 1"
        );
        const rascunho = db.prepare(
          "SELECT 1 FROM rascunhos_selo_perfil WHERE autor_id=?"
        );
        for (const t of tabelas) {
          inseridos[t] = 0;
          const colunas = new Set(
            db
              .pragma("table_info(" + nomeSql(t) + ")")
              .map((c: { name: string }) => c.name)
          );
          for (const l of acervo.tabelas[t] || []) {
            if (
              t === "selos_perfil" &&
              (ativos.get(l.autor_id) || rascunho.get(l.autor_id))
            )
              continue;
            const chaves = Object.keys(l);
            if (chaves.some(c => !colunas.has(c)))
              throw Error("Schema de seed incompatível: " + t);
            const sql =
              "INSERT INTO " +
              nomeSql(t) +
              "(" +
              chaves.map(nomeSql).join(",") +
              ") VALUES (" +
              chaves.map(() => "?").join(",") +
              ") ON CONFLICT DO NOTHING";
            inseridos[t] += Number(
              db.prepare(sql).run(...chaves.map(c => l[c])).changes
            );
          }
        }
        for (const a of acervo.assets) {
          if (
            !/^[a-zA-Z0-9_-]+$/.test(a.id) ||
            !["beat", "projeto"].includes(a.grupo) ||
            !a.origem.startsWith("public/") ||
            a.origem.includes("\\") ||
            a.origem.split("/").includes("..")
          )
            throw Error("Caminho de mídia demonstrativa inválido.");
          const pasta = a.grupo === "beat" ? audio : pastaMidias();
          const tabela =
            a.grupo === "beat" ? "beat_arquivos" : "midias_trabalho";
          const ativo = db
            .prepare("SELECT bytes FROM " + tabela + " WHERE id=?")
            .get(a.id) as { bytes: number } | undefined;
          if (!ativo || ativo.bytes !== a.bytes)
            throw Error("A mídia demonstrativa está fora do catálogo: " + a.id);
          const conteudo = fs
            .readFileSync(path.resolve(a.origem))
            .subarray(0, a.bytes);
          if (conteudo.length !== a.bytes || hash(conteudo) !== a.sha256)
            throw Error("Fonte demonstrativa alterada: " + a.origem);
          const destino = path.join(pasta, a.id);
          if (existe(destino)) {
            if (hash(fs.readFileSync(destino)) !== a.sha256)
              throw Error(
                "Mídia existente diverge da demonstração; use uma base separada: " +
                  a.id
              );
            continue;
          }
          fs.mkdirSync(pasta, { recursive: true });
          const fd = fs.openSync(destino, "wx");
          criados.push(destino);
          try {
            fs.writeFileSync(fd, conteudo);
          } finally {
            fs.closeSync(fd);
          }
        }
        if (db.pragma("foreign_key_check").length)
          throw Error("Falha na integridade referencial do catálogo.");
        return { inseridos, arquivos: criados.length };
      })
      .immediate();
  } catch (erro) {
    for (const arquivo of criados) fs.rmSync(arquivo, { force: true });
    throw erro;
  }
}

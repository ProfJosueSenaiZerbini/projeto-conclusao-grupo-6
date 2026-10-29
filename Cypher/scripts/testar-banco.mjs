import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const diretorio = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-db-test-"));
const arquivoBanco = path.join(diretorio, "cypher.sqlite");
const arquivoRegras = path.join(diretorio, "regras.sqlite");
const inicializar = `
  import { inicializarDadosDemonstrativos } from "./src/app/models/modeloCypher.ts";
  inicializarDadosDemonstrativos();
`;

function executarBootstrap(rotulo) {
  const resultado = spawnSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", inicializar],
    {
      cwd: process.cwd(),
      env: { ...process.env, CYPHER_DB_PATH: arquivoBanco, NODE_ENV: "test" },
      encoding: "utf8",
    }
  );
  assert.equal(
    resultado.status,
    0,
    `${rotulo} falhou:\n${resultado.stdout}\n${resultado.stderr}`
  );
}

function executarBootstrapEsperandoFalha(rotulo) {
  const resultado = spawnSync(
    process.execPath,
    ["--import", "tsx", "--input-type=module", "-e", inicializar],
    {
      cwd: process.cwd(),
      env: { ...process.env, CYPHER_DB_PATH: arquivoBanco, NODE_ENV: "test" },
      encoding: "utf8",
    }
  );
  assert.notEqual(resultado.status, 0, `${rotulo} deveria ser recusado.`);
  assert.match(
    `${resultado.stdout}\n${resultado.stderr}`,
    /versão de esquema mais recente/
  );
}

try {
  executarBootstrap("Bootstrap de banco novo");

  let db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  const tabelas = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map(({ name }) => name)
  );
  for (const tabela of [
    "usuarios",
    "perfis",
    "obras",
    "creditos",
    "eventos",
    "interesses_eventos",
    "beats",
    "ofertas_beats",
    "sessoes",
    "notificacoes",
    "sequencias",
    "propostas_generos",
    "propostas_categorias",
    "categorias_profissionais_aprovadas",
    "excecoes_categorias",
    "auditoria_categorias",
  ]) {
    assert.ok(tabelas.has(tabela), `Tabela ausente: ${tabela}`);
  }
  const colunasPerfil = new Set(
    db.pragma("table_info(perfis)").map(({ name }) => name)
  );
  assert.ok(colunasPerfil.has("funcao"));
  assert.ok(colunasPerfil.has("ultima_alteracao_categorias_em"));
  assert.ok(!colunasPerfil.has("role"));
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'indice_usuarios_codigo_publico'"
      )
      .get()
  );
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'indice_usuarios_numero_sequencial_real'"
      )
      .get()
  );
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.prepare(
    "INSERT INTO usuarios (id, email, senha_hash, tipo_conta, demonstracao, codigo_publico, numero_sequencial) VALUES ('legacy-category-user', 'legacy-category@example.test', NULL, 'profissional', 0, 'CYP-LGCAT0009003', 900003)"
  ).run();
  db.prepare(
    "INSERT INTO perfis (usuario_id, c_tag, nome, funcao, identificador, iniciais, categorias_json, outra_categoria) VALUES ('legacy-category-user', 'CYP-LEGACY-CAT', 'Perfil legado categoria', 'Outros: Engenheiro de áudio', '@perfil-legado-categoria', 'PLC', '[\"Outros\"]', 'Engenheiro de áudio')"
  ).run();
  const totalUsuarios = db
    .prepare("SELECT COUNT(*) AS total FROM usuarios")
    .get().total;
  const totalObras = db
    .prepare("SELECT COUNT(*) AS total FROM obras")
    .get().total;
  db.close();

  // Simula um banco v5 anterior a interesses, ofertas e campos recentes.
  db = new Database(arquivoBanco);
  db.exec("DROP TABLE notificacoes");
  db.exec("DROP TABLE interesses_eventos");
  db.exec("DROP TABLE ofertas_beats");
  db.exec("ALTER TABLE beats DROP COLUMN venda_exclusiva");
  db.exec("ALTER TABLE eventos DROP COLUMN tipo_participacao");
  db.pragma("user_version = 5");
  db.close();

  executarBootstrap("Migração de banco v5");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'interesses_eventos'"
      )
      .get()
  );
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'ofertas_beats'"
      )
      .get()
  );
  db.close();

  // Simula uma base v7 sem a tabela de notificações introduzida posteriormente.
  db = new Database(arquivoBanco);
  db.exec("DROP TABLE notificacoes");
  db.pragma("user_version = 7");
  db.close();

  executarBootstrap("Migração de banco v7");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.equal(
    db.prepare("SELECT COUNT(*) AS total FROM usuarios").get().total,
    totalUsuarios
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) AS total FROM obras").get().total,
    totalObras
  );
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'notificacoes'"
      )
      .get()
  );
  assert.ok(
    db
      .pragma("table_info(beats)")
      .some(({ name }) => name === "venda_exclusiva")
  );
  assert.ok(
    db
      .pragma("table_info(eventos)")
      .some(({ name }) => name === "tipo_participacao")
  );
  db.close();

  // Simula um banco v11 sem estruturas de governança de categorias e gêneros.
  db = new Database(arquivoBanco);
  db.prepare(
    "DELETE FROM propostas_categorias WHERE usuario_id = 'legacy-category-user'"
  ).run();
  db.prepare(
    "UPDATE perfis SET funcao = 'Outros: Engenheiro de áudio', outra_categoria = 'Engenheiro de áudio' WHERE usuario_id = 'legacy-category-user'"
  ).run();
  db.exec("DROP TABLE auditoria_categorias");
  db.exec("DROP TABLE propostas_generos");
  db.exec("DROP TABLE propostas_categorias");
  db.exec("DROP TABLE categorias_profissionais_aprovadas");
  db.exec("DROP TABLE excecoes_categorias");
  db.exec("ALTER TABLE perfis DROP COLUMN ultima_alteracao_categorias_em");
  db.pragma("user_version = 11");
  db.close();

  executarBootstrap("Migração de banco v11");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.ok(
    db
      .pragma("table_info(perfis)")
      .some(({ name }) => name === "ultima_alteracao_categorias_em")
  );
  for (const tabela of [
    "propostas_generos",
    "propostas_categorias",
    "excecoes_categorias",
    "auditoria_categorias",
  ]) {
    assert.ok(
      db
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?"
        )
        .get(tabela),
      `Tabela esperada na migração não criada: ${tabela}`
    );
  }
  const propostaLegada = db
    .prepare(
      "SELECT categoria, status FROM propostas_categorias WHERE usuario_id = 'legacy-category-user'"
    )
    .get();
  assert.deepEqual(propostaLegada, {
    categoria: "Engenheiro de áudio",
    status: "pendente",
  });
  assert.equal(
    db
      .prepare(
        "SELECT outra_categoria FROM perfis WHERE usuario_id = 'legacy-category-user'"
      )
      .get().outra_categoria,
    ""
  );
  db.prepare(
    "INSERT INTO propostas_categorias (id, usuario_id, categoria, status, revisada_em, revisor_email, motivo_revisao) VALUES ('categoria-aprovada-legada', 'legacy-category-user', 'Designer de som', 'aprovado', CURRENT_TIMESTAMP, 'equipe@example.test', 'Categoria válida para o ecossistema.')"
  ).run();
  db.close();

  db = new Database(arquivoBanco);
  db.exec("DROP TABLE categorias_profissionais_aprovadas");
  db.pragma("user_version = 13");
  db.close();
  executarBootstrap("Migração de banco v13");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.deepEqual(
    db
      .prepare(
        "SELECT categoria, revisor_email FROM categorias_profissionais_aprovadas WHERE categoria = 'Designer de som'"
      )
      .get(),
    { categoria: "Designer de som", revisor_email: "equipe@example.test" }
  );
  db.close();

  db = new Database(arquivoBanco);
  db.exec("DROP TABLE propostas_categorias");
  db.exec("DROP TABLE categorias_profissionais_aprovadas");
  db.pragma("user_version = 12");
  db.close();
  executarBootstrap("Migração de banco v12");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  for (const tabela of [
    "propostas_categorias",
    "categorias_profissionais_aprovadas",
  ]) {
    assert.ok(
      db
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?"
        )
        .get(tabela),
      `Tabela ausente após migração v12: ${tabela}`
    );
  }
  db.close();

  db = new Database(arquivoBanco);
  db.exec("DROP TABLE IF EXISTS solicitacoes_excecao_categorias");
  db.pragma("user_version = 14");
  db.close();
  executarBootstrap("Migração de banco v14 para v16");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'solicitacoes_excecao_categorias'"
      )
      .get(),
    "A tabela de solicitações de exceção deve existir após a migração v16"
  );
  assert.ok(
    db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'indice_solicitacao_excecao_pendente_usuario'"
      )
      .get(),
    "A migração deve criar o índice de unicidade dos pedidos pendentes"
  );

  const usuarioMigracao = db
    .prepare("SELECT usuario_id AS id, categorias_json AS categoriasJson FROM perfis LIMIT 1")
    .get();
  const revisorMigracao = db
    .prepare("SELECT id FROM usuarios WHERE id <> ? LIMIT 1")
    .get(usuarioMigracao.id).id;
  db.prepare(
    `INSERT INTO solicitacoes_excecao_categorias (
       id, usuario_id, motivo, status, revisada_em, revisor_id,
       revisor_email, motivo_revisao, categorias_antes_json
     ) VALUES (?, ?, ?, 'rejeitado', CURRENT_TIMESTAMP, ?, ?, ?, '[]')`
  ).run(
    "solicitacao-legada-v15",
    usuarioMigracao.id,
    "Pedido legado de alteração profissional.",
    revisorMigracao,
    "revisor@example.test",
    "Solicitação recusada após análise."
  );
  db.exec("DROP TABLE historico_solicitacoes_categorias");
  db.pragma("user_version = 15");
  db.close();

  executarBootstrap("Migração de banco v15 para v16");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.deepEqual(
    JSON.parse(
      db.prepare("SELECT categorias_antes_json AS categorias FROM solicitacoes_excecao_categorias WHERE id = ?")
        .get("solicitacao-legada-v15").categorias
    ),
    JSON.parse(usuarioMigracao.categoriasJson)
  );
  assert.deepEqual(
    db.prepare(
      "SELECT autor_tipo AS autorTipo, mensagem FROM historico_solicitacoes_categorias WHERE solicitacao_id = ? ORDER BY autor_tipo"
    ).all("solicitacao-legada-v15"),
    [
      { autorTipo: "administrador", mensagem: "Solicitação recusada após análise." },
      { autorTipo: "usuario", mensagem: "Pedido legado de alteração profissional." },
    ]
  );
  db.close();

  executarBootstrap("Reinicialização idempotente v16");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 16);
  assert.equal(
    db.prepare("SELECT COUNT(*) AS total FROM usuarios").get().total,
    totalUsuarios
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) AS total FROM obras").get().total,
    totalObras
  );
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  db.pragma("user_version = 99");
  db.close();

  executarBootstrapEsperandoFalha("Proteção contra schema futuro");
  db = new Database(arquivoBanco);
  assert.equal(db.pragma("user_version", { simple: true }), 99);
  db.close();

  console.log(
    "OK: banco novo, migrações v5/v7/v11/v12/v13/v14/v15 → v16, propostas legadas e taxonomia aprovada persistente, integridade referencial, idempotência e recusa segura de schema futuro."
  );
} finally {
  fs.rmSync(diretorio, { recursive: true, force: true });
}

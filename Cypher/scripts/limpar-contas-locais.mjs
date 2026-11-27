import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const aplicar = process.argv.includes("--aplicar");
const ids = [...new Set(process.argv.slice(2).filter(a => a !== "--aplicar"))];
if (!ids.length || ids.some(id => !/^[a-f0-9-]{36}$/.test(id)))
  throw Error(
    "Informe apenas os IDs locais revisados. Use --aplicar para executar."
  );
const banco = path.resolve(process.env.CYPHER_DB_PATH || "data/cypher.sqlite");
const raiz = path.dirname(banco);
const db = new Database(banco, { fileMustExist: true, readonly: !aplicar });
const citar = s => '"' + s.replaceAll('"', '""') + '"';
const alvo = "temp.alvos_limpeza";
const obter = (t, coluna = "id") =>
  `SELECT x.${citar(coluna)} FROM ${citar(t)} x JOIN ${alvo} a ON a.tabela='${t}' AND a.rid=x.rowid`;
try {
  if (db.pragma("user_version", { simple: true }) !== 44)
    throw Error("O procedimento requer esquema 44.");
  db.pragma("foreign_keys=ON");
  db.pragma("busy_timeout=5000");
  db.exec(
    "CREATE TEMP TABLE alvos_limpeza (tabela TEXT, rid INTEGER, PRIMARY KEY(tabela,rid));"
  );
  const tabelas = db
    .prepare(
      "SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all();
  if (tabelas.some(t => /WITHOUT ROWID/i.test(t.sql)))
    throw Error("Esquema precisa de revisão antes da limpeza.");
  const arestas = tabelas.flatMap(({ name }) => {
    const fks = Object.groupBy(
      db.pragma("foreign_key_list(" + citar(name) + ")"),
      f => f.id
    );
    return Object.values(fks).map(grupo => ({
      name,
      grupo,
      destino: grupo[0].table,
    }));
  });
  const marcar = (t, cond) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO ${alvo}
    SELECT ?, rowid FROM ${citar(t)} WHERE ${cond}`
      )
      .run(t).changes;
  function calcular() {
    db.exec("DELETE FROM " + alvo);
    const localizar = db.prepare(`SELECT u.rowid, u.tipo_conta,
      EXISTS(SELECT 1 FROM catalogo_cena WHERE tipo='perfil' AND id=u.id) AS reservado
      FROM usuarios u WHERE u.id=?`);
    for (const id of ids) {
      const u = localizar.get(id);
      if (!u) continue;
      if (u.tipo_conta === "administrativo" || u.reservado)
        throw Error("Conta protegida: " + id);
      db.prepare(`INSERT INTO ${alvo} VALUES('usuarios',?)`).run(u.rowid);
    }
    const polimorficos = {
      perfil: ["usuarios", "id"],
      obra: ["obras", "id"],
      beat: ["beats", "id"],
      evento: ["eventos", "id"],
      projeto: ["projetos_trabalho", "id"],
      oportunidade: ["oportunidades_profissionais", "id"],
      selo: ["selos_perfil", "id"],
      midia_publicacao: ["midias_publicacoes", "id"],
      colaboracao: ["colaboracoes", "id"],
      aquisicao: ["beat_pedidos", "id"],
      conversa: ["conversas", "id"],
      mensagem: ["mensagens", "id"],
      acordos: ["acordos_oportunidade", "id"],
      comentario: ["comentarios_conteudo", "id"],
    };
    // Metadados conhecidos de exemplos que perderam o alvo em versões anteriores.
    marcar(
      "catalogo_cena",
      "tipo='oportunidade' AND ficcional=1 AND id LIKE 'cena-op-%' AND NOT EXISTS (SELECT 1 FROM oportunidades_profissionais o WHERE o.id=catalogo_cena.id)"
    );
    marcar(
      "comentarios_conteudo",
      "objeto_tipo='obra' AND objeto_id LIKE 'cena-obra-%' AND autor_id IN (SELECT id FROM catalogo_cena WHERE tipo='perfil' AND ficcional=1) AND NOT EXISTS (SELECT 1 FROM obras o WHERE o.id=comentarios_conteudo.objeto_id)"
    );
    marcar(
      "notificacoes",
      "entidade_tipo='oportunidade' AND entidade_id LIKE 'cena-op-%' AND usuario_destino_id IN (SELECT id FROM catalogo_cena WHERE tipo='perfil' AND ficcional=1) AND NOT EXISTS (SELECT 1 FROM oportunidades_profissionais o WHERE o.id=notificacoes.entidade_id)"
    );
    let alterados;
    do {
      alterados = 0;
      for (const { name, grupo, destino } of arestas) {
        if (grupo[0].on_delete === "SET NULL") continue;
        const pk = db
          .pragma("table_info(" + citar(destino) + ")")
          .filter(t => t.pk)
          .sort((a, b) => a.pk - b.pk);
        const on = grupo
          .map(
            f => "c." + citar(f.from) + "=p." + citar(f.to ?? pk[f.seq].name)
          )
          .join(" AND ");
        alterados += db
          .prepare(
            `INSERT OR IGNORE INTO ${alvo}
          SELECT ?,c.rowid FROM ${citar(name)} c JOIN ${citar(destino)} p ON ${on}
          JOIN ${alvo} a ON a.tabela=? AND a.rid=p.rowid`
          )
          .run(name, destino).changes;
      }
      for (const [tipo, [t, col]] of Object.entries(polimorficos)) {
        const idsAlvo = obter(t, col);
        const pol = (def, id) => `${def}='${tipo}' AND ${id} IN (${idsAlvo})`;
        for (const objeto of [
          "interacoes_conteudo",
          "comentarios_conteudo",
          "midias_publicacoes",
        ])
          alterados += marcar(objeto, pol("objeto_tipo", "objeto_id"));
        alterados += marcar("catalogo_cena", pol("tipo", "id"));
        alterados += marcar(
          "notificacoes",
          pol("entidade_tipo", "entidade_id")
        );
        alterados += marcar("itens_projeto", pol("tipo", "origem_id"));
      }
      alterados += marcar(
        "notificacoes",
        "tipo='mensagem' AND url IN (SELECT '/mensagens/' || id FROM conversas WHERE id IN (" +
          obter("conversas") +
          "))"
      );
      alterados += marcar(
        "itens_projeto",
        "tipo='midia' AND origem_id IN (" + obter("midias_trabalho") + ")"
      );
      // Marca compartilhamentos com destinatários fora da limpeza quando a própria
      // entidade depende da conta removida, sem tocar nas conversas entre preservados.
      alterados += marcar(
        "creditos",
        "usuario_creditado_id IN (" + obter("usuarios") + ")"
      );
    } while (alterados);
    const protegidos = db
      .prepare(
        `SELECT count(*) n FROM catalogo_cena c JOIN ${alvo} a
      ON a.tabela='catalogo_cena' AND a.rid=c.rowid WHERE c.tipo <> 'aquisicao' AND NOT (c.tipo='oportunidade' AND c.id LIKE 'cena-op-%' AND NOT EXISTS (SELECT 1 FROM oportunidades_profissionais o WHERE o.id=c.id))`
      )
      .get().n;
    if (protegidos)
      throw Error(
        "O plano atingiu um conteúdo de catálogo protegido. Nenhuma conta foi removida."
      );
    return db
      .prepare(
        `SELECT tabela,count(*) total FROM ${alvo} GROUP BY tabela ORDER BY tabela`
      )
      .all();
  }
  const plano = calcular();
  if (!aplicar || !plano.length) {
    console.log(JSON.stringify({ modo: "conferencia", tabelas: plano }));
  } else {
    const backup = path.join(
      raiz,
      "backups",
      "antes-limpeza-local-" + new Date().toISOString().replace(/[:.]/g, "-")
    );
    fs.mkdirSync(backup, { recursive: true });
    await db.backup(path.join(backup, "cypher.sqlite"));
    const mapa = [
      ["arquivo", "midias_publicacoes", "midias-publicacoes"],
      ["arquivo", "midias_trabalho", "midias"],
      ["arquivo", "beat_arquivos", "arquivos-beats"],
      ["arquivo", "mensagens_anexos", "anexos-mensagens"],
    ];
    const remover = db
      .transaction(() => {
        db.pragma("defer_foreign_keys=ON");
        if (JSON.stringify(calcular()) !== JSON.stringify(plano))
          throw Error(
            "A base mudou durante a preparação. Refaça a conferência."
          );
        const marcaPedido =
          "rowid IN (SELECT rid FROM " + alvo + " WHERE tabela='beat_pedidos')";
        const somenteDemo =
          db
            .prepare(
              "SELECT count(*) n FROM beat_pedidos WHERE " +
                marcaPedido +
                " AND (pagamento_id IS NOT NULL OR coalesce(json_extract(snapshot_json,'$.catalogo_cena'),0)<>1 OR coalesce(json_extract(snapshot_json,'$.demonstrativa'),0)<>1 OR EXISTS(SELECT 1 FROM beat_pagamentos p WHERE p.pedido_id=beat_pedidos.id))"
            )
            .get().n === 0;
        if (!somenteDemo)
          throw Error(
            "O plano alcançou histórico de pagamento não demonstrativo."
          );
        const gatilho = plano.some(t => t.tabela === "beat_pedidos")
          ? db
              .prepare(
                "SELECT sql FROM sqlite_master WHERE type='trigger' AND name='beat_pedido_preservado'"
              )
              .get()?.sql
          : null;
        if (plano.some(t => t.tabela === "beat_pedidos") && !gatilho)
          throw Error("Gatilho de preservação não encontrado.");
        const vinculos = [];
        for (const [, t, pasta] of mapa) {
          for (const { id } of db
            .prepare(
              "SELECT id FROM " +
                citar(t) +
                " WHERE rowid IN (SELECT rid FROM " +
                alvo +
                " WHERE tabela=?)"
            )
            .all(t)) {
            if (!/^[a-zA-Z0-9_-]+$/.test(id))
              throw Error("Identificador de mídia incompatível.");
            const local = path.join(
              pasta === "midias" && process.env.CYPHER_MEDIA_DIR
                ? path.resolve(process.env.CYPHER_MEDIA_DIR)
                : path.join(raiz, pasta),
              id
            );
            if (fs.existsSync(local)) {
              if (!fs.lstatSync(local).isFile())
                throw Error("Uma mídia não é arquivo regular.");
              fs.mkdirSync(path.join(backup, pasta), { recursive: true });
              fs.copyFileSync(
                local,
                path.join(backup, pasta, id),
                fs.constants.COPYFILE_EXCL
              );
              vinculos.push({ local, id, t });
            }
          }
        }
        // Apague primeiro filhos com referências RESTRICT; o restante é conferido no COMMIT.
        const pais = new Set();
        const visitar = t => {
          if (pais.has(t)) return;
          pais.add(t);
          for (const { name, destino } of arestas)
            if (destino === t && name !== t) visitar(name);
          db.prepare(
            `DELETE FROM ${citar(t)} WHERE rowid IN (SELECT rid FROM ${alvo} WHERE tabela=?)`
          ).run(t);
        };
        if (gatilho) db.exec("DROP TRIGGER beat_pedido_preservado");
        visitar("usuarios");
        for (const { tabela } of plano) visitar(tabela);
        db.exec(
          "UPDATE colaboracoes SET origem_tipo=\x27\x27,origem_id=\x27\x27 WHERE origem_tipo=\x27obra\x27 AND origem_id LIKE \x27cena-obra-%\x27 AND id IN (SELECT id FROM catalogo_cena WHERE tipo=\x27colaboracao\x27 AND ficcional=1) AND NOT EXISTS (SELECT 1 FROM obras o WHERE o.id=colaboracoes.origem_id)"
        );
        if (gatilho) db.exec(gatilho);
        if (
          db.pragma("foreign_key_check").length ||
          db.pragma("integrity_check", { simple: true }) !== "ok"
        )
          throw Error("Falha de integridade. A limpeza foi revertida.");
        return vinculos;
      })
      .immediate();
    let arquivos = 0;
    for (const { t, id, local } of remover) {
      if (!db.prepare("SELECT 1 FROM " + citar(t) + " WHERE id=?").get(id)) {
        fs.rmSync(local, { force: true });
        arquivos++;
      }
    }
    console.log(JSON.stringify({ backup, tabelas: plano, arquivos }));
  }
} finally {
  db.close();
}

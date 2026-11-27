import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { criarClienteHttp } from "./cliente-http-teste.mjs";

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-seed-portatil-"));
const banco = path.join(pasta, "cypher.sqlite");
const ambiente = {
  ...process.env,
  NODE_ENV: "test",
  CYPHER_DB_PATH: banco,
  CYPHER_SEED_CATALOG: "1",
  CYPHER_BIND_HOST: "127.0.0.1",
  CYPHER_EMAIL_TRANSPORT: "local",
  CYPHER_EMAIL_DIR: path.join(pasta, "emails"),
  CYPHER_MEDIA_DIR: path.join(pasta, "midias"),
};
const acervo = JSON.parse(
  fs.readFileSync("seeds/catalogo-cypher.json", "utf8")
);
function executar(script, ...args) {
  const r = spawnSync(process.execPath, ["--import", "tsx", script, ...args], {
    env: ambiente,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(r.status, 0, r.stderr || r.stdout);
}
const socket = net.createServer();
await new Promise(r => socket.listen(0, "127.0.0.1", r));
const porta = socket.address().port;
await new Promise(r => socket.close(r));
const base = "http://127.0.0.1:" + porta;
let processo;
const iniciar = async () => {
  processo = spawn(process.execPath, ["dist/src/aplicacao.js"], {
    env: { ...ambiente, PORT: String(porta) },
    windowsHide: true,
    stdio: "ignore",
  });
  for (let i = 0; i < 140; i++) {
    try {
      if ((await fetch(base + "/entrar")).ok) return;
    } catch {}
    if (processo.exitCode !== null)
      throw Error("Falha ao iniciar a aplicação com banco novo.");
    await new Promise(r => setTimeout(r, 50));
  }
  throw Error("Tempo de inicialização excedido.");
};
const parar = async () => {
  const ativo = processo;
  processo = undefined;
  if (!ativo || ativo.exitCode !== null || ativo.signalCode !== null) return;
  await new Promise(r => {
    ativo.once("exit", r);
    ativo.kill();
  });
};
const contar = (db, t) => db.prepare("SELECT count(*) n FROM " + t).get().n;
try {
  // Exatamente o mesmo boot da aplicação. Não há SQLite fornecido no workspace.
  assert.equal(fs.existsSync(banco), false);
  await iniciar();
  await parar();
  let db = new Database(banco, { readonly: true });
  for (const [t, rows] of Object.entries(acervo.tabelas)) {
    if (t === "preferencias_contato") continue; // defaults podem ser criados pela aplicação
    assert.equal(contar(db, t), rows.length, t);
  }
  assert.equal(db.pragma("integrity_check", { simple: true }), "ok");
  assert.deepEqual(db.pragma("foreign_key_check"), []);
  assert.equal(contar(db, "sessoes"), 0);
  assert.equal(
    db
      .prepare(
        "SELECT count(*) n FROM usuarios WHERE email IS NOT NULL OR senha_hash IS NOT NULL"
      )
      .get().n,
    0
  );
  assert.equal(
    db
      .prepare(
        "SELECT count(*) n FROM usuarios WHERE id NOT IN (SELECT id FROM catalogo_cena WHERE tipo='perfil') AND id <> 'demo-organizacao-eventos'"
      )
      .get().n,
    0
  );
  for (const a of acervo.assets) {
    const arquivo = fs.readFileSync(
      path.join(pasta, a.grupo === "beat" ? "arquivos-beats" : "midias", a.id)
    );
    assert.equal(arquivo.length, a.bytes);
    assert.equal(createHash("sha256").update(arquivo).digest("hex"), a.sha256);
  }
  db.close();

  // A inicializacao comum nao deve reaplicar a seed sobre dados existentes.
  const usuarioTeste = "teste-persistencia-portatil";
  const obraTeste = acervo.tabelas.obras[0].id;
  const descricaoTeste = "Edicao feita depois da carga inicial";
  db = new Database(banco);
  db.prepare("INSERT INTO usuarios (id, tipo_conta) VALUES (?, 'consumidor')").run(usuarioTeste);
  assert.equal(db.prepare("UPDATE obras SET descricao=? WHERE id=?").run(descricaoTeste, obraTeste).changes, 1);
  db.close();
  executar("scripts/preparar-contas-demo.mjs");
  executar("scripts/preparar-contas-demo.mjs");
  await iniciar();
  const http = criarClienteHttp(base);
  const login = await http(base + "/entrar", {
    method: "POST",
    redirect: "manual",
    body: new URLSearchParams({
      identificador: "visita.demo",
      password: "CypherDemo!2026",
    }),
  });
  assert.ok(
    [302, 303].includes(login.status),
    "Login de aula: " + login.status
  );
  const cookie = login.headers
    .getSetCookie()
    .filter(s => !s.startsWith("cypher_csrf="))[0]
    ?.split(";")[0];
  assert.ok(cookie);
  const get = p => http(base + p, { headers: { cookie } });
  const descoberta = await get("/descoberta");
  assert.equal(descoberta.status, 200);
  const html = await descoberta.text();
  for (const nome of [
    "Luz de Concreto",
    "Muros em Diálogo",
    "Rádio de Escadaria",
    "Fora do Quadro",
    "Tipo de Esquina",
  ])
    assert.ok(html.includes(nome), nome);
  for (const p of [
    "/artistas/emicida",
    "/eventos",
    "/oportunidades",
    "/banco-de-beats",
    "/trabalhos-e-galerias/demo-cx-radio-de-escadaria",
    "/artistas/lezin?obra=demo-album-profetiza",
  ])
    assert.equal((await get(p)).status, 200, p);
  assert.match(
    await (await get("/artistas/emicida")).text(),
    /class="pf-selo-assinatura"/
  );
  const previa = await get("/banco-de-beats/demo-beat-parece-sorte/previa");
  assert.equal(previa.status, 200);
  assert.match(previa.headers.get("content-type"), /audio/);
  db = new Database(banco, { readonly: true });
  assert.equal(db.prepare("SELECT tipo_conta FROM usuarios WHERE id=?").get(usuarioTeste)?.tipo_conta, "consumidor");
  assert.equal(db.prepare("SELECT descricao FROM obras WHERE id=?").get(obraTeste)?.descricao, descricaoTeste);
  for (const t of [
    "selos_perfil",
    "obras",
    "eventos",
    "profissionais_seguidos",
    "ofertas_beats",
  ])
    assert.equal(contar(db, t), acervo.tabelas[t].length, t);
  assert.equal(
    db
      .prepare(
        "SELECT count(*) n FROM usuarios WHERE id LIKE 'demo-laboratorio-%'"
      )
      .get().n,
    2
  );
  const pedido = db
    .prepare(
      "SELECT p.id,p.snapshot_json FROM beat_pedidos p JOIN beat_licencas l ON l.pedido_id=p.id WHERE p.comprador_id='demo-laboratorio-visita'"
    )
    .all();
  assert.equal(pedido.length, 1);
  const download = await get(
    "/compras/" +
      pedido[0].id +
      "/arquivos/" +
      JSON.parse(pedido[0].snapshot_json).arquivos[0].id
  );
  assert.equal(download.status, 200);
  assert.ok((await download.arrayBuffer()).byteLength > 10000);
  assert.deepEqual(db.pragma("foreign_key_check"), []);
  db.close();
  await parar();

  // O comando documentado deve escrever no alvo indicado, nunca no banco atual.
  const pastaRestauro = path.join(pasta, "restauro");
  const destinoRestauro = path.join(pastaRestauro, "cypher.sqlite");
  const argsRestauro = [
    "--import", "tsx", "scripts/restaurar-catalogo-demonstrativo.mjs",
    path.relative(process.cwd(), destinoRestauro),
  ];
  const restaurar = () => spawnSync(process.execPath, argsRestauro, {
    env: { ...ambiente, CYPHER_MEDIA_DIR: path.join(pastaRestauro, "midias") },
    encoding: "utf8", windowsHide: true,
  });
  const primeira = restaurar();
  assert.equal(primeira.status, 0, primeira.stderr || primeira.stdout);
  db = new Database(destinoRestauro, { readonly: true });
  for (const [t, rows] of Object.entries(acervo.tabelas)) {
    assert.equal(contar(db, t), rows.length, t);
  }
  assert.deepEqual(db.pragma("foreign_key_check"), []);
  assert.equal(db.prepare("SELECT descricao FROM obras WHERE id=?").get(obraTeste)?.descricao, acervo.tabelas.obras[0].descricao);
  db.close();
  for (const a of acervo.assets) {
    const arquivo = fs.readFileSync(path.join(pastaRestauro, a.grupo === "beat" ? "arquivos-beats" : "midias", a.id));
    assert.equal(createHash("sha256").update(arquivo).digest("hex"), a.sha256);
  }
  const exibido = createHash("sha256").update(fs.readFileSync(destinoRestauro)).digest("hex");
  const segunda = restaurar();
  assert.equal(segunda.status, 1);
  assert.match(segunda.stderr, /SQLite novo/);
  assert.equal(createHash("sha256").update(fs.readFileSync(destinoRestauro)).digest("hex"), exibido);

  db = new Database(banco, { readonly: true });
  assert.equal(db.prepare("SELECT tipo_conta FROM usuarios WHERE id=?").get(usuarioTeste)?.tipo_conta, "consumidor");
  assert.equal(db.prepare("SELECT descricao FROM obras WHERE id=?").get(obraTeste)?.descricao, descricaoTeste);
  db.close();
  console.log("OK: reinicio preserva dados novos e edicoes; restauro isolado confirmado e sobrescrita recusada.");
  console.log(
    "OK: inicialização nova, 41 selos, catálogo, login de aula, 15 mídias, licenciamento local e reinício sem duplicação."
  );
} finally {
  await parar();
  // A pasta é criada por este teste, sob os.tmpdir().
  if (
    path.dirname(pasta) === path.resolve(os.tmpdir()) &&
    path.basename(pasta).startsWith("cypher-seed-portatil-")
  )
    fs.rmSync(pasta, { recursive: true, force: true });
}

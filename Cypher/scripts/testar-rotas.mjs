import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-rotas-"));
process.env.CYPHER_DB_PATH = path.join(pasta, "cypher.sqlite");
process.env.NODE_ENV = "test";
const b = await import("../dist/src/app/models/bancoDados.js");
const a = await import("../dist/src/app/models/autenticacaoCypher.js");
let child, fim;
try {
  b.inicializarBancoCypher();
  b.criarContaCypher({
    id: "rotas", email: "rotas@example.test", senhaHash: "fixture",
    tipoConta: "consumidor", nome: "Pessoa de teste", funcao: "",
    identificador: "@rotas_teste", iniciais: "RT", categorias: [],
  });
  b.criarContaCypher({
    id: "artista", email: "artista@example.test", senhaHash: "fixture",
    tipoConta: "profissional", nome: "Artista de teste", funcao: "Rapper",
    identificador: "@artista_teste", iniciais: "AT", categorias: ["Rapper"],
  });
  const d = b.conexaoInternaCypher();
  d.prepare("UPDATE usuarios SET email_confirmado_em=CURRENT_TIMESTAMP").run();
  d.prepare("UPDATE perfis SET perfil_publico=1 WHERE usuario_id='artista'").run();
  const cookie = "cypher_session=" + a.iniciarSessao("rotas");
  const cookieProfissional = "cypher_session=" + a.iniciarSessao("artista");
  b.fecharBancoCypher();
  const reserva = createServer();
  await new Promise(r => reserva.listen(0, "127.0.0.1", r));
  const porta = reserva.address().port;
  await new Promise(r => reserva.close(r));
  const base = "http://127.0.0.1:" + porta;
  child = spawn(process.execPath, ["dist/src/aplicacao.js"], {
    env: { ...process.env, PORT: String(porta), CYPHER_BIND_HOST: "127.0.0.1" },
    windowsHide: true,
  });
  let log = "";
  child.stdout.on("data", c => log += c);
  child.stderr.on("data", c => log += c);
  fim = new Promise(resolve => child.once("exit", resolve));
  const get = (p, autenticado = true) => fetch(base + p, {
    redirect: "manual", headers: autenticado ? { cookie: p === "/colaboracoes" ? cookieProfissional : cookie } : {},
  });
  let entrada;
  for (let i = 0; i < 50; i++) {
    try { entrada = await get("/entrar", false); break; }
    catch { await new Promise(r => setTimeout(r, 100)); }
  }
  assert.equal(entrada?.status, 200, log);
  const removidas = process.argv.slice(2);
  const paginas = ["/", "/descoberta", "/eventos", "/eventos/mapa", "/obras",
    "/banco-de-beats", "/perfil", "/configuracoes", "/busca", "/mensagens",
    "/notificacoes", "/oportunidades", "/trabalhos-e-galerias",
    "/artistas/artista_teste", "/compras", "/central", "/suporte", "/colaboracoes",
    "/colecoes", "/solicitacoes-de-servico"];
  for (const p of removidas) {
    assert.match(p, /^\/(?!\/)/);
    for (const aut of [true, false]) {
      const r = await get(p + "?origem=teste", aut);
      assert.equal(r.status, 404, p);
      assert.equal(r.headers.get("location"), null, p);
      await r.text();
    }
  }
  for (const p of paginas) {
    const r = await get(p);
    const h = await r.text();
    assert.equal(r.status, 200, p + ": " + h.slice(0, 1500));
    if (["/descoberta", "/mensagens", "/eventos"].includes(p)) {
      assert.ok(h.includes('href="' + p + '" aria-label='), p);
    }
  }
  for (const p of ["/descoberta", "/perfil", "/mensagens", "/eventos/mapa",
    "/configuracoes", "/compras", "/midias-de-trabalho/inexistente",
    "/midias-de-publicacao/inexistente"]) {
    const r = await get(p, false);
    assert.equal(r.status, 302, p);
    assert.equal(r.headers.get("location"), "/entrar", p);
    await r.text();
  }
  for (const p of ["/cadastro", "/admin/entrar"]) {
    const r = await get(p, false);
    assert.equal(r.status, 200, p);
    await r.text();
  }
  const admin = await get("/admin");
  assert.equal(admin.status, 403);
  await admin.text();
  console.log(`Rotas: ${paginas.length} páginas autenticadas, 8 redirecionamentos de sessão, acesso administrativo isolado e ${removidas.length} URLs removidas sem atalhos.`);
} finally {
  if (child) { child.kill(); await fim; }
  b.fecharBancoCypher();
  if (path.dirname(pasta) === os.tmpdir() && path.basename(pasta).startsWith("cypher-rotas-"))
    fs.rmSync(pasta, { recursive: true, force: true });
}

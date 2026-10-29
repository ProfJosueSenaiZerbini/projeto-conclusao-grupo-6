import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const diretorio = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-admin-ui-"));
const arquivoBanco = path.join(diretorio, "cypher.sqlite");
const servidorPorta = createServer();
const porta = await new Promise((resolve, reject) => {
  servidorPorta.once("error", reject);
  servidorPorta.listen(0, "127.0.0.1", () => {
    const endereco = servidorPorta.address();
    servidorPorta.close(error =>
      error ? reject(error) : resolve(endereco.port)
    );
  });
});
const base = `http://127.0.0.1:${porta}`;
const processo = spawn(
  process.execPath,
  ["--import", "tsx", "src/aplicacao.ts"],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CYPHER_DB_PATH: arquivoBanco,
      CYPHER_ADMIN_EMAILS: "admin-ui@example.test",
      NODE_ENV: "test",
      PORT: String(porta),
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
);
let logServidor = "";
processo.stdout.on("data", dados => (logServidor += dados));
processo.stderr.on("data", dados => (logServidor += dados));

async function aguardarServidor() {
  for (let tentativa = 0; tentativa < 100; tentativa += 1) {
    try {
      const resposta = await fetch(`${base}/login`);
      if (resposta.ok) return;
    } catch {}
    if (processo.exitCode !== null) break;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  throw new Error(`Servidor não iniciou.\n${logServidor}`);
}

async function registrar(email, nome) {
  const resposta = await fetch(`${base}/register`, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      name: nome,
      email,
      password: "SenhaForteDeTeste2026",
      categorias: "Rapper",
      respostasAtuacoesJson: JSON.stringify({
        Rapper: {
          tempoAtuacao: "1-3a",
          situacaoAtual: "regular",
          objetivos: ["colaboradores"],
          projetos: "iniciando",
        },
      }),
      visibilidadesAtuacoesJson: JSON.stringify({}),
    }),
  });
  const corpo = await resposta.text();
  assert.equal(resposta.status, 303, `Cadastro falhou para ${email}: ${corpo}`);
}

try {
  await aguardarServidor();
  const cadastroInicial = await fetch(`${base}/register`);
  assert.equal(cadastroInicial.status, 200);
  const cadastroInicialHtml = await cadastroInicial.text();
  assert.match(cadastroInicialHtml, /Sua trajetória por categoria/);
  assert.match(cadastroInicialHtml, /data-atuacao-questionario/);
  await registrar("admin-ui@example.test", "Admin UI");
  const banco = new Database(arquivoBanco);
  const inserirUsuario = banco.prepare(
    `INSERT INTO usuarios (id, email, senha_hash, tipo_conta, demonstracao, codigo_publico, numero_sequencial)
     VALUES (?, ?, 'teste', 'profissional', 0, ?, ?)`
  );
  const inserirPerfil = banco.prepare(
    `INSERT INTO perfis (usuario_id, c_tag, nome, funcao, identificador, iniciais, categorias_json, ultima_alteracao_categorias_em, demonstracao)
     VALUES (?, ?, ?, 'Rapper / MC', ?, 'TT', '["Rapper / MC"]', datetime('now', '-10 days'), 0)`
  );
  const adicionarContas = banco.transaction(() => {
    for (let indice = 1; indice <= 9; indice += 1) {
      const id = `admin-ui-fixture-${indice}`;
      inserirUsuario.run(
        id,
        `pessoa${indice}@example.test`,
        `CYP-UI${String(indice).padStart(5, "0")}`,
        100000 + indice
      );
      inserirPerfil.run(
        id,
        `CYP-UI-TAG-${indice}`,
        `Pessoa Teste ${indice}`,
        `@pessoa-teste-${indice}`
      );
    }
  });
  adicionarContas();
  const adminId = banco
    .prepare("SELECT id FROM usuarios WHERE email = ?")
    .get("admin-ui@example.test").id;
  const registrarHistorico = banco.prepare(
    `INSERT INTO auditoria_categorias (
       id, usuario_id, administrador_id, categorias_antes_json,
       categorias_depois_json, motivo
     ) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const id of ["admin-ui-fixture-1", "admin-ui-fixture-2"]) {
    registrarHistorico.run(
      `auditoria-inicial-${id}`,
      id,
      adminId,
      '["Rapper / MC"]',
      '["Rapper / MC"]',
      "Histórico anterior para validar o prazo de 60 dias."
    );
  }
  banco.close();

  const login = await fetch(`${base}/login`, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      email: "admin-ui@example.test",
      password: "SenhaForteDeTeste2026",
    }),
  });
  assert.equal(login.status, 302);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);

  const analisesResponse = await fetch(`${base}/admin/revisao`, {
    headers: { cookie },
  });
  assert.equal(analisesResponse.status, 200);
  const analises = await analisesResponse.text();
  assert.match(analises, /Análises/);
  assert.match(analises, /Gêneros sugeridos/);
  assert.doesNotMatch(analises, /admin-exception-search/);
  assert.doesNotMatch(analises, /href="#/);

  const excecoesResponse = await fetch(`${base}/admin/revisao/excecoes`, {
    headers: { cookie },
  });
  assert.equal(excecoesResponse.status, 200);
  const excecoes = await excecoesResponse.text();
  assert.match(excecoes, /Exceções ao prazo/);
  assert.match(excecoes, /admin-exception-search/);
  assert.doesNotMatch(excecoes, /Gêneros sugeridos/);
  assert.doesNotMatch(excecoes, /href="#/);
  assert.match(excecoes, /7\s*de\s*10\s*contas exibidas/);
  const linhasIniciais = excecoes.match(/class="admin-account-row"/g) ?? [];
  assert.equal(
    linhasIniciais.length,
    7,
    "A página inicial deve renderizar somente sete contas"
  );
  assert.match(excecoes, /data-initial-limit="7"/);
  assert.match(excecoes, /Mostrar todas as\s*10\s*contas/);
  assert.match(excecoes, /href="\/admin\/revisao\/excecoes" class="active"/);

  const expandidasResponse = await fetch(
    `${base}/admin/revisao/excecoes/busca?todos=1`,
    { headers: { cookie, accept: "application/json" } }
  );
  assert.equal(expandidasResponse.status, 200);
  const expandidas = await expandidasResponse.json();
  assert.equal(expandidas.total, 10);
  assert.equal(expandidas.perfis.length, 10);

  const buscaResponse = await fetch(
    `${base}/admin/revisao/excecoes/busca?q=${encodeURIComponent("Pessoa Teste 9")}`,
    { headers: { cookie, accept: "application/json" } }
  );
  assert.equal(buscaResponse.status, 200);
  const busca = await buscaResponse.json();
  assert.equal(busca.total, 1);
  assert.equal(busca.perfis[0].nome, "Pessoa Teste 9");

  const tokenComum = randomBytes(32).toString("base64url");
  const bancoSessao = new Database(arquivoBanco);
  bancoSessao
    .prepare(
      "INSERT INTO sessoes (token_hash, usuario_id, expira_em, criada_em) VALUES (?, ?, ?, ?)"
    )
    .run(
      createHash("sha256").update(tokenComum).digest("hex"),
      "admin-ui-fixture-1",
      Date.now() + 60_000,
      Date.now()
    );
  bancoSessao.close();
  const tokenSegundoUsuario = randomBytes(32).toString("base64url");
  const bancoSegundaSessao = new Database(arquivoBanco);
  bancoSegundaSessao
    .prepare(
      "INSERT INTO sessoes (token_hash, usuario_id, expira_em, criada_em) VALUES (?, ?, ?, ?)"
    )
    .run(
      createHash("sha256").update(tokenSegundoUsuario).digest("hex"),
      "admin-ui-fixture-2",
      Date.now() + 60_000,
      Date.now()
    );
  bancoSegundaSessao.close();

  const motivoInvalido = await fetch(
    `${base}/profile/categorias/solicitar-excecao`,
    {
      method: "POST",
      redirect: "manual",
      headers: {
        cookie: `cypher_session=${tokenSegundoUsuario}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ categorias: "Rapper", motivoCodigo: "" }),
    }
  );
  assert.equal(motivoInvalido.status, 400);
  assert.match(await motivoInvalido.text(), /Selecione um motivo/);

  for (const token of [tokenComum, tokenSegundoUsuario]) {
    const solicitacao = await fetch(
      `${base}/profile/categorias/solicitar-excecao`,
      {
        method: "POST",
        redirect: "manual",
        headers: {
          cookie: `cypher_session=${token}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          categorias: "Rapper",
          motivoCodigo: "novos_trabalhos",
          respostasAtuacoesJson: JSON.stringify({
            Rapper: {
              tempoAtuacao: "1-3a",
              situacaoAtual: "regular",
              objetivos: ["colaboradores"],
              projetos: "iniciando",
            },
          }),
          visibilidadesAtuacoesJson: JSON.stringify({}),
        }),
      }
    );
    assert.equal(solicitacao.status, 303);
    assert.match(
      solicitacao.headers.get("location") ?? "",
      /profile\?editar=1/
    );
  }

  const perfilPendente = await fetch(`${base}/profile?editar=1`, {
    headers: { cookie: `cypher_session=${tokenComum}` },
  });
  assert.equal(perfilPendente.status, 200);
  const perfilPendenteHtml = await perfilPendente.text();
  assert.match(
    perfilPendenteHtml,
    /Sua solicitação foi enviada e aguarda análise/
  );
  assert.doesNotMatch(perfilPendenteHtml, /profile-exception-request-form/);

  const bancoPedidos = new Database(arquivoBanco);
  const pedido1 = bancoPedidos
    .prepare(
      "SELECT id FROM solicitacoes_excecao_categorias WHERE usuario_id = ? AND status = 'pendente'"
    )
    .get("admin-ui-fixture-1").id;
  const pedido2 = bancoPedidos
    .prepare(
      "SELECT id FROM solicitacoes_excecao_categorias WHERE usuario_id = ? AND status = 'pendente'"
    )
    .get("admin-ui-fixture-2").id;
  bancoPedidos.close();

  const pedidosResponse = await fetch(`${base}/admin/revisao/excecoes`, {
    headers: { cookie },
  });
  assert.equal(pedidosResponse.status, 200);
  const pedidosHtml = await pedidosResponse.text();
  assert.match(pedidosHtml, /Solicitações de exceção/);
  assert.match(pedidosHtml, /Motivo informado:/);
  assert.match(pedidosHtml, /Recusar solicitação/);
  assert.match(pedidosHtml, /Aprovar e liberar/);
  assert.match(pedidosHtml, /data-exception-request=/);

  const recusaNaoAdmin = await fetch(
    `${base}/admin/revisao/solicitacoes-excecao/${pedido1}`,
    {
      method: "POST",
      redirect: "manual",
      headers: {
        cookie: `cypher_session=${tokenComum}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        acao: "rejeitar",
        motivo: "Justificativa de teste.",
      }),
    }
  );
  assert.equal(recusaNaoAdmin.status, 403);

  const aprovarPedido = await fetch(
    `${base}/admin/revisao/solicitacoes-excecao/${pedido1}`,
    {
      method: "POST",
      redirect: "manual",
      headers: { cookie, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        acao: "aprovar",
        motivo: "Mudança profissional verificada pela equipe.",
      }),
    }
  );
  assert.equal(aprovarPedido.status, 303);
  assert.match(
    aprovarPedido.headers.get("location") ?? "",
    /solicitacao_excecao_aprovada/
  );

  const recusarPedido = await fetch(
    `${base}/admin/revisao/solicitacoes-excecao/${pedido2}`,
    {
      method: "POST",
      redirect: "manual",
      headers: { cookie, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        acao: "rejeitar",
        motivo: "O motivo apresentado não indica necessidade imediata.",
      }),
    }
  );
  assert.equal(recusarPedido.status, 303);
  assert.match(
    recusarPedido.headers.get("location") ?? "",
    /solicitacao_excecao_rejeitada/
  );

  const bancoDecisoes = new Database(arquivoBanco);
  assert.equal(
    bancoDecisoes
      .prepare(
        "SELECT status FROM solicitacoes_excecao_categorias WHERE id = ?"
      )
      .get(pedido1).status,
    "aprovado"
  );
  assert.ok(
    bancoDecisoes
      .prepare(
        "SELECT usada_em FROM excecoes_categorias WHERE usuario_id = ? AND usada_em IS NOT NULL"
      )
      .get("admin-ui-fixture-1")
  );
  assert.deepEqual(
    JSON.parse(
      bancoDecisoes
        .prepare("SELECT categorias_json FROM perfis WHERE usuario_id = ?")
        .get("admin-ui-fixture-1").categorias_json
    ),
    ["Rapper"]
  );
  assert.equal(
    bancoDecisoes
      .prepare(
        "SELECT status, motivo_revisao FROM solicitacoes_excecao_categorias WHERE id = ?"
      )
      .get(pedido2).status,
    "rejeitado"
  );
  assert.equal(
    bancoDecisoes
      .prepare(
        "SELECT COUNT(*) AS total FROM excecoes_categorias WHERE usuario_id = ?"
      )
      .get("admin-ui-fixture-2").total,
    0
  );
  bancoDecisoes.close();

  const perfilAprovado = await fetch(`${base}/profile?editar=1`, {
    headers: { cookie: `cypher_session=${tokenComum}` },
  });
  assert.equal(perfilAprovado.status, 200);
  const perfilRecusado = await fetch(`${base}/profile?editar=1`, {
    headers: { cookie: `cypher_session=${tokenSegundoUsuario}` },
  });
  const perfilRecusadoHtml = await perfilRecusado.text();
  assert.match(perfilRecusadoHtml, /Solicitação anterior recusada/);
  assert.match(
    perfilRecusadoHtml,
    /O motivo apresentado não indica necessidade imediata/
  );
  assert.match(perfilRecusadoHtml, /profile-exception-request-form/);

  const buscaNaoAdmin = await fetch(
    `${base}/admin/revisao/excecoes/busca?todos=1`,
    { headers: { cookie: `cypher_session=${tokenComum}` } }
  );
  assert.equal(buscaNaoAdmin.status, 403);

  console.log(
    "OK: admin navegável e allowlist; limite de sete contas e busca; pedidos HTTP, aprovação, recusa auditada, validação, perfil atualizado e bloqueio a não-admin."
  );
} catch (erro) {
  console.error(erro);
  if (logServidor) console.error(logServidor);
  process.exitCode = 1;
} finally {
  processo.kill("SIGTERM");
  await new Promise(resolve => setTimeout(resolve, 250));
  fs.rmSync(diretorio, { recursive: true, force: true });
}

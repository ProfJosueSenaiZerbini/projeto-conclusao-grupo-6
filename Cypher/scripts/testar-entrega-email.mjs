import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-smtp-"));
Object.assign(process.env, {
  NODE_ENV: "production",
  CYPHER_DB_PATH: path.join(pasta, "teste.sqlite"),
  CYPHER_EMAIL_TRANSPORT: "smtp",
  CYPHER_EMAIL_FROM: "teste@example.org",
  CYPHER_SMTP_USER: "teste@example.org",
  CYPHER_SMTP_PASSWORD: "credencial-ficticia",
  CYPHER_PUBLIC_ORIGIN: "https://example.org",
});
const original = nodemailer.createTransport;
let falhar = false,
  mensagem;
nodemailer.createTransport = opcoes => {
  assert.equal(opcoes.host, "smtp.gmail.com");
  assert.equal(opcoes.secure, true);
  assert.equal(opcoes.port, 465);
  assert.equal(opcoes.debug, false);
  return {
    sendMail: async dados => {
      mensagem = dados;
      if (falhar) throw new Error("resposta SMTP privada");
      return { accepted: [dados.to], rejected: [] };
    },
  };
};
const b = await import("../dist/src/app/models/bancoDados.js");
const email = await import("../dist/src/app/models/confirmacaoEmail.js");
try {
  b.inicializarBancoCypher();
  b.criarContaCypher({
    id: "teste",
    funcao: "Consumidor",
    nome: "Teste",
    email: "destino@example.org",
    senhaHash: "fixture",
    tipoConta: "consumidor",
    identificador: "teste.smtp",
    categorias: [],
  });
  await email.emitirConfirmacaoEmail("teste", "destino@example.org");
  assert.equal(mensagem.from.address, "teste@example.org");
  assert.equal(mensagem.subject, "Confirme seu e-mail | Cypher");
  assert.match(mensagem.html, /Confirmar meu e-mail/);
  assert.match(mensagem.html, /role="presentation"/);
  assert.match(mensagem.text, /30 minutos/);
  const token = mensagem.text.match(/token=([a-f0-9]{64})/)[1];
  assert.ok(mensagem.html.includes(`https://example.org/confirmar-email?token=${token}`));
  assert.equal(await email.confirmarEmailUsuario(token), "teste");
  assert.equal(mensagem.subject, "A cena também é sua. Bem-vindo à Cypher!");
  assert.match(mensagem.html, /href="https:\/\/example.org\/descoberta"/);
  const db = b.conexaoInternaCypher();
  db.prepare("UPDATE tokens_confirmacao_email SET criado_em=0").run();
  falhar = true;
  await assert.rejects(
    email.emitirConfirmacaoEmail("teste", "novo@example.org", "alteracao"),
    /Não foi possível enviar/
  );
  assert.equal(
    db.prepare("SELECT email FROM usuarios WHERE id='teste'").get().email,
    "destino@example.org"
  );
  const tokenFalho = mensagem.text.match(/token=([a-f0-9]{64})/)[1];
  await assert.rejects(
    email.confirmarEmailUsuario(tokenFalho),
    /inválido ou expirado/
  );
  db.prepare("UPDATE tokens_confirmacao_email SET criado_em=0").run();
  falhar = false;
  await email.emitirConfirmacaoEmail("teste", "novo@example.org", "alteracao");
  const tokenNovo = mensagem.text.match(/token=([a-f0-9]{64})/)[1];
  falhar = true;
  const erroOriginal = console.error;
  const avisos = [];
  try {
    console.error = texto => avisos.push(texto);
    assert.equal(await email.confirmarEmailUsuario(tokenNovo), "teste");
    assert.equal(mensagem.subject, "Seu e-mail foi alterado | Cypher");
    assert.equal(mensagem.to, "destino@example.org");
    assert.doesNotMatch(mensagem.html + mensagem.text, /novo@example\.org/);
  } finally {
    console.error = erroOriginal;
  }
  assert.equal(
    db.prepare("SELECT email FROM usuarios WHERE id='teste'").get().email,
    "novo@example.org"
  );
  assert.deepEqual(avisos, [
    "Não foi possível entregar o aviso de alteração de e-mail.",
  ]);
  await assert.rejects(
    email.confirmarEmailUsuario(tokenNovo),
    /inválido ou expirado/
  );
  const { montarEmailCypher } = await import("../dist/src/app/models/modelosEmail.js");
  const rota = "https://example.org/redefinir-senha?token=abc&x=%22";
  assert.match(montarEmailCypher("recuperacao", rota).html, /token=abc&amp;x=%22/);
  assert.throws(() => montarEmailCypher("confirmacao", "javascript:alert(1)"), /URL/);
  assert.match(montarEmailCypher("senhaAlterada").html, /href="https:\/\/example.org\/recuperar-senha"/);
  assert.match(montarEmailCypher("boasVindasProfissional").html, /href="https:\/\/example.org\/perfil"/);
  assert.match(montarEmailCypher("conversao").html, /href="https:\/\/example.org\/perfil"/);
  process.env.CYPHER_SUPPORT_EMAIL = "ajuda@example.org";
  assert.match(montarEmailCypher("encerramento").html, /href="mailto:ajuda@example.org"/);
  assert.doesNotMatch(montarEmailCypher("encerramento").html, /recuperar-senha|reativar/i);
  assert.doesNotMatch(montarEmailCypher("conversao").html, /ajuda@example.org/);
  process.env.CYPHER_PUBLIC_ORIGIN = "http://example.org";
  const entrega = await import("../dist/src/app/models/entregaEmail.js");
  assert.throws(() => entrega.configurarEmail(), /HTTPS/);
  console.log(
    "OK: SMTP TLS, confirmação, rejeição de falha sem expor resposta privada, token invalidado e HTTPS em produção. Nenhuma mensagem externa enviada."
  );
} finally {
  nodemailer.createTransport = original;
  b.fecharBancoCypher();
  fs.rmSync(pasta, { recursive: true, force: true });
}

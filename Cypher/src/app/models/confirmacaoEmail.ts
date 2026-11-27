import { createHash, randomBytes } from "node:crypto";
import { entregarEmail, entregarAvisoEmail, configurarEmail } from "./entregaEmail.js";

import { conexaoInternaCypher } from "./bancoDados.js";
import { validarEmail } from "../validators/validarAutenticacao.js";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const duracaoConfirmacaoEmailMs = 30 * 60 * 1000;

export async function emitirConfirmacaoEmail(
  usuarioId: string,
  destino: string,
  finalidade: "cadastro" | "alteracao" = "cadastro"
) {
  if (validarEmail(destino)) throw new Error("Endereço de e-mail inválido.");
  const db = conexaoInternaCypher();
  const conta = db
    .prepare(
      "SELECT email,tipo_conta AS tipoConta,email_confirmado_em AS confirmado FROM usuarios WHERE id=?"
    )
    .get(usuarioId) as
    { email: string; tipoConta: string; confirmado: string | null } | undefined;
  if (
    !conta ||
    conta.tipoConta === "administrativo" ||
    (finalidade === "cadastro" && conta.confirmado)
  )
    throw new Error("Confirmação indisponível para esta conta.");
  const recente = db
    .prepare(
      "SELECT count(*) AS total,max(criado_em) AS ultimo FROM tokens_confirmacao_email WHERE usuario_id=? AND criado_em>?"
    )
    .get(usuarioId, Date.now() - 60 * 60 * 1000) as {
    total: number;
    ultimo: number | null;
  };
  if (
    recente.total >= 5 ||
    (recente.ultimo && Date.now() - recente.ultimo < 60_000)
  )
    throw new Error(
      "Aguarde um minuto antes de solicitar outro link de confirmação."
    );
  const ocupado = db
    .prepare("SELECT id FROM usuarios WHERE email=? COLLATE NOCASE AND id<>?")
    .get(destino, usuarioId);
  if (ocupado) throw new Error("O e-mail não está disponível.");
  configurarEmail();
  const token = randomBytes(32).toString("hex");
  const origem =
    process.env.CYPHER_PUBLIC_ORIGIN ??
    `http://localhost:${process.env.PORT ?? 3000}`;
  const url = new URL("/confirmar-email", origem);
  url.searchParams.set("token", token);
  db.transaction(() => {
    db.prepare(
      "UPDATE tokens_confirmacao_email SET usado_em=? WHERE usuario_id=? AND finalidade=? AND usado_em IS NULL"
    ).run(Date.now(), usuarioId, finalidade);
    db.prepare(
      "INSERT INTO tokens_confirmacao_email (token_hash,usuario_id,email_destino,finalidade,expira_em,criado_em) VALUES (?,?,?,?,?,?)"
    ).run(
      hashToken(token),
      usuarioId,
      destino.toLowerCase(),
      finalidade,
      Date.now() + duracaoConfirmacaoEmailMs,
      Date.now()
    );
  })();
  try {
    await entregarEmail(destino, "confirmacao", url.href);
  } catch (erro) {
    db.prepare(
      "UPDATE tokens_confirmacao_email SET usado_em=? WHERE token_hash=?"
    ).run(Date.now(), hashToken(token));
    throw erro;
  }
}

export async function confirmarEmailUsuario(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new Error("Link de confirmação inválido ou expirado.");
  const db = conexaoInternaCypher();
  const { usuarioId, aviso } = db.transaction(() => {
    const registro = db
      .prepare(
        "SELECT usuario_id AS usuarioId,email_destino AS email,finalidade FROM tokens_confirmacao_email WHERE token_hash=? AND usado_em IS NULL AND expira_em>?"
      )
      .get(hashToken(token), Date.now()) as
      { usuarioId: string; email: string; finalidade: string } | undefined;
    if (!registro) throw new Error("Link de confirmação inválido ou expirado.");
    const atual = db
      .prepare("SELECT email,tipo_conta,email_confirmado_em,demonstracao FROM usuarios WHERE id=?")
      .get(registro.usuarioId) as { email: string; tipo_conta: string; email_confirmado_em: string | null; demonstracao: number };
    if (registro.finalidade === "cadastro" && registro.email !== atual.email)
      throw new Error("Link de confirmação inválido ou expirado.");
    const ocupado = db
      .prepare("SELECT id FROM usuarios WHERE email=? COLLATE NOCASE AND id<>?")
      .get(registro.email, registro.usuarioId);
    if (ocupado) throw new Error("O novo e-mail não está disponível.");
    db.prepare(
      "UPDATE usuarios SET email=?,email_confirmado_em=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE id=?"
    ).run(registro.email, registro.usuarioId);
    db.prepare(
      "UPDATE tokens_confirmacao_email SET usado_em=? WHERE usuario_id=? AND usado_em IS NULL"
    ).run(Date.now(), registro.usuarioId);
    if (registro.finalidade === "alteracao") {
      db.prepare("DELETE FROM sessoes WHERE usuario_id=?").run(
        registro.usuarioId
      );
      return { usuarioId: registro.usuarioId, aviso: { destino: atual.email, tipo: "emailAlterado" as const } };
    }
    const tipo = atual.tipo_conta === "consumidor" ? "boasVindasPublico" as const
      : atual.tipo_conta === "profissional" ? "boasVindasProfissional" as const : undefined;
    // A primeira confirmação e o consumo do token são gravados no mesmo commit.
    const aviso = tipo && !atual.email_confirmado_em && !atual.demonstracao && registro.finalidade === "cadastro"
      ? { destino: registro.email, tipo } : undefined;
    return { usuarioId: registro.usuarioId, aviso };
  })();
  if (aviso?.tipo === "emailAlterado") {
    try {
      await entregarEmail(aviso.destino, aviso.tipo);
    } catch {
      console.error("Não foi possível entregar o aviso de alteração de e-mail.");
    }
  } else if (aviso) {
    await entregarAvisoEmail(aviso.destino, aviso.tipo);
  }
  return usuarioId;
}

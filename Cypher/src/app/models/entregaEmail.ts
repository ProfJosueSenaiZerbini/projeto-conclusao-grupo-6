import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validarEmail } from "../validators/validarAutenticacao.js";
import { montarEmailCypher, type TipoEmailCypher } from "./modelosEmail.js";

export function configurarEmail() {
  const arquivo = path.resolve(".env.local");
  if (process.env.NODE_ENV !== "test" && fs.existsSync(arquivo))
    process.loadEnvFile(arquivo);
  const modo =
    process.env.NODE_ENV === "test"
      ? "local"
      : (process.env.CYPHER_EMAIL_TRANSPORT ?? "local");
  const remetente = process.env.CYPHER_EMAIL_FROM ?? "og.cypher.ofc@gmail.com";
  if (validarEmail(remetente))
    throw new Error("Configure um remetente válido.");
  if (
    !["local", "smtp"].includes(modo) ||
    (modo === "local" && process.env.NODE_ENV === "production")
  )
    throw new Error("Configure a entrega SMTP antes de habilitar o cadastro.");
  if (
    modo === "smtp" &&
    (!process.env.CYPHER_SMTP_USER || !process.env.CYPHER_SMTP_PASSWORD)
  )
    throw new Error("Configuração SMTP incompleta.");
  if (process.env.NODE_ENV === "production") {
    const origem = new URL(
      process.env.CYPHER_PUBLIC_ORIGIN ?? "http://localhost"
    );
    if (origem.protocol !== "https:")
      throw new Error(
        "Configure a origem pública HTTPS dos links de confirmação."
      );
  }
  return { modo, remetente };
}

export function transporteGmail() {
  configurarEmail();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.CYPHER_SMTP_USER,
      pass: process.env.CYPHER_SMTP_PASSWORD?.replace(/\s/g, ""),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
  });
}

export async function entregarEmail(
  destino: string,
  tipo: TipoEmailCypher,
  link?: string
) {
  const { modo, remetente } = configurarEmail();
  if (validarEmail(destino)) throw new Error("Endereço de e-mail inválido.");
  const { assunto, text, html } = montarEmailCypher(tipo, link);
  if (modo === "local") {
    const limite = "cypher-" + randomUUID();
    const assuntoMime = assunto.replace(/[^\x00-\x7F]/, "") === assunto
      ? assunto
      : "=?UTF-8?B?" + Buffer.from(assunto).toString("base64") + "?=";
    const pasta = path.resolve(
      process.env.CYPHER_EMAIL_DIR ?? path.join(process.cwd(), "data", "emails")
    );
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(
      path.join(pasta, `${Date.now()}-${randomUUID()}.eml`),
      [
        `To: ${destino}`, `From: Cypher <${remetente}>`, `Subject: ${assuntoMime}`,
        `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${limite}"`, "",
        `--${limite}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: 8bit", "", text,
        `--${limite}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: 8bit", "", html,
        `--${limite}--`, "",
      ].join("\n"),
      { flag: "wx", mode: 0o600 }
    );
    return;
  }
  try {
    const resultado = await transporteGmail().sendMail({
      from: { name: "Cypher", address: remetente },
      to: destino,
      subject: assunto,
      text,
      html,
    });
    if (!resultado.accepted?.length || resultado.rejected?.length)
      throw new Error("Destinatário recusado.");
  } catch {
    throw new Error(
      "Não foi possível enviar o e-mail agora. Tente novamente em instantes."
    );
  }
}

// Avisos posteriores à operação não podem desfazer nem mascarar uma ação já concluída.
export async function entregarAvisoEmail(destino: string, tipo: TipoEmailCypher) {
  try {
    await entregarEmail(destino, tipo);
  } catch {
    console.error("Não foi possível entregar o comunicado da Cypher:", tipo);
  }
}

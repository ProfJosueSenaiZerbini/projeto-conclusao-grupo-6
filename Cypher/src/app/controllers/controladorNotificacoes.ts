import type { Request, Response } from "express";
import { CypherModel } from "../models/modeloCypher.js";
import type { UsuarioDaSessao } from "../models/bancoDados.js";

function usuarioAtual(res: Response): UsuarioDaSessao | undefined {
  return res.locals.usuario as UsuarioDaSessao | undefined;
}

export function notificacoes(_req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  if (!usuario) return res.redirect("/login");
  return res.render("pages/notificacoes", {
    title: "Notificações",
    path: "/notificacoes",
    stylesheet: "notificacoes",
    authenticated: true,
    usuario,
    notificacoes: CypherModel.notificacoes(usuario.id, 50),
    quantidadeNaoLidas: CypherModel.notificacoesNaoLidas(usuario.id),
  });
}

export function marcarLida(req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  if (!usuario) return res.redirect("/login");
  CypherModel.marcarNotificacaoLida(req.params.id ?? "", usuario.id);
  return res.redirect("/notificacoes");
}

export function marcarTodasLidas(_req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  if (!usuario) return res.redirect("/login");
  CypherModel.marcarTodasNotificacoesLidas(usuario.id);
  return res.redirect("/notificacoes");
}

import type { Request, Response } from "express";
import { CypherModel } from "../models/modeloCypher.js";

const caminhosProtegidos = new Set([
  "/",
  "/dashboard",
  "/search",
  "/events",
  "/works",
  "/works/new",
  "/beats",
  "/central",
  "/profile",
  "/settings",
]);

function autenticado(req: Request) {
  return (
    req.headers.cookie
      ?.split(";")
      .some(valor => valor.trim() === "cypher_session=active") ?? false
  );
}

function exigeAcesso(req: Request, res: Response) {
  if (caminhosProtegidos.has(req.path) && !autenticado(req)) {
    res.redirect("/login");
    return false;
  }
  return true;
}

export function renderizarPagina(
  view: string,
  title: string,
  data: Record<string, unknown> = {}
) {
  return (req: Request, res: Response) => {
    if (!exigeAcesso(req, res)) return;
    const stylesheet = view.split("/").pop();
    return res.render(view, {
      title,
      path: req.path,
      stylesheet,
      authenticated: autenticado(req),
      usuario: CypherModel.usuario(),
      ...data,
    });
  };
}

export const login = (req: Request, res: Response) => {
  res.setHeader(
    "Set-Cookie",
    "cypher_session=active; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400"
  );
  res.redirect("/dashboard");
};

export const register = (req: Request, res: Response) => {
  res.setHeader(
    "Set-Cookie",
    "cypher_session=active; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400"
  );
  res.redirect("/dashboard");
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("cypher_session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  res.redirect("/login");
};

export const analisarCategoria = (req: Request, res: Response) => {
  const categoria = String(req.body.categoria ?? "").trim();
  if (!categoria) {
    return res.status(400).json({
      status: "invalida",
      mensagem: "Descreva a categoria para solicitar uma análise.",
    });
  }
  return res.json({
    status: "demonstracao",
    mensagem: `A proposta “${categoria}” parece compatível com um perfil profissional e pode seguir para avaliação. Esta é uma pré-análise simulada; a categoria não foi oficializada no protótipo.`,
  });
};

export const visaoGeral = renderizarPagina("pages/visao-geral", "Visão geral", {
  eventos: CypherModel.eventos(),
  pessoas: CypherModel.pessoas(),
  estatisticasObras: CypherModel.estatisticasObras(),
  hitDoMes: CypherModel.hitDoMes(),
});
export const buscarPessoas = renderizarPagina(
  "pages/busca-pessoas",
  "Buscar pessoas",
  { pessoas: CypherModel.pessoas() }
);
export const oportunidades = renderizarPagina(
  "pages/oportunidades",
  "Oportunidades",
  { eventos: CypherModel.eventos() }
);
export const obras = renderizarPagina("pages/obras", "Obras", {
  obras: CypherModel.obras(),
  estatisticasObras: CypherModel.estatisticasObras(),
});
export const novaObra = renderizarPagina(
  "pages/cadastro-obra",
  "Cadastrar obra",
  { mensagem: null, erro: null }
);
export const criarObraDemonstrativa = (req: Request, res: Response) => {
  if (!exigeAcesso(req, res)) return;
  const titulo = String(req.body.titulo ?? "").trim();
  if (!titulo) {
    return res.status(400).render("pages/cadastro-obra", {
      title: "Cadastrar obra",
      path: req.path,
      stylesheet: "cadastro-obra",
      authenticated: autenticado(req),
      usuario: CypherModel.usuario(),
      mensagem: null,
      erro: "Informe o título da obra.",
    });
  }
  return res.status(200).render("pages/cadastro-obra", {
    title: "Cadastrar obra",
    path: req.path,
    stylesheet: "cadastro-obra",
    authenticated: autenticado(req),
    usuario: CypherModel.usuario(),
    mensagem:
      "Cadastro demonstrativo recebido. Nesta versão, os dados não são persistidos.",
    erro: null,
  });
};
export const bancoBeats = renderizarPagina(
  "pages/banco-beats",
  "Banco de Beats",
  {
    beats: CypherModel.beats(),
  }
);
export const central = renderizarPagina("pages/central", "Cypher Central", {
  faqs: CypherModel.faqs(),
});
export const perfil = renderizarPagina("pages/perfil", "Meu perfil", {
  obras: CypherModel.obras(),
  estatisticasObras: CypherModel.estatisticasObras(),
});
export const configuracoes = renderizarPagina(
  "pages/configuracoes",
  "Configurações"
);

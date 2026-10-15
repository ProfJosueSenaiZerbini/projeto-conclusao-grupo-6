import type { Request, Response } from "express";
import {
  CypherModel,
  type DadosEventoCypher,
  type EventoContaPersistido,
  type FiltrosEventos,
} from "../models/modeloCypher.js";
import { rotuloStatusProfissional } from "../models/modeloPerfil.js";
import type { UsuarioDaSessao } from "../models/bancoDados.js";
import {
  categoriasEvento,
  coresEvento,
  etiquetasDoFormulario,
  situacoesEvento,
  validarFormularioEvento,
  type ValoresFormularioEvento,
} from "../validators/validarEvento.js";

const valoresVazios: ValoresFormularioEvento = {
  titulo: "",
  categoria: "",
  data: "",
  horario: "",
  local: "",
  organizador: "",
  situacao: "Inscrições abertas",
  cor: "yellow",
  descricao: "",
  formato: "",
  inscricao: "",
  premio: "",
  etiquetas: "",
};

function usuarioAtual(res: Response): UsuarioDaSessao {
  return res.locals.usuario as UsuarioDaSessao;
}

function usuarioParaView(usuario: UsuarioDaSessao) {
  return {
    ...usuario,
    availabilityLabel: rotuloStatusProfissional(
      usuario.availability,
      usuario.categories
    ),
  };
}

function textoQuery(req: Request, chave: string): string {
  const valor = req.query[chave];
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizarFiltros(req: Request): FiltrosEventos {
  const periodo = textoQuery(req, "periodo");
  const ordem = textoQuery(req, "ordem");
  return {
    categoria: textoQuery(req, "categoria"),
    localizacao: textoQuery(req, "localizacao").slice(0, 100),
    formato: textoQuery(req, "formato"),
    periodo:
      periodo === "passados" || periodo === "proximos" ? periodo : "todos",
    ordem: ordem === "titulo" || ordem === "data" ? ordem : "recentes",
  };
}

function formatarData(data: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
    .format(new Date(`${data}T00:00:00Z`))
    .replace(".", "")
    .toUpperCase();
}

function prepararEventoParaView(evento: EventoContaPersistido) {
  return { ...evento, date: formatarData(evento.date) };
}

function formularioDoEvento(
  evento: EventoContaPersistido
): ValoresFormularioEvento {
  return {
    titulo: evento.title,
    categoria: evento.category,
    data: evento.date,
    horario: evento.time,
    local: evento.location,
    organizador: evento.org,
    situacao: evento.status,
    cor: evento.color,
    descricao: evento.description,
    formato: evento.format,
    inscricao: evento.registration,
    premio: evento.prize,
    etiquetas: evento.tags.join(", "),
  };
}

function dadosDoFormulario(req: Request): ValoresFormularioEvento {
  const valor = (chave: string) => String(req.body[chave] ?? "").trim();
  return {
    titulo: valor("titulo"),
    categoria: valor("categoria"),
    data: valor("data"),
    horario: valor("horario"),
    local: valor("local"),
    organizador: valor("organizador"),
    situacao: valor("situacao"),
    cor: valor("cor") || "yellow",
    descricao: valor("descricao"),
    formato: valor("formato"),
    inscricao: valor("inscricao"),
    premio: valor("premio"),
    etiquetas: valor("etiquetas"),
  };
}

function dadosPersistidos(valores: ValoresFormularioEvento): DadosEventoCypher {
  return {
    title: valores.titulo,
    category: valores.categoria,
    date: valores.data,
    time: valores.horario,
    location: valores.local,
    org: valores.organizador,
    status: valores.situacao,
    color: valores.cor,
    description: valores.descricao,
    format: valores.formato,
    registration: valores.inscricao,
    prize: valores.premio,
    tags: etiquetasDoFormulario(valores.etiquetas),
  };
}

function renderizarFormulario(
  req: Request,
  res: Response,
  valores: ValoresFormularioEvento,
  erro: string | null,
  editando: boolean,
  eventoId = ""
) {
  const usuario = usuarioAtual(res);
  return res.status(erro ? 400 : 200).render("pages/cadastro-evento", {
    title: editando ? "Editar evento" : "Cadastrar evento",
    path: req.path,
    stylesheet: "cadastro-obra",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    valores,
    erro,
    mensagem: null,
    editando,
    eventoId,
    categoriasEvento,
    situacoesEvento,
    coresEvento,
  });
}

function exigirOrganizador(
  req: Request,
  res: Response
): UsuarioDaSessao | undefined {
  const usuario = usuarioAtual(res);
  if (usuario.tipoConta !== "organizador") {
    res.redirect("/events?erro=permissao");
    return undefined;
  }
  return usuario;
}

export function oportunidades(req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  const filtros = normalizarFiltros(req);
  const todos = CypherModel.eventosDisponiveis(
    {
      categoria: "",
      localizacao: "",
      formato: "",
      periodo: "todos",
      ordem: "titulo",
    },
    usuario.id
  );
  const eventos = CypherModel.eventosDisponiveis(filtros, usuario.id);
  const erro = textoQuery(req, "erro");
  const mensagem = textoQuery(req, "mensagem");
  return res.render("pages/oportunidades", {
    title: "Oportunidades",
    path: req.path,
    stylesheet: "oportunidades",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    eventos: eventos.map(prepararEventoParaView),
    filtros,
    opcoesCategorias: [...new Set(todos.map(evento => evento.category))],
    opcoesFormatos: [
      ...new Set(todos.map(evento => evento.format).filter(Boolean)),
    ],
    podeGerenciar: usuario.tipoConta === "organizador",
    erro,
    mensagem,
  });
}

export function novoEvento(req: Request, res: Response) {
  const usuario = exigirOrganizador(req, res);
  if (!usuario) return;
  return renderizarFormulario(
    req,
    res,
    {
      ...valoresVazios,
      organizador: usuario.name,
    },
    null,
    false
  );
}

export function criarEvento(req: Request, res: Response) {
  const usuario = exigirOrganizador(req, res);
  if (!usuario) return;
  const valores = dadosDoFormulario(req);
  const erro = validarFormularioEvento(valores);
  if (erro) return renderizarFormulario(req, res, valores, erro, false);
  CypherModel.criarEvento(usuario.id, dadosPersistidos(valores));
  return res.redirect("/events?mensagem=Evento criado com sucesso.");
}

export function editarEvento(req: Request, res: Response) {
  const usuario = exigirOrganizador(req, res);
  if (!usuario) return;
  const evento = CypherModel.evento(String(req.params.id), usuario.id);
  if (!evento || !evento.owned) return res.redirect("/events?erro=evento");
  return renderizarFormulario(
    req,
    res,
    formularioDoEvento(evento),
    null,
    true,
    evento.id
  );
}

export function atualizarEvento(req: Request, res: Response) {
  const usuario = exigirOrganizador(req, res);
  if (!usuario) return;
  const valores = dadosDoFormulario(req);
  const erro = validarFormularioEvento(valores);
  if (erro)
    return renderizarFormulario(
      req,
      res,
      valores,
      erro,
      true,
      String(req.params.id)
    );
  const atualizado = CypherModel.atualizarEvento(
    String(req.params.id),
    usuario.id,
    dadosPersistidos(valores)
  );
  return res.redirect(
    atualizado
      ? "/events?mensagem=Evento atualizado com sucesso."
      : "/events?erro=evento"
  );
}

export function excluirEvento(req: Request, res: Response) {
  const usuario = exigirOrganizador(req, res);
  if (!usuario) return;
  const excluido = CypherModel.excluirEvento(String(req.params.id), usuario.id);
  return res.redirect(
    excluido ? "/events?mensagem=Evento excluído." : "/events?erro=evento"
  );
}

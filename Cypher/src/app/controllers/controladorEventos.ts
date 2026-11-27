// @ts-nocheck
import { obterPreferenciasUsuario } from "../models/identidadeUsuario.js";
import { podePublicar } from "../models/permissoes.js";
import { normalizarBusca } from "../models/espacoTrabalho.js";
import { fotoEventoDemonstrativo } from "../models/modeloDescoberta.js";
import {
  resolverTemaEvento,
  temaEventoPadrao,
  temasEvento,
} from "../models/temasEvento.js";
import { conexaoInternaCypher } from "../models/bancoDados.js";
import {
  validarConfiguracaoEvento,
  salvarConfiguracaoEvento,
  configuracaoFormularioEvento,
  eventoAntesDeEditar,
  cancelarEvento,
  ErroEvento,
} from "../models/eventos.js";

import type { Request, Response } from "express";
import { cepEvento, enderecoEvento, lerEnderecoEvento, enderecoValido, rotuloEndereco, chaveEndereco, estadosEndereco, buscarPontoEvento, emitirProvaLocal, pontoDaProva, previaMapa } from "../models/localEvento.js";
import {
  CypherModel,
  type DadosEventoCypher,
  type EventoContaPersistido,
  type FiltrosEventos,
} from "../models/modeloCypher.js";
import {
  podeCriarEvento,
  rotuloStatusProfissional,
} from "../models/modeloPerfil.js";
import type { UsuarioDaSessao } from "../models/bancoDados.js";
import {
  categoriasEvento,
  coresEvento,
  etiquetasDoFormulario,
  situacoesEvento,
  tiposWorkshop,
  tiposParticipacaoEvento,
  validarFormularioEvento,
  type ValoresFormularioEvento,
} from "../validators/validarEvento.js";
import type { StatusInteresseEvento } from "../models/bancoDados.js";

const valoresVazios: ValoresFormularioEvento = {
  titulo: "",
  categoria: "",
  categoriaDetalhe: "",
  tiposWorkshop: [],
  data: "",
  horario: "",
  local: "",
  modoLocal: "endereco",
  endereco: enderecoEvento({}),
  provaLocal: "",
  organizador: "",
  situacao: "Inscrições abertas",
  cor: "yellow",
  temaCartao: temaEventoPadrao,
  descricao: "",
  formato: "",
  inscricao: "",
  premio: "",
  etiquetas: "",
  tipoParticipacao: "aberta",
  capacidade: "",
  criterios: "",
  fimData: "",
  fimHorario: "",
  localConfirmado: "",
  latitude: "",
  longitude: "",
  serieId: "",
  versao: 1,
};

function usuarioAtual(res: Response): UsuarioDaSessao {
  return res.locals.usuario as UsuarioDaSessao;
}

function usuarioParaView(usuario: UsuarioDaSessao) {
  return {
    ...usuario,
    availabilityLabel: rotuloStatusProfissional(usuario.availability),
  };
}

function textoQuery(req: Request, chave: string): string {
  const valor = req.query[chave];
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizarFiltros(req: Request, localizacao: string): FiltrosEventos {
  const periodo = textoQuery(req, "periodo");
  const ordem = textoQuery(req, "ordem");
  return {
    categoria: textoQuery(req, "categoria"),
    localizacao: localizacao.slice(0, 100),
    formato: textoQuery(req, "formato"),
    periodo:
      periodo === "passados" || periodo === "proximos" ? periodo : "todos",
    ordem: ordem === "titulo" || ordem === "data" ? ordem : "recentes",
  };
}

const dataDoEvento = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

function prepararEventoParaView(evento: EventoContaPersistido) {
  const data = new Date(`${evento.date}T00:00:00Z`);
  const partes =
    /^\d{4}-\d{2}-\d{2}$/.test(evento.date) && Number.isFinite(data.getTime())
      ? dataDoEvento.formatToParts(data)
      : [];
  const dia = partes.find(parte => parte.type === "day")?.value;
  const mes = partes
    .find(parte => parte.type === "month")
    ?.value.replace(/\.$/, "")
    .toUpperCase();

  return {
    evento: {
      ...evento,
      date: dia && mes ? `${dia} ${mes}` : evento.date || "A confirmar",
    },
    item: {
      titulo: evento.title,
      tipo: [evento.category, evento.categoryDetail, ...evento.workshopTypes]
        .filter(Boolean)
        .join(" · "),
      workshopTypes: evento.workshopTypes,
      categoria: evento.category,
      temaCartao: resolverTemaEvento(evento.temaCartao),
      data: evento.date,
      dataCurta: partes.map(parte => parte.value).join(""),
      dia,
      mes,
      autor: evento.org,
      local: evento.location,
      hora: evento.time,
      status: evento.status,
      descricao: evento.description,
      demonstracao: evento.demonstracao,
      fotoDestaque: fotoEventoDemonstrativo(evento.id),
    },
  };
}

function formularioDoEvento(
  evento: EventoContaPersistido
): ValoresFormularioEvento {
  const cfg = configuracaoFormularioEvento(evento.proprietarioId, evento.id);
  const endereco = lerEnderecoEvento(cfg.enderecoMapaJson);
  return {
    modoLocal: endereco ? "endereco" : "texto",
    endereco: endereco ?? enderecoEvento({}),
    provaLocal: "",
    titulo: evento.title,
    categoria: evento.category,
    categoriaDetalhe: evento.categoryDetail,
    tiposWorkshop: evento.workshopTypes ?? [],
    data: evento.date,
    horario: evento.time,
    local: evento.location,
    organizador: evento.org,
    situacao: evento.status,
    cor: evento.color,
    temaCartao: resolverTemaEvento(evento.temaCartao),
    descricao: evento.description,
    formato: evento.format,
    inscricao: evento.registration,
    premio: evento.prize,
    etiquetas: evento.tags.join(", "),
    tipoParticipacao: evento.participationType,
    ...cfg,
  };
}

function dadosDoFormulario(
  req: Request,
  temaAtual = temaEventoPadrao,
  anterior?: ValoresFormularioEvento,
  ator = ""
): ValoresFormularioEvento {
  const valor = (chave: string) => String(req.body[chave] ?? "").trim();
  const modoLocal = valor("modoLocal") === "endereco" ? "endereco" : "texto";
  const endereco = enderecoEvento(req.body);
  const local = modoLocal === "endereco" ? rotuloEndereco(endereco) : valor("local");
  const provaLocal = modoLocal === "endereco" ? valor("provaLocal") : "";
  const ponto = provaLocal ? pontoDaProva(ator, endereco, provaLocal) : null;
  const enderecoMapaJson = modoLocal === "endereco" && enderecoValido(endereco) ? JSON.stringify(endereco) : "";
  const mesmoLocal = anterior && anterior.modoLocal === modoLocal &&
    (modoLocal === "endereco" ? chaveEndereco(anterior.endereco) === chaveEndereco(endereco) : anterior.local === local);
  const mapa = mesmoLocal ? anterior : undefined;
  const erroMapa = modoLocal !== "endereco" ? "" : !enderecoValido(endereco)
    ? "Informe rua, cidade e estado ou selecione outro tipo de local."
    : valor("cep") && !endereco.cep ? "Informe um CEP com 8 dígitos ou deixe o campo em branco."
    : provaLocal && !ponto ? "A confirmação do mapa expirou ou o endereço mudou. Confira o ponto novamente ou publique sem mapa." : "";
  return {
    titulo: valor("titulo"),
    capacidade: valor("capacidade"),
    criterios: valor("criterios"),
    fimData: valor("fimData"),
    fimHorario: valor("fimHorario"),
    modoLocal, endereco, enderecoMapaJson, provaLocal: erroMapa ? "" : provaLocal, erroMapa,
    localConfirmado: ponto ? "sim" : mapa?.localConfirmado ?? "",
    latitude: ponto?.latitude ?? mapa?.latitude ?? "",
    longitude: ponto?.longitude ?? mapa?.longitude ?? "",
    serieId: valor("serieId"),
    versao: valor("versao"),
    categoria: valor("categoria"),
    categoriaDetalhe:
      valor("categoria") === "Outro" ? valor("categoriaDetalhe") : "",
    tiposWorkshop:
      valor("categoria") === "Workshop"
        ? (Array.isArray(req.body.tiposWorkshop)
            ? req.body.tiposWorkshop
            : req.body.tiposWorkshop === undefined
              ? []
              : [req.body.tiposWorkshop]
          )
            .map((tipo: unknown) => String(tipo).trim())
            .filter(Boolean)
        : [],
    data: valor("data"),
    horario: valor("horario"),
    local,
    organizador: valor("organizador"),
    situacao: valor("situacao"),
    cor: valor("cor") || "yellow",
    temaCartao:
      req.body.temaCartao === undefined ? temaAtual : valor("temaCartao"),
    descricao: valor("descricao"),
    formato: valor("formato"),
    inscricao: valor("inscricao"),
    premio: valor("premio"),
    etiquetas: valor("etiquetas"),
    tipoParticipacao: tiposParticipacaoEvento.includes(
      valor("tipoParticipacao") as (typeof tiposParticipacaoEvento)[number]
    )
      ? (valor("tipoParticipacao") as (typeof tiposParticipacaoEvento)[number])
      : "aberta",
  };
}

function dadosPersistidos(valores: ValoresFormularioEvento): DadosEventoCypher {
  return {
    title: valores.titulo,
    category: valores.categoria,
    categoryDetail:
      valores.categoria === "Outro" ? valores.categoriaDetalhe : "",
    workshopTypes: valores.tiposWorkshop,
    date: valores.data,
    time: valores.horario,
    location: valores.local,
    org: valores.organizador,
    status: valores.situacao,
    color: valores.cor,
    temaCartao: valores.temaCartao,
    description: valores.descricao,
    format: valores.formato,
    registration: valores.inscricao,
    prize: valores.premio,
    tags: etiquetasDoFormulario(valores.etiquetas),
    participationType: valores.tipoParticipacao,
  };
}

function renderizarFormulario(
  req: Request,
  res: Response,
  valores: ValoresFormularioEvento,
  erro: string | null,
  editando: boolean,
  eventoId = "",
  categoriaOutroLegadaVazia = false
) {
  const usuario = usuarioAtual(res);
  return res.status(erro ? 400 : 200).render("pages/cadastro-evento", {
    title: editando ? "Editar evento" : "Cadastrar evento",
    path: res.locals.origemEspaco ? "/espaco-de-trabalho" : req.path,
    stylesheet: "cadastro-evento",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    valores,
    erro,
    mensagem: null,
    editando,
    eventoId,
    categoriaOutroLegadaVazia,
    categoriasEvento,
    situacoesEvento,
    coresEvento,
    tiposWorkshop,
    temasEvento,
    temaSelecionado: resolverTemaEvento(valores.temaCartao),
    estadosEndereco,
    tiposParticipacaoEvento,
  });
}

function exigirOrganizador(
  req: Request,
  res: Response
): UsuarioDaSessao | undefined {
  const usuario = usuarioAtual(res);
  if (!podePublicar(usuario, "evento")) {
    res.redirect("/eventos?erro=permissao");
    return undefined;
  }
  return usuario;
}

function exigirResponsavelEvento(
  req: Request,
  res: Response
): { usuario: UsuarioDaSessao; evento: EventoContaPersistido } | undefined {
  const usuario = usuarioAtual(res);
  if (usuario.demonstracao || usuario.tipoConta !== "profissional") {
    res.redirect("/eventos?erro=permissao");
    return undefined;
  }
  const evento = CypherModel.evento(String(req.params.id), usuario.id);
  if (!evento || !evento.owned || evento.demonstracao) {
    res.redirect("/eventos?erro=evento");
    return undefined;
  }
  return { usuario, evento };
}

export function oportunidades(req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  const preferencias = obterPreferenciasUsuario(usuario.id);
  const localizacao =
    req.query.localizacao === undefined
      ? undefined
      : textoQuery(req, "localizacao").slice(0, 100);
  const filtros = normalizarFiltros(req, localizacao ?? preferencias.regiao);
  const mapaAgenda = filtros.localizacao ? "/eventos/mapa?" + new URLSearchParams({localizacao:filtros.localizacao}) : "/eventos/mapa";
  const q = textoQuery(req, "q").slice(0, 120);
  const termos = normalizarBusca(q).split(/\s+/).filter(Boolean);
  const todos = CypherModel.eventosDisponiveis(
    {
      categoria: "",
      localizacao: "",
      formato: "",
      periodo: "todos",
      ordem: "recentes",
    },
    usuario.id
  );
  const termosLocal = normalizarBusca(filtros.localizacao)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const refinoAtivo = Boolean(
    filtros.formato ||
    filtros.periodo !== "todos" ||
    filtros.ordem !== "recentes"
  );
  const fonte =
    refinoAtivo || filtros.categoria
      ? CypherModel.eventosDisponiveis(
          { ...filtros, localizacao: "" },
          usuario.id
        )
      : todos;
  const eventos = fonte.filter(evento => {
    if (termosLocal.length) {
      const local = normalizarBusca(evento.location);
      if (!termosLocal.every(termo => local.includes(termo))) return false;
    }
    if (!termos.length) return true;
    const campos = [
      evento.title,
      evento.org,
      evento.category,
      evento.categoryDetail,
      evento.location,
      evento.format,
      evento.description,
      ...evento.tags,
    ];
    const texto = normalizarBusca(campos.join(" "));
    return termos.every(termo => texto.includes(termo));
  });
  const opcoesCategorias = [
    ...new Set(
      [
        "Batalha",
        "Show",
        "Cypher",
        "Workshop",
        ...todos.map(evento => evento.category),
        filtros.categoria,
      ].filter(Boolean)
    ),
  ];
  const opcoesFormatos = [
    ...new Set(
      [...todos.map(evento => evento.format), filtros.formato].filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return res.render("pages/oportunidades", {
    title: "Eventos",
    path: req.path,
    stylesheet: "oportunidades",
    temaPreferido: preferencias.tema,
    authenticated: true,
    usuario: usuarioParaView(usuario),
    eventos: eventos.map(prepararEventoParaView),
    q,
    filtros,
    refinoAtivo,
    filtrado: Boolean(
      q || filtros.categoria || filtros.localizacao || refinoAtivo
    ),
    localizacaoSelecionada: localizacao,
    opcoesCategorias,
    opcoesFormatos,
    mapaAgenda,
    podeGerenciar: podePublicar(usuario, "evento"),
    erro: textoQuery(req, "erro"),
    mensagem: textoQuery(req, "mensagem"),
  });
}

function redirecionarEventos(
  res: Response,
  sucesso: boolean,
  mensagem: string,
  erro: string
) {
  return res.redirect(
    sucesso
      ? `/eventos?mensagem=${encodeURIComponent(mensagem)}`
      : `/eventos?erro=${encodeURIComponent(erro)}`
  );
}

export function demonstrarInteresse(req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  const status = CypherModel.demonstrarInteresseEvento(
    String(req.params.id),
    usuario.id
  );
  return redirecionarEventos(
    res,
    status !== null,
    status === "inscrito"
      ? "Solicitação de participação enviada."
      : "Participação registrada com sucesso.",
    "Não foi possível registrar sua participação neste evento."
  );
}

export function cancelarInteresse(req: Request, res: Response) {
  const usuario = usuarioAtual(res);
  const cancelado = CypherModel.cancelarInteresseEvento(
    String(req.params.id),
    usuario.id
  );
  return redirecionarEventos(
    res,
    cancelado,
    "Participação cancelada.",
    "Não havia uma participação ativa para cancelar."
  );
}

export function atualizarInteresse(req: Request, res: Response) {
  const responsavel = exigirResponsavelEvento(req, res);
  if (!responsavel) return;
  const { usuario } = responsavel;
  const statusRecebido = String(req.body.status ?? "");
  const statusPermitidos = new Set<StatusInteresseEvento>([
    "interessado",
    "inscrito",
    "confirmado",
    "rejeitado",
  ]);
  if (!statusPermitidos.has(statusRecebido as StatusInteresseEvento)) {
    return redirecionarEventos(
      res,
      false,
      "",
      "Status de participação inválido."
    );
  }
  const atualizado = CypherModel.atualizarStatusInteresseEvento(
    String(req.params.id),
    usuario.id,
    String(req.params.usuarioId),
    statusRecebido as Extract<
      StatusInteresseEvento,
      "interessado" | "inscrito" | "confirmado" | "rejeitado"
    >
  );
  return redirecionarEventos(
    res,
    atualizado,
    "Status de participação atualizado.",
    "Não foi possível atualizar esta participação."
  );
}

export async function consultarLocalEvento(req: Request, res: Response) {
  res.set("Cache-Control","private, no-store");
  const usuario = usuarioAtual(res);
  if (!usuario || !podePublicar(usuario, "evento")) return res.status(403).json({mensagem:"Somente organizadores podem consultar endereços de eventos."});
  const e = enderecoEvento(req.body);
  if (req.body.acao === "cep") {
    if (!e.cep) return res.status(400).json({mensagem:"Digite um CEP com 8 dígitos."});
    try {
      const r = await fetch("https://viacep.com.br/ws/" + e.cep + "/json/", {signal:AbortSignal.timeout(4500)});
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (d.erro) return res.status(404).json({mensagem:"CEP não encontrado. Confira o número ou preencha o endereço manualmente."});
      return res.json({ endereco: enderecoEvento({cep:e.cep,rua:d.logradouro,bairro:d.bairro,cidade:d.localidade,uf:d.uf}) });
    } catch { return res.status(503).json({mensagem:"A busca por CEP está indisponível. Você pode preencher o endereço manualmente."}); }
  }
  if(req.body.acao !== "mapa" || !enderecoValido(e) || !e.numero || (req.body.cep && !e.cep))
    return res.status(400).json({mensagem:"Preencha rua, número, cidade e estado para conferir o ponto."});
  try {
    const ponto = await buscarPontoEvento(e);
    if (!ponto) return res.status(404).json({mensagem:"Não encontrei um ponto confiável para esse número. Confira o endereço ou publique sem pino."});
    return res.json({prova:emitirProvaLocal(usuario.id,e,ponto), mapa:previaMapa(ponto)});
  } catch {
    return res.status(503).json({mensagem:"Não foi possível consultar o mapa agora. Tente novamente ou publique sem pino."});
  }
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
  const valores = dadosDoFormulario(req, temaEventoPadrao, undefined, usuario.id);
  const erro = valores.erroMapa || validarFormularioEvento(valores);
  if (erro) return renderizarFormulario(req, res, valores, erro, false);
  let eventoId;
  try {
    validarConfiguracaoEvento(valores);
    eventoId = conexaoInternaCypher()
      .transaction(() => {
        const id = CypherModel.criarEvento(
          usuario.id,
          dadosPersistidos(valores)
        );
        salvarConfiguracaoEvento(usuario.id, id, valores);
        return id;
      })
      .immediate();
  } catch (e) {
    if (e instanceof ErroEvento)
      return renderizarFormulario(req, res, valores, e.message, false);
    throw e;
  }
  CypherModel.criarNotificacao({
    usuarioDestinoId: usuario.id,
    tipo: "evento_criado",
    titulo: "Novo evento criado",
    mensagem: `“${valores.titulo}” foi adicionado às suas oportunidades.`,
    url: "/eventos",
    entidadeTipo: "evento",
    entidadeId: eventoId,
    chaveOrigem: `evento-criado:${eventoId}`,
  });
  return res.redirect(
    res.locals.origemEspaco
      ? "/espaco-de-trabalho?resultado=eventoCriado"
      : "/eventos?mensagem=Evento criado com sucesso."
  );
}

export function editarEvento(req: Request, res: Response) {
  const responsavel = exigirResponsavelEvento(req, res);
  if (!responsavel) return;
  const { usuario, evento } = responsavel;
  return renderizarFormulario(
    req,
    res,
    formularioDoEvento(evento),
    null,
    true,
    evento.id,
    evento.category === "Outro" && !evento.categoryDetail
  );
}

export function atualizarEvento(req: Request, res: Response) {
  const responsavel = exigirResponsavelEvento(req, res);
  if (!responsavel) return;
  const { usuario, evento } = responsavel;
  const valores = dadosDoFormulario(
    req,
    resolverTemaEvento(evento.temaCartao),
    formularioDoEvento(evento),
    usuario.id
  );
  const categoriaOutroLegadaVazia =
    evento.category === "Outro" && !evento.categoryDetail;
  const erro = valores.erroMapa || validarFormularioEvento(valores, categoriaOutroLegadaVazia);
  if (erro)
    return renderizarFormulario(
      req,
      res,
      valores,
      erro,
      true,
      String(req.params.id),
      categoriaOutroLegadaVazia
    );
  let atualizado;
  try {
    validarConfiguracaoEvento(valores);
    atualizado = conexaoInternaCypher()
      .transaction(() => {
        const antes = eventoAntesDeEditar(usuario.id, String(req.params.id));
        const ok = CypherModel.atualizarEvento(
          String(req.params.id),
          usuario.id,
          dadosPersistidos(valores)
        );
        if (ok)
          salvarConfiguracaoEvento(
            usuario.id,
            String(req.params.id),
            valores,
            antes
          );
        return ok;
      })
      .immediate();
  } catch (e) {
    if (e instanceof ErroEvento)
      return renderizarFormulario(
        req,
        res,
        valores,
        e.message,
        true,
        String(req.params.id),
        categoriaOutroLegadaVazia
      );
    throw e;
  }
  if (atualizado) {
    CypherModel.criarNotificacao({
      usuarioDestinoId: usuario.id,
      tipo: "evento_atualizado",
      titulo: "Evento atualizado",
      mensagem: `As informações de “${valores.titulo}” foram salvas.`,
      url: "/eventos",
      entidadeTipo: "evento",
      entidadeId: String(req.params.id),
      chaveOrigem: `evento-atualizado:${req.params.id}:${valores.titulo}:${valores.situacao}`,
    });
  }
  return res.redirect(
    atualizado
      ? res.locals.origemEspaco
        ? "/espaco-de-trabalho?resultado=eventoAtualizado"
        : "/eventos?mensagem=Evento atualizado com sucesso."
      : "/eventos?erro=evento"
  );
}

export function excluirEvento(req: Request, res: Response) {
  const responsavel = exigirResponsavelEvento(req, res);
  if (!responsavel) return;
  const { usuario } = responsavel;
  return res.redirect(
    303,
    `/eventos/${encodeURIComponent(String(req.params.id))}#gestao`
  );
}

import type { Request, Response, NextFunction } from "express";
import * as m from "../models/eventos.js";
import { cidadeMapa, lerEnderecoEvento, pontoEvento, previaMapa } from "../models/localEvento.js";
type Acao = (req: Request, res: Response) => unknown;
const uid = (res: Response) => res.locals.usuario.id as string;
function render(
  req: Request,
  res: Response,
  tela: string,
  dados: Record<string, unknown> = {}
) {
  return res.render("pages/evento", {
    title: "Evento",
    stylesheet: "evento",
    path: "/eventos",
    tela,
    erro: "",
    formulario: {},
    estados: m.estadosInscricao,
    data: m.apresentarHorarioEvento,
    pontoEvento, previaMapa,
    ...dados,
  });
}
export const seguro =
  (fn: Acao) => (req: Request, res: Response, next: NextFunction) => {
    try {
      res.set("Cache-Control", "private, no-store");
      return fn(req, res);
    } catch (e) {
      if (e instanceof m.ErroEvento) {
        res.status(e.status);
        if (req.params.id && e.status !== 403 && e.status !== 404) {
          try {
            return render(req, res, "ficha", {
              f: m.fichaEvento(uid(res), req.params.id),
              erro: e.message,
              formulario: req.body,
            });
          } catch {}
        }
        return render(req, res, "erro", { erro: e.message });
      }
      next(e);
    }
  };
export const detalhe: Acao = (req, res) =>
  render(req, res, "ficha", { f: m.fichaEvento(uid(res), req.params.id!) });
export const mapa: Acao = (req, res) => {
  const todos = m.pontosMapaEventos(uid(res)).map(p => ({
    id: p.id, titulo: p.titulo, local: p.local, latitude: p.latitude, longitude: p.longitude,
    quando: p.inicio_em ? m.apresentarHorarioEvento(p.inicio_em) :
      p.data_texto.split("-").reverse().join("/") + " · Horário a confirmar",
    cidade: cidadeMapa(lerEnderecoEvento(p.endereco_mapa_json)),
  }));
  const cidades = [...new Map(todos.flatMap(p => p.cidade ? [[p.cidade.id,p.cidade] as const] : [])).values()]
    .sort((a,b) => a.label.localeCompare(b.label, "pt-BR"));
  const escolhido = todos.find(p => p.id === req.query.evento);
  const loc = typeof req.query.localizacao === "string" ? req.query.localizacao.slice(0,100).normalize("NFD").replace(/\p{M}/gu,"").toLowerCase() : "";
  const correspondencias = loc ? cidades.filter(c => {
    const cidadeUF = c.id.replace(/-([a-z]{2})$/, " $1");
    const nome = c.id.replace(/-[a-z]{2}$/, "");
    return loc === cidadeUF || loc === nome || loc.replace(/\s*[-,/]\s*/g," ") === cidadeUF;
  }) : [];
  const cidade = cidades.find(c => c.id === req.query.cidade)?.id ?? escolhido?.cidade?.id ??
    (correspondencias.length === 1 ? correspondencias[0]!.id : "");
  const pontos = cidade ? todos.filter(p => p.cidade?.id === cidade) : todos;
  return render(req, res, "mapa", { pontos, cidades, cidade, escolhido: escolhido?.id ?? "", usaMapaInterativo: pontos.length > 0 });
};
function agir(
  fn: (ator: string, id: string, b: Record<string, unknown>) => unknown
): Acao {
  return (req, res) => {
    fn(uid(res), req.params.id!, req.body);
    return res.redirect(303, "/eventos/" + encodeURIComponent(req.params.id!));
  };
}
export const seguir = agir(m.seguirEvento);
export const inscrever = agir(m.inscreverEvento);
export const cancelarInscricao: Acao = (req, res) => {
  m.cancelarInscricaoEvento(uid(res), req.params.id!);
  return res.redirect(303, "/eventos/" + encodeURIComponent(req.params.id!));
};
export const decidir: Acao = (req, res) => {
  m.decidirInscricaoEvento(
    uid(res),
    req.params.id!,
    req.params.usuarioId!,
    req.body
  );
  return res.redirect(
    303,
    "/eventos/" + encodeURIComponent(req.params.id!) + "#gestao"
  );
};
export const presenca: Acao = (req, res) => {
  m.registrarPresencaEvento(
    uid(res),
    req.params.id!,
    req.params.usuarioId!,
    req.body
  );
  return res.redirect(
    303,
    "/eventos/" + encodeURIComponent(req.params.id!) + "#gestao"
  );
};
export const cancelar = agir(m.cancelarEvento);
export const avaliar = agir(m.avaliarEvento);
export const reclamar = agir(m.reclamarEvento);
export const responder: Acao = (req, res) => {
  m.responderReclamacaoEvento(
    uid(res),
    req.params.id!,
    req.params.reclamacao!,
    req.body
  );
  return res.redirect(
    303,
    "/eventos/" + encodeURIComponent(req.params.id!) + "#reclamacoes"
  );
};
export const encaminhar: Acao = (req, res) =>
  res.redirect(
    303,
    "/suporte/" +
      m.encaminharReclamacaoEvento(
        uid(res),
        req.params.id!,
        req.params.reclamacao!
      )
  );

import { Router } from "express";
import * as c from "../controllers/controladorParticipacaoEventos.js";
const r = Router(),
  s = c.seguro;
r.get("/eventos/mapa", s(c.mapa));
r.get("/eventos/:id", s(c.detalhe));
r.post("/eventos/:id/acompanhar", s(c.seguir));
r.post("/eventos/:id/inscricao", s(c.inscrever));
r.post("/eventos/:id/inscricao/cancelar", s(c.cancelarInscricao));
r.post("/eventos/:id/inscricoes/:usuarioId/decisao", s(c.decidir));
r.post("/eventos/:id/inscricoes/:usuarioId/presenca", s(c.presenca));
r.post("/eventos/:id/cancelar", s(c.cancelar));
r.post("/eventos/:id/avaliacao", s(c.avaliar));
r.post("/eventos/:id/reclamacoes", s(c.reclamar));
r.post("/eventos/:id/reclamacoes/:reclamacao/responder", s(c.responder));
r.post("/eventos/:id/reclamacoes/:reclamacao/encaminhar", s(c.encaminhar));
export default r;

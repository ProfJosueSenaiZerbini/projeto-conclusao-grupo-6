import { Router, raw } from "express";
import * as c from "../controllers/controladorOportunidades.js";
const r = Router(),
  s = c.seguro;
r.get("/oportunidades", s(c.explorar));
r.get("/minhas-oportunidades", s(c.explorar));
r.get("/minhas-candidaturas", s(c.explorar));
r.get("/oportunidades/novo", s(c.novo));
r.post("/oportunidades", s(c.salvar));
r.get("/oportunidades/:id/editar", s(c.editar));
r.post("/oportunidades/:id/editar", s(c.salvar));
r.get("/oportunidades/:id", s(c.detalhe));
r.post("/oportunidades/:id/estado", s(c.estado));
r.post("/oportunidades/:id/candidaturas", s(c.aplicar));
for (const base of [
  "/oportunidades/candidaturas",
  "/admin/oportunidades/candidaturas",
]) {
  r.get(base + "/:id", s(c.negociacao));
  r.post(base + "/:id/decisao", s(c.decisao));
  r.post(base + "/:id/propostas", s(c.proposta));
  r.post(base + "/:id/resposta", s(c.aceite));
  r.post(base + "/:id/desistir", s(c.desistir));
}
r.get("/solicitacoes-de-servico", s(c.pedidos));
r.get("/solicitacoes-de-servico/novo", s(c.novo));
r.post("/solicitacoes-de-servico", s(c.solicitar));
r.get("/solicitacoes-de-servico/:id", s(c.pedido));
r.post("/solicitacoes-de-servico/:id", s(c.esclarecer));
r.get("/admin/oportunidades", s(c.pedidos));
r.get("/admin/oportunidades/pedidos/:id", s(c.pedido));
r.post("/admin/oportunidades/pedidos/:id", s(c.revisar));
r.get("/admin/oportunidades/:id", s(c.detalhe));
r.post("/admin/oportunidades/:id/estado", s(c.estado));
r.get("/mensagens", s(c.mensagens));
r.post("/mensagens/preferencias", s(c.preferencias));
r.post("/mensagens/bloquear", s(c.bloquear));
r.post("/mensagens/iniciar", s(c.iniciarMensagem));
r.post("/mensagens/:id/ocultar", s(c.ocultarMensagem));
for (const base of ["/mensagens", "/admin/oportunidades/mensagens"]) {
  r.get(base + "/anexos/:attachmentId", s(c.baixarAnexo));
  r.post(base + "/:id/anexos", raw({ type: "application/octet-stream", limit: "25mb" }), s(c.anexarMensagem));
}
for (const base of ["/mensagens", "/admin/oportunidades/mensagens"]) {
  r.get(base + "/:id", s(c.mensagem));
  r.post(base + "/:id", s(c.enviar));
}
r.get("/mediacao-de-servicos", s(c.mediadores));
r.post("/mediacao-de-servicos", s(c.mediar));
export default r;

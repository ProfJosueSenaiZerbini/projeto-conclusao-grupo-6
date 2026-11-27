import { Router, raw } from "express";
import * as c from "../controllers/controladorLicenciamentoBeats.js";
const r = Router(),
  s = c.seguro;
r.get("/compras", s(c.compras));
r.get("/compras/:id", s(c.pedido));
r.post("/compras/:id/finalizar", s(c.checkout));
r.get("/compras/:id/finalizar", s(c.revisarCompra));
r.post("/compras/:id/confirmar", s(c.confirmarCompra));
r.post("/compras/:id/atualizar", s(c.atualizar));
r.get("/compras/:id/licenca", s(c.licenca));
r.get("/compras/:id/arquivos/:arquivoId", s(c.download));
r.get("/banco-de-beats/:id/gestao", s(c.gestao));
r.post(
  "/banco-de-beats/:id/arquivos",
  raw({ type: "application/octet-stream", limit: "50mb" }),
  s(c.upload)
);
r.get("/banco-de-beats/:id/arquivos/:arquivoId", s(c.arquivoProdutor));
r.get("/banco-de-beats/:id/previa", s(c.previa));
r.post("/banco-de-beats/:id/disponibilidade", s(c.disponibilidade));
r.post("/banco-de-beats/:id/ofertas", s(c.oferta));
r.post("/banco-de-beats/:id/ofertas/:ofertaId", s(c.oferta));
r.post("/banco-de-beats/:id/ofertas/:ofertaId/retirar", s(c.retirarOferta));
r.post("/banco-de-beats/:id/ofertas/:ofertaId/adquirir", s(c.adquirir));
r.get("/banco-de-beats/:id", s(c.ficha));
export default r;

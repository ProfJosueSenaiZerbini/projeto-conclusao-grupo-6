import { Router, raw } from "express";
import * as c from "../controllers/controladorProjetos.js";
const r = Router(),
  s = c.seguro;
r.get("/trabalhos-e-galerias", s(c.lista));
r.get("/trabalhos-e-galerias/novo", s(c.novo));
r.post("/trabalhos-e-galerias", s(c.salvar));
r.get("/trabalhos-e-galerias/:id/editar", s(c.editar));
r.post("/trabalhos-e-galerias/:id/editar", s(c.salvar));
r.post("/trabalhos-e-galerias/:id/retirar", s(c.retirar));
r.get("/trabalhos-e-galerias/:id", s(c.detalhe));
r.post(
  "/midias-de-trabalho",
  raw({ type: "application/octet-stream", limit: "25mb" }),
  s(c.upload)
);
r.get("/midias-de-trabalho/:id", s(c.arquivo));
r.post("/midias-de-trabalho/:id/visibilidade", s(c.visibilidadeMidia));
r.post("/midias-de-trabalho/:id/excluir", s(c.removerMidia));
export default r;

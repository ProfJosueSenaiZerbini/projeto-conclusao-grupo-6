import { Router } from "express";
import * as c from "../controllers/controladorCentral.js";
const r = Router(),
  s = c.seguro;
r.get("/central", s(c.central));
r.post("/central/privacidade", s(c.privacidade));
r.get("/central/:slug", s(c.artigo));
r.post("/central/:slug/avaliacao", s(c.feedback));
r.get("/admin/central", s(c.conteudos));
r.get("/admin/central/novo", s(c.novo));
r.get("/admin/central/qualidade", s(c.qualidade));
r.get("/admin/central/pesquisas", s(c.pesquisas));
r.get("/admin/central/revisoes", s(c.revisoes));
r.post("/admin/central", s(c.salvar));
r.get("/admin/central/:id/editar", s(c.editar));
r.get("/admin/central/:id/previa",s(c.preview));
r.post("/admin/central/:id", s(c.salvar));
r.post("/admin/central/:id/estado", s(c.transicionar));
export default r;

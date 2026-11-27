import { Router } from "express";
import * as c from "../controllers/controladorPortfolio.js";
const r = Router(),
  s = c.seguro;
r.get("/portfolio/editar", s(c.editar));
r.post("/portfolio/editar", s(c.salvar));
r.post("/portfolio/previa", s(c.preview));
r.get("/portfolio/:identificador/item/:tipo/:id", s(c.ficha));
r.get("/portfolio/:identificador", s(c.consultar));
export default r;

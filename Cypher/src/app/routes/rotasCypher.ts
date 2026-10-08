import { Router } from "express";
import * as controller from "../controllers/controladorCypher.js";

const router = Router();

router.get(["/login", "/register"], (req, res) =>
  res.render(req.path === "/login" ? "pages/entrar" : "pages/cadastro", {
    title: req.path === "/login" ? "Entrar" : "Criar conta",
    path: req.path,
    stylesheet: "autenticacao",
    authenticated: false,
  })
);
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/logout", controller.logout);
router.post("/categories/analyze", controller.analisarCategoria);
router.get(["/", "/dashboard"], controller.visaoGeral);
router.get("/search", controller.buscarPessoas);
router.get("/events", controller.oportunidades);
router.get("/works", controller.obras);
router.get("/works/new", controller.novaObra);
router.post("/works/new", controller.criarObraDemonstrativa);
router.get("/beats", controller.bancoBeats);
router.get("/central", controller.central);
router.get("/profile", controller.perfil);
router.get("/settings", controller.configuracoes);

export default router;

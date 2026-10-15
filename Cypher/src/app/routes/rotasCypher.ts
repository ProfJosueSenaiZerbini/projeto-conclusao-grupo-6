import { Router } from "express";
import * as autenticacao from "../controllers/controladorAutenticacao.js";
import * as beats from "../controllers/controladorBeats.js";
import * as configuracoes from "../controllers/controladorConfiguracoes.js";
import * as dashboard from "../controllers/controladorDashboard.js";
import * as eventos from "../controllers/controladorEventos.js";
import * as notificacoes from "../controllers/controladorNotificacoes.js";
import * as obras from "../controllers/controladorObras.js";
import * as perfis from "../controllers/controladorPerfis.js";
import { middlewareAutorizacao } from "../controllers/controladorCompartilhado.js";

const router = Router();

router.use(middlewareAutorizacao);
router.get(["/login", "/register"], autenticacao.paginaAutenticacao);
router.post("/login", autenticacao.login);
router.post("/register", autenticacao.register);
router.post("/logout", autenticacao.logout);
router.post("/categories/analyze", dashboard.analisarCategoria);
router.get(["/", "/dashboard"], dashboard.visaoGeral);
router.get("/search", perfis.buscarPessoas);
router.get("/events", eventos.oportunidades);
router.get("/events/new", eventos.novoEvento);
router.post("/events/new", eventos.criarEvento);
router.get("/events/:id/edit", eventos.editarEvento);
router.post("/events/:id/edit", eventos.atualizarEvento);
router.post("/events/:id/delete", eventos.excluirEvento);
router.get("/works", obras.obras);
router.get("/works/new", obras.novaObra);
router.post("/works/new", obras.criarObra);
router.get("/works/:id/edit", obras.editarObra);
router.post("/works/:id/edit", obras.atualizarObra);
router.post("/works/:id/delete", obras.excluirObra);
router.get("/beats", beats.bancoBeats);
router.get("/beats/new", beats.novoBeat);
router.post("/beats/new", beats.criarBeat);
router.get("/beats/:id/edit", beats.editarBeat);
router.post("/beats/:id/edit", beats.atualizarBeat);
router.post("/beats/:id/delete", beats.excluirBeat);
router.get("/central", beats.central);
router.get("/notificacoes", notificacoes.paginaNotificacoes);
router.post("/notificacoes/:id/lida", notificacoes.marcarNotificacaoLida);
router.post(
  "/notificacoes/marcar-todas-lidas",
  notificacoes.marcarTodasNotificacoesLidas
);
router.get("/profile", perfis.perfil);
router.post("/profile", perfis.atualizarPerfil);
router.get("/settings", configuracoes.configuracoes);
router.post("/settings/privacy", configuracoes.atualizarPrivacidade);
router.post("/settings/delete-account", configuracoes.excluirConta);
router.get("/p/:identificador", perfis.perfilPublico);

export default router;

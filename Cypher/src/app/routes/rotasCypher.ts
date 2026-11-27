import rotasSuporte from "./rotasSuporte.js";
import rotasCreditosSelos from "./rotasCreditosSelos.js";
import rotasMidiasRepresentacao from "./rotasMidiasRepresentacao.js";
import rotasInteracoes from "./rotasInteracoes.js";
import rotasLicenciamentoBeats from "./rotasLicenciamentoBeats.js";
import rotasEventos from "./rotasEventos.js";
import rotasCentral from "./rotasCentral.js";
import rotasColaboracoes from "./rotasColaboracoes.js";
import rotasPortfolio from "./rotasPortfolio.js";
import rotasProjetos from "./rotasProjetos.js";
import rotasOportunidades from "./rotasOportunidades.js";
import * as administracao from "../controllers/controladorAdministracao.js";
import * as identidade from "../controllers/controladorIdentidade.js";
import * as contas from "../controllers/controladorGestaoConta.js";
import { limitarAutenticacao } from "../middlewares/seguranca.js";
import { Router } from "express";
import * as autenticacao from "../controllers/controladorAutenticacao.js";
import * as beats from "../controllers/controladorBeats.js";
import * as configuracoes from "../controllers/controladorConfiguracoes.js";
import * as dashboard from "../controllers/controladorDashboard.js";
import * as eventos from "../controllers/controladorEventos.js";
import * as obras from "../controllers/controladorObras.js";
import * as perfis from "../controllers/controladorPerfis.js";
import { buscaGlobal, sugestoesBusca } from "../controllers/controladorBusca.js";
import * as notificacoes from "../controllers/controladorNotificacoes.js";
import { middlewareAutorizacao } from "../controllers/controladorCompartilhado.js";

import {
  aceitarCreditoObra,
  espacoTrabalho,
  fichaTrabalho,
  revisarCreditoObra,
} from "../controllers/controladorEspacoTrabalho.js";

const router = Router();

router.use(middlewareAutorizacao);
router.use(rotasCreditosSelos);
router.use(rotasMidiasRepresentacao);
router.use(rotasInteracoes);
router.use(rotasSuporte);
// Cadastros estáticos precisam preceder as fichas por ID.
router.get("/banco-de-beats/novo", beats.novoBeat);
router.use(rotasLicenciamentoBeats);
router.use(rotasCentral);
router.use(rotasColaboracoes);
router.use(rotasPortfolio);
router.use(rotasProjetos);
router.use(rotasOportunidades);
// /eventos/novo é uma rota estática, anterior à ficha dinâmica.
router.get('/eventos/novo', eventos.novoEvento);
router.post("/eventos/localizacao", (req,res,next) => eventos.consultarLocalEvento(req,res).catch(next));
router.use(rotasEventos);
router.get("/admin/entrar", administracao.paginaLoginAdministrativo);
router.post("/admin/entrar", limitarAutenticacao, administracao.loginAdministrativo);
router.post("/admin/sair", administracao.logoutAdministrativo);
router.get("/admin", administracao.painelAdministrativo);
router.post("/admin/equipe", administracao.adicionarAdministrador);
router.post("/admin/equipe/:id", administracao.editarAdministrador);
router.get("/entrar", autenticacao.paginaAutenticacao);
router.get("/cadastro", identidade.paginaCadastro);
router.post("/entrar", limitarAutenticacao, autenticacao.login);
router.get("/recuperar-senha", contas.paginaRecuperacao);
router.post("/recuperar-senha", limitarAutenticacao, contas.solicitarRecuperacao);
router.get("/redefinir-senha", contas.paginaRedefinicao);
router.post("/redefinir-senha", limitarAutenticacao, contas.redefinirSenha);
router.get(["/termos-de-uso", "/politica-privacidade"], contas.termosConta);
router.post("/cadastro/validar", identidade.validarCadastro);
router.post("/cadastro/identificador", identidade.disponibilidadeIdentificador);
router.post("/cadastro", identidade.registrarConta);
router.get("/email/pendente", identidade.paginaEmailPendente);
router.post("/email/reenviar", limitarAutenticacao, identidade.reenviarConfirmacao);
router.get("/confirmar-email", identidade.paginaConfirmacao);
router.post("/confirmar-email", identidade.confirmarEmail);
router.post("/sair", autenticacao.logout);
router.get("/notificacoes", notificacoes.notificacoes);
router.post("/notificacoes/marcar-todas-lidas", notificacoes.marcarTodasLidas);
router.post("/notificacoes/preferencias", notificacoes.salvarPreferencias);
router.post("/notificacoes/limpar", notificacoes.limpar);
router.post("/notificacoes/:id/lida", notificacoes.marcarLida);
router.post("/notificacoes/:id/nao-lida", notificacoes.marcarNaoLida);
router.post("/notificacoes/:id/excluir", notificacoes.excluir);
router.post("/categorias/analisar", dashboard.analisarCategoria);
router.get(["/", "/descoberta"], dashboard.descoberta);
router.get("/busca", buscaGlobal);
router.get("/busca/sugestoes", sugestoesBusca);
router.get("/eventos", eventos.oportunidades);
router.post("/eventos/novo", eventos.criarEvento);
router.post("/eventos/:id/interesse", eventos.demonstrarInteresse);
router.post("/eventos/:id/interesse/cancelar", eventos.cancelarInteresse);
router.post(
  "/eventos/:id/interesses/:usuarioId/status",
  eventos.atualizarInteresse
);
router.get("/eventos/:id/editar", eventos.editarEvento);
router.post("/eventos/:id/editar", eventos.atualizarEvento);
router.post("/eventos/:id/excluir", eventos.excluirEvento);
router.get("/espaco-de-trabalho", espacoTrabalho);
router.get("/espaco-de-trabalho/creditos/:id", revisarCreditoObra);
router.post("/espaco-de-trabalho/creditos/:id", aceitarCreditoObra);
router.get("/espaco-de-trabalho/:modalidade/:id", fichaTrabalho);
router.get("/obras", obras.obras);
router.post("/obras/:id/curtir", obras.curtirObra);
router.get("/obras/novo", obras.novaObra);
router.post("/obras/novo", obras.criarObra);
router.get("/obras/:id/editar", obras.editarObra);
router.post("/obras/:id/editar", obras.atualizarObra);
router.post("/obras/:id/excluir", obras.excluirObra);
router.post("/obras/:id/evidencia", obras.comprovarLancamento);
router.get("/admin/lancamentos", obras.evidenciasLancamentos);
router.post("/admin/lancamentos/:id", obras.decidirEvidencia);
router.get("/banco-de-beats", beats.bancoBeats);
router.post("/banco-de-beats/novo", beats.criarBeat);
router.get("/banco-de-beats/:id/editar", beats.editarBeat);
router.post("/banco-de-beats/:id/editar", beats.atualizarBeat);
router.post("/banco-de-beats/:id/excluir", beats.excluirBeat);

router.get("/perfil", identidade.meuPerfil);
router.get("/perfil/completar", identidade.completarPerfil);
router.get("/perfil/completar/dados", identidade.dadosCompletarPerfil);
router.post("/perfil/completar/dados", identidade.dadosCompletarPerfil);
router.get("/perfil/profissionalizar", identidade.ativarProfissional);
router.post("/perfil/profissionalizar", identidade.confirmarProfissionalizacao);
router.post("/perfil/apresentacao", identidade.salvarApresentacao);
router.post("/perfil", perfis.atualizarPerfil);
router.post("/perfil/secoes/:secao", perfis.atualizarPerfilPorSecao);
router.post(
  "/perfil/categorias/sugerir",
  perfis.solicitarCategoriaProfissional
);
router.post(
  "/perfil/categorias/solicitar-excecao",
  perfis.solicitarExcecaoCategoria
);
router.post(
  "/perfil/categorias/solicitacoes/:id/responder",
  perfis.responderSolicitacaoCategoria
);
router.get("/configuracoes", identidade.configuracoesIdentidade);
router.post("/configuracoes/identidade", identidade.salvarIdentidade);
router.post("/configuracoes/identificador", identidade.salvarIdentificador);
router.post("/configuracoes/preferencias", identidade.salvarPreferencias);
router.post("/configuracoes/email", identidade.solicitarTrocaEmail);
router.post("/configuracoes/senha", limitarAutenticacao, contas.alterarSenha);
router.get("/configuracoes/encerramento", contas.paginaEncerramento);
router.post("/admin/identificador", identidade.excecaoIdentificador);
router.post("/configuracoes/privacidade", configuracoes.atualizarPrivacidade);
router.post("/configuracoes/encerrar-conta", limitarAutenticacao, contas.fecharConta);
router.get("/admin/revisao", configuracoes.revisaoAdministrativa);
router.get("/admin/revisao/excecoes", configuracoes.revisaoAdministrativa);
router.get(
  "/admin/revisao/excecoes/busca",
  configuracoes.buscarPerfisExcecaoAdministrativa
);
router.post(
  "/admin/revisao/generos/:id",
  configuracoes.revisarGeneroAdministrativamente
);
router.post(
  "/admin/revisao/categorias-profissionais/:id",
  configuracoes.revisarCategoriaProfissionalAdministrativamente
);
router.post(
  "/admin/revisao/excecoes-categorias/:id",
  configuracoes.autorizarExcecaoCategoria
);
router.post(
  "/admin/revisao/solicitacoes-excecao/:id",
  configuracoes.revisarSolicitacaoExcecaoCategoria
);
router.post(
  "/admin/revisao/solicitacoes-excecao/:id/esclarecimento",
  configuracoes.solicitarInformacaoSolicitacaoCategoria
);
router.get("/artistas/:identificador", perfis.perfilPublico);

export default router;

/**
 * Fachada de compatibilidade para integrações que ainda importam o controller
 * histórico. As rotas novas usam os módulos por domínio diretamente.
 */
export * from "./controladorCompartilhado.js";
export * from "./controladorAutenticacao.js";
export * from "./controladorDashboard.js";
export * from "./controladorPerfis.js";
export * from "./controladorObras.js";
export * from "./controladorEventos.js";
export * from "./controladorBeats.js";
export * from "./controladorConfiguracoes.js";

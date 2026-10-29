/** Entry point do domínio de autenticação. Mantém compatibilidade durante a migração incremental. */
export {
  paginaAutenticacao,
  login,
  validarDadosCadastro,
  register,
  logout,
} from "./controladorCompatibilidade.js";

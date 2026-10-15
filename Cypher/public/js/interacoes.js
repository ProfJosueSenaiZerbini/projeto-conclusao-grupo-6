/*
 * Compatibilidade retroativa.
 *
 * O frontend agora inicia por /js/app.js, que importa os módulos ES por
 * responsabilidade. Este arquivo permanece como encaminhamento para URLs
 * antigas que ainda possam referenciá-lo.
 */
import "./app.js";

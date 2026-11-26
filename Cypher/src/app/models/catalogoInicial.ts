import { conexaoInternaCypher, inicializarBancoCypher } from "./bancoDados.js";
import { semearCatalogoCena } from "./catalogoCena.js";

/** Preenche apenas uma base vazia. Bancos existentes nunca são sobrescritos. */
export function prepararCatalogoInicialCypher(): void {
  inicializarBancoCypher();
  const db = conexaoInternaCypher();
  const usuarios = db.prepare("SELECT 1 FROM usuarios LIMIT 1").get();
  const catalogo = db.prepare("SELECT 1 FROM catalogo_cena LIMIT 1").get();
  if (!usuarios && !catalogo) semearCatalogoCena();
}

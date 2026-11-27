import fs from "node:fs";
import path from "node:path";
import {
  fecharBancoCypher,
  inicializarBancoCypher,
  caminhoBancoCypher,
  conexaoInternaCypher,
} from "../src/app/models/bancoDados.ts";
import { popularCatalogoPortatil } from "../src/app/models/catalogoPortatil.ts";

const destino = process.argv[2];
if (destino) process.env.CYPHER_DB_PATH = path.resolve(destino);
if (fs.existsSync(caminhoBancoCypher()))
  throw Error(
    "Informe um arquivo SQLite novo; um banco existente nunca é substituído."
  );
inicializarBancoCypher();
try {
  const db = conexaoInternaCypher();
  if (
    db
      .prepare("SELECT 1 FROM usuarios WHERE tipo_conta <> 'administrativo'")
      .get() ||
    db.prepare("SELECT 1 FROM catalogo_cena").get()
  ) {
    throw Error(
      "A base atual já contém dados. Use npm run demo:restaurar -- data/ensaio/cypher.sqlite, escolhendo um caminho novo."
    );
  }
  console.log(
    JSON.stringify({
      banco: caminhoBancoCypher(),
      ...popularCatalogoPortatil(),
    })
  );
} finally {
  fecharBancoCypher();
}

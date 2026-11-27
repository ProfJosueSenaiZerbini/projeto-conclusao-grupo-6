import { fecharBancoCypher, inicializarBancoCypher } from "../src/app/models/bancoDados.ts";
import { semearProducoesDemonstrativas } from "../src/app/models/producoesDemonstrativas.ts";

inicializarBancoCypher();
try {
  console.log(JSON.stringify({ producoesInseridas: semearProducoesDemonstrativas() }));
} finally {
  fecharBancoCypher();
}

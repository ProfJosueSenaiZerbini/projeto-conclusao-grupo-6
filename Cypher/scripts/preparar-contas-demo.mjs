import { gerarHashSenha } from "../src/app/models/autenticacaoCypher.ts";
import { prepararCatalogoInicialCypher } from "../src/app/models/catalogoInicial.ts";
import {
  criarContaCypher,
  conexaoInternaCypher,
  fecharBancoCypher,
} from "../src/app/models/bancoDados.ts";
import {
  criarPedidoBeat,
  confirmarLicencaCatalogo,
} from "../src/app/models/licenciamentoBeats.ts";

if (process.env.NODE_ENV === "production")
  throw Error("Contas de aula não são permitidas em produção.");
if (process.argv[2]) process.env.CYPHER_DB_PATH = process.argv[2];
if (!process.env.CYPHER_DB_PATH)
  throw Error(
    "Escolha um banco de ensaio: npm run demo:contas -- data/ensaio/cypher.sqlite"
  );
const contas = [
  {
    id: "demo-laboratorio-visita",
    tipoConta: "consumidor",
    nome: "Visita Demo",
    identificador: "@visita.demo",
    iniciais: "VD",
    categorias: [],
  },
  {
    id: "demo-laboratorio-artista",
    tipoConta: "profissional",
    nome: "Artista Demo",
    identificador: "@artista.demo",
    iniciais: "AD",
    categorias: ["Rapper"],
  },
];
prepararCatalogoInicialCypher();
const db = conexaoInternaCypher();
try {
  for (const conta of contas) {
    const existente = db
      .prepare("SELECT 1 FROM usuarios WHERE id=?")
      .get(conta.id);
    if (existente) continue;
    const senhaHash = await gerarHashSenha("CypherDemo!2026");
    db.transaction(() => {
      criarContaCypher({
        ...conta,
        email: conta.identificador.slice(1) + "@example.test",
        senhaHash,
        funcao: conta.categorias.join(" · "),
      });
      db.prepare(
        "UPDATE usuarios SET email_confirmado_em=CURRENT_TIMESTAMP WHERE id=?"
      ).run(conta.id);
    }).immediate();
  }
  const beatId = "demo-beat-parece-sorte";
  const comprador = contas[0].id;
  const oferta = db
    .prepare(
      `SELECT o.id, v.id versao FROM ofertas_beats o
    JOIN beat_oferta_versoes v ON v.oferta_id=o.id
    WHERE o.beat_id=? AND o.ativa=1 AND v.modalidade='premium' ORDER BY v.numero DESC LIMIT 1`
    )
    .get(beatId);
  if (oferta) {
    const pedido = criarPedidoBeat(comprador, beatId, oferta.id, {
      aceite: "sim",
      versao: oferta.versao,
      chave_envio: "exemplo-laboratorio-premium",
    });
    confirmarLicencaCatalogo(comprador, pedido);
  }
  console.log(
    "Contas de aula: @visita.demo e @artista.demo. Consulte o README para entrar."
  );
} finally {
  fecharBancoCypher();
}

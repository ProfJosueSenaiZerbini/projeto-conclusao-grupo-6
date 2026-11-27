import fs from "node:fs";
import path from "node:path";
import { conexaoInternaCypher } from "./bancoDados.js";
import { pastaMidias } from "./projetosTrabalho.js";

const autor = "demo-cx-estudio-quarteirao";
const handle = "@estudioquarteirao.demo";
const profissoes = ["Designer gráfico", "Videomaker", "Jornalista cultural"];

export const producoesDemonstrativas = [
  {
    id: "demo-cx-radio-de-escadaria",
    titulo: "Rádio de Escadaria",
    modalidade: "texto",
    profissoes: ["Jornalista cultural"],
    papel: "Reportagem e edição",
    descricao: "Uma crônica sobre as caixas de som, os pregões e as conversas que desenham a paisagem sonora de uma feira de bairro.",
    entregas: "Crônica e mapa ilustrado de escuta",
    texto: "Às sete, a feira começa pelo ouvido. O primeiro pregão atravessa a escadaria antes que as bancas apareçam por inteiro. No meio do caminho, a caixa de som da banca de discos disputa a esquina com as conversas do café. O mapa marca três paradas para ouvir como o bairro muda de ritmo ao longo da manhã."
  },
  {
    id: "demo-cx-fora-do-quadro",
    titulo: "Fora do Quadro",
    modalidade: "audiovisual",
    profissoes: ["Videomaker"],
    papel: "Direção de fotografia e montagem",
    descricao: "Storyboard para um curta de dança urbana, com três enquadramentos que acompanham a travessia de uma passarela.",
    entregas: "Storyboard e proposta de montagem",
    texto: ""
  },
  {
    id: "demo-cx-tipo-de-esquina",
    titulo: "Tipo de Esquina",
    modalidade: "visual",
    profissoes: ["Designer gráfico"],
    papel: "Direção de arte e desenho tipográfico",
    descricao: "Série de cartazes que redesenha as letras das fachadas do bairro e testa suas formas em uma composição de duas tintas.",
    entregas: "Cartaz e estudo de composição tipográfica",
    texto: ""
  }
];

/** Adiciona exclusivamente as peças inéditas da demonstração, sem atualizar registros preexistentes. */
export function semearProducoesDemonstrativas() {
  const db = conexaoInternaCypher();
  const pasta = pastaMidias();
  const criados: string[] = [];
  try {
    return db.transaction(() => {
      const existe = db.prepare("SELECT 1 FROM usuarios WHERE id=?").get(autor);
      if (existe && !db.prepare("SELECT 1 FROM catalogo_cena WHERE id=? AND tipo='perfil' AND ficcional=1").get(autor))
        throw Error("O identificador do estúdio fictício já está em uso.");
      if (!existe) {
        db.prepare("INSERT INTO usuarios(id,tipo_conta,email_confirmado_em,demonstracao) VALUES(?,'profissional',CURRENT_TIMESTAMP,0)").run(autor);
        db.prepare(`INSERT INTO perfis(usuario_id,nome,nome_informado,vulgo,funcao,identificador,iniciais,biografia,categorias_json,perfil_publico,demonstracao)
          VALUES(?,'Estúdio Quarteirão','Estúdio Quarteirão','Estúdio Quarteirão',?,?,'EQ','Coletivo fictício do catálogo da Cypher.',?,1,0)`)
          .run(autor, profissoes.join(" · "), handle, JSON.stringify(profissoes));
        db.prepare("INSERT INTO identificadores_usuario(identificador,usuario_id) VALUES(?,?)").run(handle, autor);
        db.prepare("INSERT INTO catalogo_cena(tipo,id,chave,dados_json,ficcional,atualizado_em) VALUES('perfil',?,?,?,1,?)")
          .run(autor, "perfil:" + autor, JSON.stringify({ contexto: "Coletivo fictício para demonstração." }), Date.now());
      }
      let inseridas = 0;
      for (const p of producoesDemonstrativas) {
        if (db.prepare("SELECT 1 FROM projetos_trabalho WHERE id=?").get(p.id)) continue;
        const midia = p.id + "-arte";
        const arquivo = fs.readFileSync(path.resolve("public/img/cena/producoes", p.id + ".svg"));
        const destino = path.join(pasta, midia);
        fs.mkdirSync(pasta, { recursive: true });
        fs.writeFileSync(destino, arquivo, { flag: "wx" });
        criados.push(destino);
        db.prepare("INSERT INTO projetos_trabalho(id,autor_id,titulo,descricao,publico) VALUES(?,?,?,?,1)").run(p.id, autor, p.titulo, p.descricao);
        db.prepare(`INSERT INTO detalhes_projetos(projeto_id,modalidade,profissoes_json,papel,entregas,texto)
          VALUES(?,?,?,?,?,?)`).run(p.id, p.modalidade, JSON.stringify(p.profissoes), p.papel, p.entregas, p.texto);
        db.prepare("INSERT INTO midias_trabalho(id,autor_id,nome,mime,bytes,publico) VALUES(?,?,?,'image/svg+xml',?,1)")
          .run(midia, autor, p.entregas, arquivo.length);
        db.prepare("INSERT INTO itens_projeto(projeto_id,tipo,origem_id,legenda,ordem) VALUES(?,'midia',?,?,0)").run(p.id, midia, p.entregas);
        db.prepare("INSERT INTO catalogo_cena(tipo,id,chave,dados_json,ficcional,atualizado_em) VALUES('projeto',?,?,?,1,?)")
          .run(p.id, "projeto:" + p.id, JSON.stringify({ demonstrativo: true }), Date.now());
        inseridas++;
      }
      return inseridas;
    }).immediate();
  } catch (erro) {
    for (const destino of criados) fs.rmSync(destino, { force: true });
    throw erro;
  }
}

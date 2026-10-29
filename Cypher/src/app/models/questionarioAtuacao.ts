export const CATEGORIAS_ATUACAO = [
  "Rapper",
  "MC",
  "Letrista",
  "Compositor",
  "Beatmaker",
  "Produtor musical",
  "DJ",
  "Empresário",
  "Organizador de eventos",
] as const;

export const ROTULOS_OPCOES_ATUACAO: Readonly<Record<string, string>> = {
  "<6m": "Há menos de 6 meses", "6m-1a": "De 6 meses a 1 ano", "1-3a": "De 1 a 3 anos",
  "3-5a": "De 3 a 5 anos", ">5a": "Há mais de 5 anos", aprendendo: "Estou aprendendo",
  hobby: "Atuo por hobby ou interesse pessoal", independente: "Desenvolvo projetos independentes",
  regular: "Trabalho regularmente nessa área", profissional: "Atuo profissionalmente e obtenho renda",
  pausada: "Minha atuação está pausada", habilidades: "Aprimorar minhas habilidades",
  portfolio: "Construir um portfólio", colaboradores: "Encontrar colaboradores", divulgar: "Divulgar meus trabalhos",
  oportunidades: "Conseguir oportunidades profissionais", servicos: "Oferecer serviços",
  eventos: "Participar de eventos e projetos", outro: "Outro objetivo", publicados: "Tenho trabalhos publicados",
  desenvolvimento: "Tenho projetos em desenvolvimento", "experiencia-sem-publicacao": "Tenho experiência, mas ainda não publiquei trabalhos",
  iniciando: "Ainda não tenho projetos e estou começando", Rap: "Rap", "Boom bap": "Boom bap", Trap: "Trap",
  "R&B": "R&B", "Lo-fi": "Lo-fi", Outro: "Outro", si: "Para mim", outros: "Para outros artistas",
  ambos: "Das duas formas", "publicadas-ou-gravadas": "Publicadas ou gravadas", registradas: "Registradas",
  "ineditas-ou-em-desenvolvimento": "Inéditas ou em desenvolvimento", melodias: "Melodias", harmonias: "Harmonias",
  letras: "Letras", combinacoes: "Combinações desses elementos", sozinho: "Sozinho", colaboracao: "Em colaboração",
  "lancadas-gravadas-ou-registradas": "Lançadas, gravadas ou registradas", venda: "Venda",
  licenciamento: "Licenciamento", "uso-gratuito": "Uso gratuito", gravacao: "Gravação", arranjo: "Arranjo",
  edicao: "Edição", mixagem: "Mixagem", masterizacao: "Masterização", propria: "Estrutura própria",
  terceiros: "Estúdios de terceiros", proprios: "Equipamentos próprios", "ja-organizou": "Já organizei eventos",
  "planejando-primeiro": "Estou planejando o primeiro", individualmente: "Individualmente",
  "equipe-ou-coletivo": "Em equipe ou coletivo", "empresa-selo-ou-coletivo": "Vinculado a empresa, selo ou coletivo",
  ambas: "Das duas formas",
};

export function formatarRespostaAtuacao(valor: unknown): string {
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  if (Array.isArray(valor)) return valor.map(formatarRespostaAtuacao).join(", ");
  if (typeof valor !== "string") return "";
  return ROTULOS_OPCOES_ATUACAO[valor] ?? valor;
}

export type CategoriaAtuacao = (typeof CATEGORIAS_ATUACAO)[number];
export type TipoPerguntaAtuacao = "enum" | "multi-enum" | "texto" | "booleano";

export interface PerguntaAtuacao {
  campo: string;
  pergunta: string;
  tipo: TipoPerguntaAtuacao;
  obrigatoria?: boolean;
  opcoes?: readonly string[];
  maximoCaracteres?: number;
  dependeDe?: { campo: string; valor: string };
}

export type RespostasAtuacao = Record<string, unknown>;

export interface ErroValidacaoAtuacao {
  campo: string;
  codigo:
    | "payload_invalido"
    | "campo_desconhecido"
    | "obrigatorio"
    | "tipo_invalido"
    | "opcao_invalida"
    | "texto_excedido"
    | "dependencia_invalida";
  mensagem: string;
}

export type ResultadoValidacaoAtuacao =
  | { valido: true; erros: [] }
  | { valido: false; erros: ErroValidacaoAtuacao[] };

const TEMPO_ATUACAO = ["<6m", "6m-1a", "1-3a", "3-5a", ">5a"] as const;
const SITUACAO_ATUAL = [
  "aprendendo",
  "hobby",
  "independente",
  "regular",
  "profissional",
  "pausada",
] as const;
const OBJETIVOS = [
  "habilidades",
  "portfolio",
  "colaboradores",
  "divulgar",
  "oportunidades",
  "servicos",
  "eventos",
  "outro",
] as const;
const PROJETOS = [
  "publicados",
  "desenvolvimento",
  "experiencia-sem-publicacao",
  "iniciando",
] as const;

const PERGUNTAS_GERAIS: readonly PerguntaAtuacao[] = [
  {
    campo: "tempoAtuacao",
    pergunta: "Há quanto tempo você atua nesta categoria?",
    tipo: "enum",
    obrigatoria: true,
    opcoes: TEMPO_ATUACAO,
  },
  {
    campo: "situacaoAtual",
    pergunta: "Como você descreve sua atuação atual?",
    tipo: "enum",
    obrigatoria: true,
    opcoes: SITUACAO_ATUAL,
  },
  {
    campo: "objetivos",
    pergunta: "Quais são seus objetivos?",
    tipo: "multi-enum",
    obrigatoria: true,
    opcoes: OBJETIVOS,
  },
  {
    campo: "projetos",
    pergunta: "Em que etapa estão seus projetos?",
    tipo: "enum",
    obrigatoria: true,
    opcoes: PROJETOS,
  },
  {
    campo: "experiencia",
    pergunta: "Quer contar um pouco sobre sua experiência?",
    tipo: "texto",
    maximoCaracteres: 500,
  },
  {
    campo: "objetivosOutro",
    pergunta: "Qual outro objetivo?",
    tipo: "texto",
    maximoCaracteres: 500,
    dependeDe: { campo: "objetivos", valor: "outro" },
  },
];

const VERTENTES_RAP = ["Rap", "Boom bap", "Trap", "R&B", "Lo-fi", "Outro"] as const;

const PERGUNTAS_ESPECIFICAS: Partial<Record<CategoriaAtuacao, readonly PerguntaAtuacao[]>> = {
  Rapper: [
    {
      campo: "vertentesRap",
      pergunta: "Em quais vertentes do rap você atua?",
      tipo: "multi-enum",
      opcoes: VERTENTES_RAP,
    },
    {
      campo: "vertenteRapOutro",
      pergunta: "Qual outra vertente?",
      tipo: "texto",
      maximoCaracteres: 500,
      dependeDe: { campo: "vertentesRap", valor: "Outro" },
    },
    { campo: "escrevePropriasLetras", pergunta: "Você escreve suas próprias letras?", tipo: "booleano" },
    { campo: "lancouOuGravou", pergunta: "Já lançou músicas ou participou de gravações?", tipo: "booleano" },
    { campo: "atuaEmEventos", pergunta: "Costuma se apresentar em batalhas, shows ou eventos?", tipo: "booleano" },
  ],
  MC: [
    { campo: "participaApresentacoes", pergunta: "Participa de batalhas, rodas, shows ou outras apresentações?", tipo: "booleano" },
    { campo: "formatosAtuacao", pergunta: "Em quais formatos ou contextos costuma atuar?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "participouProjetosMC", pergunta: "Já participou de eventos, gravações ou projetos como MC?", tipo: "booleano" },
  ],
  Letrista: [
    { campo: "escrevePara", pergunta: "Escreve letras para si, para outros artistas ou para ambos?", tipo: "enum", opcoes: ["si", "outros", "ambos"] },
    { campo: "temasEstilos", pergunta: "Quais temas ou estilos costuma abordar?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "situacaoLetras", pergunta: "Qual é a situação das suas letras?", tipo: "enum", opcoes: ["publicadas-ou-gravadas", "registradas", "ineditas-ou-em-desenvolvimento"] },
    { campo: "aceitaEncomendasColaboracoes", pergunta: "Aceita encomendas ou colaborações?", tipo: "booleano" },
  ],
  Compositor: [
    { campo: "elementosComposicao", pergunta: "O que você compõe?", tipo: "multi-enum", opcoes: ["melodias", "harmonias", "letras", "combinacoes"] },
    { campo: "generosComposicao", pergunta: "Em quais gêneros atua?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "formaComposicao", pergunta: "Compõe sozinho, em colaboração ou das duas formas?", tipo: "enum", opcoes: ["sozinho", "colaboracao", "ambas"] },
    { campo: "situacaoComposicoes", pergunta: "Qual é a situação das suas composições?", tipo: "enum", opcoes: ["lancadas-gravadas-ou-registradas", "ineditas-ou-em-desenvolvimento"] },
    { campo: "aceitaColaboracoesEncomendas", pergunta: "Aceita colaborações ou encomendas?", tipo: "booleano" },
  ],
  Beatmaker: [
    { campo: "estilosMusicais", pergunta: "Quais estilos musicais costuma produzir?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "ferramentasEquipamentos", pergunta: "Quais ferramentas ou equipamentos utiliza?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "disponibilidadeBeats", pergunta: "Como disponibiliza seus beats?", tipo: "multi-enum", opcoes: ["venda", "licenciamento", "uso-gratuito"] },
    { campo: "beatsEmMusicasLancadas", pergunta: "Já produziu beats usados em músicas lançadas?", tipo: "booleano" },
  ],
  "Produtor musical": [
    { campo: "etapasProducao", pergunta: "Em quais etapas da produção musical atua?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "servicosProducao", pergunta: "Trabalha com quais serviços de produção?", tipo: "multi-enum", opcoes: ["gravacao", "arranjo", "edicao", "mixagem", "masterizacao"] },
    { campo: "estruturaTrabalho", pergunta: "Possui estrutura própria ou trabalha em estúdios de terceiros?", tipo: "enum", opcoes: ["propria", "terceiros", "ambas"] },
    { campo: "produziuMusicasLancadas", pergunta: "Já participou da produção de músicas lançadas?", tipo: "booleano" },
  ],
  DJ: [
    { campo: "contextosDJ", pergunta: "Em quais contextos costuma atuar?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "estilosDJ", pergunta: "Quais estilos musicais costuma tocar?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "disponibilizaSets", pergunta: "Disponibiliza sets ou gravações de apresentações?", tipo: "booleano" },
    { campo: "equipamentosDJ", pergunta: "Possui equipamentos próprios ou utiliza os dos eventos?", tipo: "enum", opcoes: ["proprios", "eventos", "ambos"] },
  ],
  "Organizador de eventos": [
    { campo: "tiposEventos", pergunta: "Que tipos de eventos organiza?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "situacaoEventos", pergunta: "Já organizou eventos ou planeja o primeiro?", tipo: "enum", opcoes: ["ja-organizou", "planejando-primeiro"] },
    { campo: "formatoOrganizacao", pergunta: "Atua individualmente ou em equipe/coletivo?", tipo: "enum", opcoes: ["individualmente", "equipe-ou-coletivo", "ambos"] },
    { campo: "regioesEventos", pergunta: "Em quais cidades ou regiões costuma realizar eventos?", tipo: "texto", maximoCaracteres: 500 },
  ],
  Empresário: [
    { campo: "atividadeCenaMusical", pergunta: "Em qual atividade da cena musical atua?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "tipoNegocioMusical", pergunta: "Oferece serviços, gerencia artistas, mantém selo ou outro negócio?", tipo: "texto", maximoCaracteres: 500 },
    { campo: "vinculoAtuacao", pergunta: "Atua individualmente ou vinculado a empresa, selo ou coletivo?", tipo: "enum", opcoes: ["individualmente", "empresa-selo-ou-coletivo", "ambos"] },
    { campo: "parceriasOportunidades", pergunta: "Que tipos de parceria ou oportunidade procura?", tipo: "texto", maximoCaracteres: 500 },
  ],
};

/** Retorna perguntas gerais e, quando padronizada, as perguntas da categoria específica. */
export function catalogoPerguntasPorCategoria(categoria: string): readonly PerguntaAtuacao[] {
  const especificas = (PERGUNTAS_ESPECIFICAS as Partial<Record<string, readonly PerguntaAtuacao[]>>)[categoria] ?? [];
  return [...PERGUNTAS_GERAIS, ...especificas];
}

/** Valida um objeto JSON já decodificado, rejeitando campos e opções fora do catálogo. */
export function validarRespostasAtuacao(
  categoria: string,
  resposta: unknown,
  obrigatorias: boolean,
): ResultadoValidacaoAtuacao {
  const erros: ErroValidacaoAtuacao[] = [];
  if (typeof resposta !== "object" || resposta === null || Array.isArray(resposta)) {
    return {
      valido: false,
      erros: [{ campo: "", codigo: "payload_invalido", mensagem: "As respostas devem ser um objeto JSON." }],
    };
  }

  const dados = resposta as Record<string, unknown>;
  const perguntas = catalogoPerguntasPorCategoria(categoria);
  const porCampo = new Map(perguntas.map((pergunta) => [pergunta.campo, pergunta]));

  for (const campo of Object.keys(dados)) {
    if (!porCampo.has(campo)) {
      erros.push({ campo, codigo: "campo_desconhecido", mensagem: "Campo não permitido para esta categoria." });
    }
  }

  for (const pergunta of perguntas) {
    const valor = dados[pergunta.campo];
    const presente = Object.prototype.hasOwnProperty.call(dados, pergunta.campo);
    const dependeAtiva = pergunta.dependeDe
      ? Array.isArray(dados[pergunta.dependeDe.campo]) &&
        (dados[pergunta.dependeDe.campo] as unknown[]).includes(pergunta.dependeDe.valor)
      : true;

    if (pergunta.dependeDe && !dependeAtiva) {
      if (presente) {
        erros.push({ campo: pergunta.campo, codigo: "dependencia_invalida", mensagem: "Este campo só pode ser informado quando a opção correspondente estiver selecionada." });
      }
      continue;
    }

    if (!presente) {
      if (obrigatorias && pergunta.obrigatoria) {
        erros.push({ campo: pergunta.campo, codigo: "obrigatorio", mensagem: "Campo obrigatório." });
      }
      if (pergunta.dependeDe && dependeAtiva && obrigatorias) {
        erros.push({ campo: pergunta.campo, codigo: "obrigatorio", mensagem: "Informe o valor da opção Outro." });
      }
      continue;
    }

    if (pergunta.tipo === "texto") {
      if (typeof valor !== "string") {
        erros.push({ campo: pergunta.campo, codigo: "tipo_invalido", mensagem: "O valor deve ser texto." });
      } else if (valor.length > (pergunta.maximoCaracteres ?? 500)) {
        erros.push({ campo: pergunta.campo, codigo: "texto_excedido", mensagem: `O texto deve ter no máximo ${pergunta.maximoCaracteres ?? 500} caracteres.` });
      } else if (pergunta.dependeDe && valor.trim().length === 0) {
        erros.push({ campo: pergunta.campo, codigo: "obrigatorio", mensagem: "Informe um texto não vazio." });
      }
    } else if (pergunta.tipo === "booleano") {
      if (typeof valor !== "boolean") {
        erros.push({ campo: pergunta.campo, codigo: "tipo_invalido", mensagem: "O valor deve ser booleano (sim/não)." });
      }
    } else if (pergunta.tipo === "enum") {
      if (typeof valor !== "string") {
        erros.push({ campo: pergunta.campo, codigo: "tipo_invalido", mensagem: "O valor deve ser uma opção textual." });
      } else if (!pergunta.opcoes?.includes(valor)) {
        erros.push({ campo: pergunta.campo, codigo: "opcao_invalida", mensagem: "Opção não permitida." });
      }
    } else if (pergunta.tipo === "multi-enum") {
      if (!Array.isArray(valor) || !valor.every((item) => typeof item === "string")) {
        erros.push({ campo: pergunta.campo, codigo: "tipo_invalido", mensagem: "O valor deve ser uma lista de opções textuais." });
      } else if (
        valor.length === 0 ||
        new Set(valor).size !== valor.length ||
        valor.some((item) => !pergunta.opcoes?.includes(item))
      ) {
        erros.push({ campo: pergunta.campo, codigo: "opcao_invalida", mensagem: "A lista deve conter opções permitidas, sem duplicatas." });
      }
    }
  }

  return erros.length === 0 ? { valido: true, erros: [] } : { valido: false, erros };
}

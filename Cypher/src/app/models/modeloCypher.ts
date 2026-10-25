import {
  atualizarObraCypher,
  buscarPerfisPublicosCypher,
  criarObraCypher,
  estatisticasObrasDemo,
  estatisticasObrasUsuarioCypher,
  excluirObraCypher,
  listarObrasContaCypher,
  listarPerfisParaCreditoCypher,
  inicializarBancoCypher,
  atualizarBeatCypher,
  criarBeatCypher,
  excluirBeatCypher,
  listarBeatsCypher,
  obterBeatCypher,
  listarEventosCypher,
  listarEventosDemo,
  criarEventoCypher,
  atualizarEventoCypher,
  excluirEventoCypher,
  obterEventoCypher,
  listarObrasDemo,
  listarPessoasDemo,
  obterObraContaCypher,
  obterUsuarioDemo,
  type CreditoObraEntrada,
  type DadosObraCypher,
  type BeatDemoInicial,
  type EventoDemoInicial,
  type DadosEventoCypher,
  type DadosBeatCypher,
  type FiltrosEventos,
  type EventoContaPersistido,
  type BeatContaPersistido,
  type FiltrosBuscaPerfisPublicos,
  type FiltrosCatalogoObras,
  type ObraContaPersistida,
  type ObraDemoInicial,
  type PerfilDemoInicial,
} from "./bancoDados.js";

export type DemoUser = Readonly<{
  name: string;
  role: string;
  city: string;
  handle: string;
  publicCode: string;
  email: string;
  initials: string;
  cTag: string;
  reputation: number;
  genres: readonly string[];
}>;

export const usuarioDemo: DemoUser = Object.freeze({
  name: "OG Emicê",
  role: "Rapper / MC",
  city: "São Paulo, SP",
  handle: "@ogemice",
  publicCode: "CYP-FANTASMA",
  email: "og.emice@cypher.art",
  initials: "OE",
  cTag: "CYP-OGE-0001",
  reputation: 78,
  genres: Object.freeze(["Rap alternativo", "Boom bap", "Composição"]),
});

export type Person = {
  name: string;
  role: string;
  city: string;
  tag: string;
  tone: string;
  initials: string;
};

export type Event = {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  org: string;
  status: string;
  color: string;
  description: string;
  format: string;
  registration: string;
  prize: string;
  tags: string[];
};

export type Beat = {
  title: string;
  producer: string;
  bpm: string;
  key: string;
  genre: string;
  license: string;
  duration: string;
  color: string;
  description: string;
  usage: string;
};

export type Work = {
  id: string;
  title: string;
  type: string;
  status: string;
  meta: string;
  role: string;
  credits: number;
  description: string;
  bpm: string;
  isrc: string;
  iswc: string;
  published: boolean;
};

export const tiposObra = [
  "Obra",
  "Música",
  "Beat",
  "Single",
  "EP",
  "Álbum",
  "Mixtape",
  "Outro",
];
export const generosObra = ["Rap", "Boom bap", "Trap", "R&B", "Lo-fi", "Outro"];
export const statusObra = ["Em produção", "Rascunho", "Lançado"];
export const papeisObra = [
  "Artista principal",
  "Composição",
  "Produção musical",
  "Instrumentação",
  "Participação como feat",
  "Outro crédito",
];

export type { CreditoObraEntrada, DadosObraCypher, ObraContaPersistida };
export type { DadosEventoCypher, FiltrosEventos, EventoContaPersistido };
export type { DadosBeatCypher, BeatContaPersistido };

const people: Person[] = [
  {
    name: "Nina Sincera",
    role: "Rapper / MC",
    city: "São Paulo, SP",
    tag: "Rap alternativo",
    tone: "yellow",
    initials: "NS",
  },
  {
    name: "Kota 47",
    role: "Beatmaker",
    city: "Belo Horizonte, MG",
    tag: "Boom bap · 92 BPM",
    tone: "green",
    initials: "K4",
  },
  {
    name: "Léo Goma",
    role: "Produtor musical",
    city: "Rio de Janeiro, RJ",
    tag: "Trap · R&B",
    tone: "black",
    initials: "LG",
  },
  {
    name: "DJ Miro",
    role: "DJ",
    city: "Curitiba, PR",
    tag: "Sets · Eventos",
    tone: "cream",
    initials: "DM",
  },
];

const events: Event[] = [
  {
    title: "Batalha da Praça 011",
    category: "Batalha",
    date: "18 OUT",
    time: "15h00",
    location: "Praça Roosevelt · São Paulo, SP",
    org: "Coletivo Linha 5",
    status: "Inscrições abertas",
    color: "yellow",
    description:
      "Ponto de encontro da nova geração do rap. MCs de toda a região se reúnem para trocar rimas e fortalecer a cultura de rua, com estrutura de som e premiação para os destaques.",
    format: "Batalha de MCs · Solo · 1x1",
    registration: "Gratuita · vagas limitadas",
    prize: "R$ 500 e troféu",
    tags: ["Batalha", "MCs", "Inscrições abertas", "Presencial"],
  },
  {
    title: "Cypher Subsolo #08",
    category: "Cypher",
    date: "25 OUT",
    time: "19h30",
    location: "Galpão 9 · Belo Horizonte, MG",
    org: "Núcleo Subsolo",
    status: "Acontece em breve",
    color: "green",
    description:
      "Encontro audiovisual colaborativo para artistas e produtores independentes. Os participantes criam uma faixa coletiva e registram o processo em uma sessão ao vivo.",
    format: "Gravação coletiva · 8 artistas",
    registration: "Inscrição gratuita · seleção por portfólio",
    prize: "Vídeo-session e divulgação",
    tags: ["Cypher", "Colaboração", "Presencial", "Seleção aberta"],
  },
  {
    title: "Workshop: créditos sem ruído",
    category: "Workshop",
    date: "03 NOV",
    time: "18h00",
    location: "Online · Sala Cypher",
    org: "Cypher Central",
    status: "Vagas limitadas",
    color: "cream",
    description:
      "Uma conversa prática sobre como organizar autoria, gravação e créditos antes de lançar uma música, com espaço para perguntas e exemplos de documentação.",
    format: "Workshop online · 90 minutos",
    registration: "Gratuita · 40 vagas",
    prize: "Material de apoio e certificado de participação",
    tags: ["Formação", "Direitos autorais", "Online", "Inscrições abertas"],
  },
  {
    title: "Show: Margem Norte",
    category: "Show",
    date: "07 NOV",
    time: "20h30",
    location: "Casa Vazia · São Paulo, SP",
    org: "Coletivo Margem",
    status: "Pré-inscrições abertas",
    color: "yellow",
    description:
      "Noite independente com palco compartilhado para artistas da cena. A organização busca propostas autorais e sets curtos para aproximar novos públicos.",
    format: "Show independente · palco compartilhado",
    registration: "Inscrição gratuita · curadoria por portfólio",
    prize: "Apresentação ao vivo e registro de session",
    tags: ["Show", "Música ao vivo", "São Paulo", "Inscrições abertas"],
  },
];

const beats: Beat[] = [
  {
    title: "Semáforo quebrado",
    producer: "Kota 47",
    bpm: "92 BPM",
    key: "Dm",
    genre: "Boom bap",
    license: "Uso gratuito",
    duration: "2:48",
    color: "green",
    description:
      "Bateria seca, baixo encorpado e espaço para versos narrativos. Beat demonstrativo para colaboração na cena.",
    usage:
      "Uso gratuito com crédito ao produtor; confirmar condições antes de qualquer lançamento.",
  },
  {
    title: "Linha de fuga",
    producer: "Léo Goma",
    bpm: "140 BPM",
    key: "F#m",
    genre: "Trap",
    license: "Disponível",
    duration: "3:12",
    color: "yellow",
    description:
      "Synths atmosféricos e groove marcado, pensado para uma faixa de energia crescente.",
    usage:
      "Disponível para contato. Licença e valores devem ser combinados diretamente com o produtor.",
  },
  {
    title: "Domingo nublado",
    producer: "Aisha Beats",
    bpm: "78 BPM",
    key: "Am",
    genre: "Lo-fi rap",
    license: "Disponível",
    duration: "2:31",
    color: "black",
    description:
      "Textura lo-fi com piano e bateria suave para composições intimistas.",
    usage:
      "Disponível para contato. Confirme os termos de uso com a produtora.",
  },
];

const works: Work[] = [
  {
    id: "obra-01",
    title: "Cidade em silêncio",
    type: "Single",
    status: "Lançado",
    meta: "Set 2026 · Rap alternativo",
    role: "Artista principal",
    credits: 4,
    description:
      "Single sobre os deslocamentos e encontros que atravessam a cidade à noite.",
    bpm: "92 BPM",
    isrc: "Pendente no protótipo",
    iswc: "Pendente no protótipo",
    published: true,
  },
  {
    id: "obra-02",
    title: "Margem & centro",
    type: "EP · participação",
    status: "Lançado",
    meta: "Ago 2026 · Boom bap",
    role: "Participação como feat",
    credits: 6,
    description: "Participação de OG Emicê em faixa do EP de Nina Sincera.",
    bpm: "88 BPM",
    isrc: "Pendente no protótipo",
    iswc: "Pendente no protótipo",
    published: true,
  },
  {
    id: "obra-03",
    title: "Pé no asfalto",
    type: "Single",
    status: "Em produção",
    meta: "Jul 2026 · Boom bap",
    role: "Artista principal",
    credits: 3,
    description:
      "Faixa em produção com instrumentação de Kota 47 e créditos ainda em revisão.",
    bpm: "96 BPM",
    isrc: "Ainda não solicitado",
    iswc: "Ainda não solicitado",
    published: false,
  },
  {
    id: "obra-04",
    title: "Noite de concreto",
    type: "Single",
    status: "Lançado",
    meta: "Jun 2026 · Rap",
    role: "Artista principal",
    credits: 5,
    description:
      "Lançamento independente registrado no catálogo demonstrativo do perfil.",
    bpm: "90 BPM",
    isrc: "Pendente no protótipo",
    iswc: "Pendente no protótipo",
    published: true,
  },
];

const usuarioDemoId = "demo-og-emice";

function slugDemonstrativo(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idPerfilDemo(
  tipo: "profissional" | "organizador",
  nome: string
): string {
  return `demo-${tipo}-${slugDemonstrativo(nome)}`;
}

function criarPerfilDemo(
  id: string,
  nome: string,
  funcao: string,
  cidade: string,
  iniciais: string,
  etiqueta: string,
  tom: string,
  generos: string[],
  cTag?: string,
  email: string | null = null,
  tipoConta: "profissional" | "organizador" = "profissional",
  reputacao = 0
): PerfilDemoInicial {
  return {
    id,
    ordem: 0,
    email,
    codigoPublico: id === usuarioDemoId ? "CYP-FANTASMA" : "",
    tipoConta,
    nome,
    funcao,
    cidade,
    identificador: `@${slugDemonstrativo(nome)}`,
    iniciais,
    cTag: cTag ?? `CYP-DEMO-${slugDemonstrativo(nome).toUpperCase()}`,
    reputacao,
    generos,
    categorias: [funcao],
    outraCategoria: "",
    etiqueta,
    tom,
  };
}

export function inicializarDadosDemonstrativos(): void {
  const perfis: PerfilDemoInicial[] = [
    criarPerfilDemo(
      usuarioDemoId,
      usuarioDemo.name,
      usuarioDemo.role,
      usuarioDemo.city,
      usuarioDemo.initials,
      usuarioDemo.genres.join(" · "),
      "yellow",
      [...usuarioDemo.genres],
      usuarioDemo.cTag,
      usuarioDemo.email,
      "profissional",
      usuarioDemo.reputation
    ),
    ...people.map(person =>
      criarPerfilDemo(
        idPerfilDemo("profissional", person.name),
        person.name,
        person.role,
        person.city,
        person.initials,
        person.tag,
        person.tone,
        [person.tag]
      )
    ),
  ];

  const nomesDePerfil = new Set(
    perfis.map(perfil => perfil.nome.toLowerCase())
  );
  for (const beat of beats) {
    if (nomesDePerfil.has(beat.producer.toLowerCase())) continue;
    perfis.push(
      criarPerfilDemo(
        idPerfilDemo("profissional", beat.producer),
        beat.producer,
        "Beatmaker",
        "Brasil",
        beat.producer
          .split(/\s+/)
          .map(parte => parte[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        beat.genre,
        beat.color,
        [beat.genre]
      )
    );
    nomesDePerfil.add(beat.producer.toLowerCase());
  }

  const nomesOrganizadores = [...new Set(events.map(event => event.org))];
  for (const nome of nomesOrganizadores) {
    perfis.push(
      criarPerfilDemo(
        idPerfilDemo("organizador", nome),
        nome,
        "Organizador de eventos",
        "Brasil",
        nome
          .split(/\s+/)
          .map(parte => parte[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        "Organização",
        "green",
        [],
        undefined,
        null,
        "organizador"
      )
    );
  }

  let numeroDemo = 0;
  perfis.forEach((perfil, ordem) => {
    perfil.ordem = ordem;
    if (!perfil.codigoPublico) {
      numeroDemo += 1;
      perfil.codigoPublico = `CYP-DEMO${String(numeroDemo).padStart(4, "0")}`;
    }
  });

  const eventosIniciais: EventoDemoInicial[] = events.map((event, index) => ({
    ...event,
    id: `demo-evento-${String(index + 1).padStart(2, "0")}`,
    proprietarioId: idPerfilDemo("organizador", event.org),
    ordem: index,
  }));
  const beatsIniciais: BeatDemoInicial[] = beats.map((beat, index) => ({
    ...beat,
    vendaExclusiva: false,
    id: `demo-beat-${String(index + 1).padStart(2, "0")}`,
    produtorId: idPerfilDemo("profissional", beat.producer),
    ordem: index,
  }));
  const obrasIniciais: ObraDemoInicial[] = works.map((work, index) => ({
    ...work,
    proprietarioId: usuarioDemoId,
    ordem: index,
  }));

  inicializarBancoCypher({
    perfis,
    eventos: eventosIniciais,
    beats: beatsIniciais,
    obras: obrasIniciais,
    usuarioDemoId,
  });
}

export const CypherModel = {
  usuario: () => obterUsuarioDemo(usuarioDemoId) ?? usuarioDemo,
  pessoas: () => listarPessoasDemo(people.map(person => person.name)),
  buscarPessoasPublicas: (
    filtros: FiltrosBuscaPerfisPublicos,
    usuarioId: string
  ) => buscarPerfisPublicosCypher(filtros, usuarioId),
  eventos: () => listarEventosDemo(),
  eventosDisponiveis: (filtros: FiltrosEventos, usuarioId: string) =>
    listarEventosCypher(filtros, usuarioId),
  evento: (id: string, usuarioId: string) => obterEventoCypher(id, usuarioId),
  criarEvento: (usuarioId: string, dados: DadosEventoCypher) =>
    criarEventoCypher(usuarioId, dados),
  atualizarEvento: (id: string, usuarioId: string, dados: DadosEventoCypher) =>
    atualizarEventoCypher(id, usuarioId, dados),
  excluirEvento: (id: string, usuarioId: string) =>
    excluirEventoCypher(id, usuarioId),
  beats: (usuarioId?: string) => listarBeatsCypher(usuarioId),
  criarBeat: (produtorId: string, dados: DadosBeatCypher) =>
    criarBeatCypher(produtorId, dados),
  obterBeat: (id: string, produtorId: string) =>
    obterBeatCypher(id, produtorId),
  atualizarBeat: (id: string, produtorId: string, dados: DadosBeatCypher) =>
    atualizarBeatCypher(id, produtorId, dados),
  excluirBeat: (id: string, produtorId: string) =>
    excluirBeatCypher(id, produtorId),
  obras: () => listarObrasDemo(),
  estatisticasObras: () => estatisticasObrasDemo(),
  obrasDoUsuario: (usuarioId: string, filtros?: FiltrosCatalogoObras) =>
    listarObrasContaCypher(usuarioId, filtros),
  obraDoUsuario: (id: string, usuarioId: string) =>
    obterObraContaCypher(id, usuarioId),
  perfisParaCredito: (usuarioId: string) =>
    listarPerfisParaCreditoCypher(usuarioId),
  criarObra: (
    usuarioId: string,
    dados: DadosObraCypher,
    creditos: CreditoObraEntrada[]
  ) => criarObraCypher(usuarioId, dados, creditos),
  atualizarObra: (
    id: string,
    usuarioId: string,
    dados: DadosObraCypher,
    creditos: CreditoObraEntrada[]
  ) => atualizarObraCypher(id, usuarioId, dados, creditos),
  excluirObra: (id: string, usuarioId: string) =>
    excluirObraCypher(id, usuarioId),
  estatisticasObrasDoUsuario: (usuarioId: string) =>
    estatisticasObrasUsuarioCypher(usuarioId),
  hitDoMes: () => ({
    titulo: "Metrô depois das duas",
    artista: usuarioDemo.name,
    genero: "Boom bap · São Paulo",
    duracao: "2:41",
    rotulo: "Destaque demonstrativo",
  }),
  faqs: () => [
    {
      q: "O que é ISRC?",
      a: "É um código usado para identificar gravações musicais. No Cypher, você pode guardar essa informação junto da obra e dos créditos.",
    },
    {
      q: "O que é ISWC?",
      a: "É um identificador internacional de obras musicais. Registre o código quando já tiver essa informação para manter seu histórico organizado.",
    },
    {
      q: "Como conseguir shows?",
      a: "Acompanhe oportunidades e eventos na plataforma. Mantenha o perfil profissional atualizado e registre suas participações.",
    },
    {
      q: "Como funciona a reputação?",
      a: "A reputação é uma informação profissional baseada em participação, avaliações e profissionalismo dentro da plataforma.",
    },
  ],
};

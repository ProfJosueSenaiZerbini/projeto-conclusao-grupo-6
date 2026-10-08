export type DemoUser = Readonly<{
  name: string;
  role: string;
  city: string;
  handle: string;
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

export const CypherModel = {
  usuario: () => usuarioDemo,
  pessoas: () => people,
  eventos: () => events,
  beats: () => beats,
  obras: () => works,
  estatisticasObras: () => ({
    publicadasComoArtista: works.filter(
      work => work.published && work.role === "Artista principal"
    ).length,
    participacoesComoFeat: works.filter(
      work => work.published && work.role === "Participação como feat"
    ).length,
    emAndamento: works.filter(work => work.status === "Em produção").length,
  }),
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

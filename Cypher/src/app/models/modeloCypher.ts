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
  demonstrarInteresseEventoCypher,
  cancelarInteresseEventoCypher,
  atualizarStatusInteresseEventoCypher,
  criarEventoCypher,
  atualizarEventoCypher,
  excluirEventoCypher,
  obterEventoCypher,
  criarNotificacaoCypher,
  listarNotificacoesCypher,
  contarNotificacoesNaoLidasCypher,
  marcarNotificacaoLidaCypher,
  marcarTodasNotificacoesLidasCypher,
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
  type StatusInteresseEvento,
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
  "Instrumental",
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

const events: Event[] = [];

const beats: Beat[] = [];

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

  const eventosIniciais: EventoDemoInicial[] = [];
  const beatsIniciais: BeatDemoInicial[] = [];
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
  demonstrarInteresseEvento: (eventoId: string, usuarioId: string) =>
    demonstrarInteresseEventoCypher(eventoId, usuarioId),
  cancelarInteresseEvento: (eventoId: string, usuarioId: string) =>
    cancelarInteresseEventoCypher(eventoId, usuarioId),
  atualizarStatusInteresseEvento: (
    eventoId: string,
    organizadorId: string,
    usuarioInteressadoId: string,
    status: Extract<
      StatusInteresseEvento,
      "interessado" | "inscrito" | "confirmado" | "rejeitado"
    >
  ) =>
    atualizarStatusInteresseEventoCypher(
      eventoId,
      organizadorId,
      usuarioInteressadoId,
      status
    ),
  criarEvento: (usuarioId: string, dados: DadosEventoCypher) =>
    criarEventoCypher(usuarioId, dados),
  atualizarEvento: (id: string, usuarioId: string, dados: DadosEventoCypher) =>
    atualizarEventoCypher(id, usuarioId, dados),
  excluirEvento: (id: string, usuarioId: string) =>
    excluirEventoCypher(id, usuarioId),
  criarNotificacao: criarNotificacaoCypher,
  notificacoes: (usuarioId: string, limite?: number) =>
    listarNotificacoesCypher(usuarioId, limite),
  notificacoesNaoLidas: (usuarioId: string) =>
    contarNotificacoesNaoLidasCypher(usuarioId),
  marcarNotificacaoLida: marcarNotificacaoLidaCypher,
  marcarTodasNotificacoesLidas: marcarTodasNotificacoesLidasCypher,
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

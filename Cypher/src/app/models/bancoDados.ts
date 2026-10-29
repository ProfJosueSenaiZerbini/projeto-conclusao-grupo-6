import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { categoriaLegadaRapperMC, categoriasGerais } from "./modeloPerfil.js";
import {
  catalogoPerguntasPorCategoria,
  validarRespostasAtuacao,
} from "./questionarioAtuacao.js";

export type PerfilDemoInicial = {
  id: string;
  ordem: number;
  email: string | null;
  codigoPublico: string;
  tipoConta: "profissional" | "organizador";
  nome: string;
  funcao: string;
  cidade: string;
  identificador: string;
  iniciais: string;
  cTag: string;
  reputacao: number;
  generos: string[];
  categorias: string[];
  outraCategoria: string;
  etiqueta: string;
  tom: string;
};

export type PessoaPersistida = {
  name: string;
  role: string;
  city: string;
  tag: string;
  tone: string;
  initials: string;
};

export type EventoPersistido = {
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
  participationType: "aberta" | "aprovacao";
};

export type DadosEventoCypher = EventoPersistido;

export type FiltrosEventos = {
  categoria: string;
  localizacao: string;
  formato: string;
  periodo: "todos" | "proximos" | "passados";
  ordem: "recentes" | "data" | "titulo";
};

export type StatusInteresseEvento =
  "interessado" | "inscrito" | "confirmado" | "rejeitado" | "cancelado";

export type InteresseEventoPersistido = {
  id: string;
  eventoId: string;
  usuarioId: string;
  nome: string;
  handle: string;
  status: StatusInteresseEvento;
  criadoEm: string;
  atualizadoEm: string;
};

export type EventoContaPersistido = EventoPersistido & {
  id: string;
  proprietarioId: string;
  demonstracao: boolean;
  owned: boolean;
  criadoEm: string;
  interesseStatus: StatusInteresseEvento | null;
  totalInteressados: number;
  interessados: InteresseEventoPersistido[];
};

export type BeatPersistido = {
  id: string;
  produtorId: string;
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
  vendaExclusiva: boolean;
};

export type BeatContaPersistido = BeatPersistido & {
  demonstracao: boolean;
  owned: boolean;
  criadoEm: string;
  ofertas: OfertaBeatPersistida[];
};

export type OfertaBeatPersistida = {
  id: string;
  tipo: string;
  precoCentavos: number | null;
  descricao: string;
  ativa: boolean;
};

export type DadosOfertaBeat = {
  tipo: string;
  preco: string;
  descricao: string;
};

export type DadosBeatCypher = {
  title: string;
  bpm: string;
  key: string;
  genre: string;
  license: string;
  duration: string;
  description: string;
  usage: string;
  vendaExclusiva: boolean;
  ofertas: DadosOfertaBeat[];
};

export type ObraPersistida = {
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

export type DadosObraCypher = {
  title: string;
  type: string;
  genre: string;
  status: string;
  role: string;
  description: string;
  lyrics: string;
  bpm: string;
  isrc: string;
  iswc: string;
  releaseDate: string;
  listenLink: string;
};

export type CreditoObraEntrada = {
  handle: string | null;
  name: string;
  role: string;
  participation: string;
};

export type CreditoObraPersistido = {
  id: string;
  userId: string | null;
  handle: string | null;
  name: string;
  role: string;
  participation: string;
  verified: boolean;
};

export type ObraContaPersistida = ObraPersistida &
  Pick<DadosObraCypher, "genre" | "lyrics" | "releaseDate" | "listenLink"> & {
    creditDetails: CreditoObraPersistido[];
    owned: boolean;
    participationRole: string;
  };

export type FiltrosCatalogoObras = {
  status: string;
  type: string;
  genre: string;
  role: string;
  order: "recentes" | "antigas" | "titulo" | "lancamento" | "status";
};

export type PerfilParaCredito = {
  name: string;
  handle: string;
};

export type UsuarioDemoPersistido = {
  name: string;
  role: string;
  city: string;
  handle: string;
  publicCode: string;
  email: string;
  initials: string;
  cTag: string;
  reputation: number;
  genres: string[];
};

export type EventoDemoInicial = EventoPersistido & {
  id: string;
  proprietarioId: string;
  ordem: number;
};

export type BeatDemoInicial = BeatPersistido & {
  id: string;
  produtorId: string;
  ordem: number;
};

export type ObraDemoInicial = ObraPersistida & {
  proprietarioId: string;
  ordem: number;
};

export type DadosDemoIniciais = {
  perfis: PerfilDemoInicial[];
  eventos: EventoDemoInicial[];
  beats: BeatDemoInicial[];
  obras: ObraDemoInicial[];
  usuarioDemoId: string;
};

export type RespostasAtuacao = Record<string, string | string[] | boolean>;
export type VisibilidadesAtuacao = Record<
  string,
  "publico" | "colaboradores" | "privado"
>;

export type AtuacaoProfissionalPersistida = {
  categoria: string;
  respostas: RespostasAtuacao;
  visibilidades: VisibilidadesAtuacao;
};

export type DadosNovaConta = {
  id: string;
  email: string;
  senhaHash: string;
  tipoConta: "profissional" | "organizador";
  nome: string;
  funcao: string;
  identificador: string;
  iniciais: string;
  cTag: string;
  categorias: string[];
  outraCategoria: string;
  atuacoes?: AtuacaoProfissionalPersistida[];
};

export type CredenciaisUsuario = {
  id: string;
  email: string;
  senhaHash: string;
};

export type UsuarioDaSessao = {
  id: string;
  email: string | null;
  publicCode: string;
  tipoConta: "profissional" | "organizador";
  demonstracao: boolean;
  name: string;
  role: string;
  city: string;
  handle: string;
  initials: string;
  cTag: string;
  reputation: number;
  genres: string[];
  categories: string[];
  otherCategory: string;
  biography: string;
  contact: string;
  availability: string;
  equipment: string[];
  profilePublic: boolean;
  locationPublic: boolean;
  contactPublic: boolean;
  createdAt: string;
};

export type DadosAtualizacaoPerfil = {
  id: string;
  name: string;
  role: string;
  city: string;
  biography: string;
  contact: string;
  availability: string;
  genres: string[];
  propostaGenero?: string;
  categories: string[];
  atuacoes?: AtuacaoProfissionalPersistida[];
  otherCategory: string;
  equipment: string[];
  initials: string;
  tipoConta: "profissional" | "organizador";
};

export type PerfilPublico = {
  name: string;
  role: string;
  city: string;
  handle: string;
  publicCode: string;
  initials: string;
  cTag: string;
  biography: string;
  contact: string;
  availability: string;
  genres: string[];
  categories: string[];
  atuacoes: Array<{
    categoria: string;
    respostas: RespostasAtuacao;
  }>;
  equipment: string[];
  createdAt: string;
};

export type ObraPublicaPerfil = {
  title: string;
  type: string;
  genre: string;
  role: string;
  releaseDate: string;
  listenLink: string;
  lyrics: string;
};

export type FiltrosBuscaPerfisPublicos = {
  q: string;
  categoria: string;
  genero: string;
  localizacao: string;
};

export type PerfilBuscaPublico = {
  name: string;
  role: string;
  city: string;
  handle: string;
  initials: string;
  availability: string;
  genres: string[];
  categories: string[];
  otherCategory: string;
  tone: string;
};

export type ResultadoBuscaPerfisPublicos = {
  pessoas: PerfilBuscaPublico[];
  filtros: FiltrosBuscaPerfisPublicos;
  opcoes: {
    categorias: string[];
    generos: string[];
    localizacoes: string[];
  };
};

export type ResultadoExclusaoConta = {
  excluida: boolean;
  obras: number;
  eventos: number;
  beats: number;
};

export type NotificacaoPersistida = {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  url: string;
  entidadeTipo: string;
  entidadeId: string;
  lida: boolean;
  criadaEm: string;
};

export type EstadoAlteracaoCategorias = {
  bloqueada: boolean;
  proximaAlteracao: string | null;
  excecaoDisponivel: boolean;
};

export type PropostaGeneroPersistida = {
  id: string;
  usuarioId: string;
  nome: string;
  handle: string;
  genero: string;
  criadaEm: string;
};

export type PropostaCategoriaPersistida = {
  id: string;
  usuarioId: string;
  nome: string;
  handle: string;
  categoria: string;
  criadaEm: string;
};

export type PerfilParaExcecaoCategoria = {
  usuarioId: string;
  nome: string;
  email: string;
  categoriasJson: string;
  alteradaEm: string | null;
  proximaAlteracao: string | null;
  excecaoPendente: boolean;
  solicitacaoPendente: boolean;
};

export type SolicitacaoExcecaoCategoriaPersistida = {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  handle: string;
  motivo: string;
  motivoCodigo: string;
  categoriasAntes: string[];
  categoriasSolicitadas: string[];
  respostasSolicitadas: Record<string, RespostasAtuacao>;
  visibilidadesSolicitadas: Record<string, VisibilidadesAtuacao>;
  historico: Array<{
    autorTipo: "usuario" | "administrador";
    mensagem: string;
    criadaEm: string;
  }>;
  criadaEm: string;
};

export type EstadoSolicitacaoExcecaoCategoria = {
  id: string;
  status: "pendente" | "aprovado" | "rejeitado";
  motivo: string;
  motivoRevisao: string;
  motivoCodigo: string;
  categoriasAntes: string[];
  categoriasSolicitadas: string[];
  respostasSolicitadas: Record<string, RespostasAtuacao>;
  visibilidadesSolicitadas: Record<string, VisibilidadesAtuacao>;
  historico: Array<{
    autorTipo: "usuario" | "administrador";
    mensagem: string;
    criadaEm: string;
  }>;
  criadaEm: string;
};

export type ResultadoAtualizacaoPerfil = {
  atualizado: boolean;
  categoriasBloqueadas: boolean;
  proximaAlteracao: string | null;
  propostaGeneroRegistrada: boolean;
};

type BancoCypher = InstanceType<typeof Database>;

let banco: BancoCypher | undefined;

const versaoEsquema = 16;

function iniciaisPublicas(nome: string): string {
  const partes = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const iniciais = partes
    .slice(0, 2)
    .map(parte => parte[0]?.toUpperCase() ?? "")
    .join("");
  if (!iniciais) return "AA";
  if (iniciais.length === 1) return `${iniciais}${iniciais}`;
  return iniciais.slice(0, 2);
}

function codigoPublicoReal(iniciais: string, numero: number): string {
  const normalizadas = iniciais
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toUpperCase();
  const prefixo = normalizadas
    ? (normalizadas + (normalizadas[1] ?? normalizadas[0])).slice(0, 2)
    : "AA";
  return `CYP-${prefixo}${String(numero).padStart(7, "0")}`;
}

const esquema = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT,
    senha_hash TEXT,
    tipo_conta TEXT NOT NULL DEFAULT 'profissional'
      CHECK (tipo_conta IN ('profissional', 'organizador')),
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    codigo_publico TEXT NOT NULL UNIQUE,
    numero_sequencial INTEGER UNIQUE,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS indice_email_usuario_real
    ON usuarios(email COLLATE NOCASE)
    WHERE email IS NOT NULL AND demonstracao = 0;

  CREATE TABLE IF NOT EXISTS perfis (
    usuario_id TEXT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    c_tag TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL,
    cidade TEXT NOT NULL DEFAULT '',
    identificador TEXT NOT NULL,
    iniciais TEXT NOT NULL DEFAULT '',
    reputacao INTEGER NOT NULL DEFAULT 0,
    generos_json TEXT NOT NULL DEFAULT '[]',
    categorias_json TEXT NOT NULL DEFAULT '[]',
    outra_categoria TEXT NOT NULL DEFAULT '',
    etiqueta TEXT NOT NULL DEFAULT '',
    tom TEXT NOT NULL DEFAULT 'yellow',
    ordem_demo INTEGER NOT NULL DEFAULT 0,
    biografia TEXT NOT NULL DEFAULT '',
    contato TEXT NOT NULL DEFAULT '',
    disponibilidade TEXT NOT NULL DEFAULT '',
    equipamentos_json TEXT NOT NULL DEFAULT '[]',
    perfil_publico INTEGER NOT NULL DEFAULT 0 CHECK (perfil_publico IN (0, 1)),
    localizacao_publica INTEGER NOT NULL DEFAULT 0 CHECK (localizacao_publica IN (0, 1)),
    contato_publico INTEGER NOT NULL DEFAULT 0 CHECK (contato_publico IN (0, 1)),
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS obras (
    id TEXT PRIMARY KEY,
    proprietario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    situacao TEXT NOT NULL,
    metadados TEXT NOT NULL DEFAULT '',
    funcao_principal TEXT NOT NULL DEFAULT '',
    quantidade_creditos INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_creditos >= 0),
    descricao TEXT NOT NULL DEFAULT '',
    genero TEXT NOT NULL DEFAULT '',
    letra TEXT NOT NULL DEFAULT '',
    bpm TEXT NOT NULL DEFAULT '',
    isrc TEXT NOT NULL DEFAULT '',
    iswc TEXT NOT NULL DEFAULT '',
    data_lancamento TEXT NOT NULL DEFAULT '',
    link_escuta TEXT NOT NULL DEFAULT '',
    publicada INTEGER NOT NULL DEFAULT 0 CHECK (publicada IN (0, 1)),
    ordem_demo INTEGER NOT NULL DEFAULT 0,
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_obras_proprietario
    ON obras(proprietario_id, criado_em);

  CREATE TABLE IF NOT EXISTS creditos (
    id TEXT PRIMARY KEY,
    obra_id TEXT NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    usuario_creditado_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    nome_creditado TEXT NOT NULL,
    funcao TEXT NOT NULL,
    participacao TEXT NOT NULL DEFAULT '',
    verificado INTEGER NOT NULL DEFAULT 0 CHECK (verificado IN (0, 1)),
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_creditos_obra ON creditos(obra_id);
  CREATE INDEX IF NOT EXISTS indice_creditos_usuario ON creditos(usuario_creditado_id);

  CREATE TABLE IF NOT EXISTS eventos (
    id TEXT PRIMARY KEY,
    proprietario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data_texto TEXT NOT NULL DEFAULT '',
    horario TEXT NOT NULL DEFAULT '',
    local TEXT NOT NULL DEFAULT '',
    organizador TEXT NOT NULL DEFAULT '',
    situacao TEXT NOT NULL DEFAULT '',
    cor TEXT NOT NULL DEFAULT 'yellow',
    descricao TEXT NOT NULL DEFAULT '',
    formato TEXT NOT NULL DEFAULT '',
    inscricao TEXT NOT NULL DEFAULT '',
    premio TEXT NOT NULL DEFAULT '',
    etiquetas_json TEXT NOT NULL DEFAULT '[]',
    tipo_participacao TEXT NOT NULL DEFAULT 'aberta'
      CHECK (tipo_participacao IN ('aberta', 'aprovacao')),
    ordem_demo INTEGER NOT NULL DEFAULT 0,
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_eventos_proprietario
    ON eventos(proprietario_id, criado_em);

  CREATE TABLE IF NOT EXISTS interesses_eventos (
    id TEXT PRIMARY KEY,
    evento_id TEXT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'interessado'
      CHECK (status IN ('interessado', 'inscrito', 'confirmado', 'rejeitado', 'cancelado')),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (evento_id, usuario_id)
  );

  CREATE INDEX IF NOT EXISTS indice_interesses_evento
    ON interesses_eventos(evento_id, status, criado_em);
  CREATE INDEX IF NOT EXISTS indice_interesses_usuario
    ON interesses_eventos(usuario_id, status, atualizado_em);

  CREATE TABLE IF NOT EXISTS beats (
    id TEXT PRIMARY KEY,
    produtor_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo TEXT NOT NULL,
    bpm TEXT NOT NULL DEFAULT '',
    tom_musical TEXT NOT NULL DEFAULT '',
    genero TEXT NOT NULL DEFAULT '',
    licenca TEXT NOT NULL DEFAULT '',
    duracao TEXT NOT NULL DEFAULT '',
    cor TEXT NOT NULL DEFAULT 'yellow',
    descricao TEXT NOT NULL DEFAULT '',
    condicoes_uso TEXT NOT NULL DEFAULT '',
    venda_exclusiva INTEGER NOT NULL DEFAULT 0 CHECK (venda_exclusiva IN (0, 1)),
    ordem_demo INTEGER NOT NULL DEFAULT 0,
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_beats_produtor ON beats(produtor_id);

  CREATE TABLE IF NOT EXISTS ofertas_beats (
    id TEXT PRIMARY KEY,
    beat_id TEXT NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    preco_centavos INTEGER,
    descricao TEXT NOT NULL DEFAULT '',
    ativa INTEGER NOT NULL DEFAULT 1 CHECK (ativa IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_ofertas_beat
    ON ofertas_beats(beat_id, ativa);

  CREATE TABLE IF NOT EXISTS sessoes (
    token_hash TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    expira_em INTEGER NOT NULL,
    criada_em INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS indice_sessoes_expiracao ON sessoes(expira_em);

  CREATE TABLE IF NOT EXISTS notificacoes (
    id TEXT PRIMARY KEY,
    usuario_destino_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    entidade_tipo TEXT NOT NULL DEFAULT '',
    entidade_id TEXT NOT NULL DEFAULT '',
    lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida_em TEXT,
    chave_origem TEXT UNIQUE
  );

  CREATE INDEX IF NOT EXISTS indice_notificacoes_usuario_data
    ON notificacoes(usuario_destino_id, criada_em);
  CREATE INDEX IF NOT EXISTS indice_notificacoes_usuario_lida
    ON notificacoes(usuario_destino_id, lida, criada_em);

  CREATE TABLE IF NOT EXISTS sequencias (
    nome TEXT PRIMARY KEY,
    proximo_numero INTEGER NOT NULL CHECK (proximo_numero > 0)
  );

  CREATE TABLE IF NOT EXISTS propostas_generos (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    genero TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente'
      CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisada_em TEXT,
    revisor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    motivo_revisao TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS indice_propostas_generos_status
    ON propostas_generos(status, criada_em);
  CREATE UNIQUE INDEX IF NOT EXISTS indice_proposta_genero_pendente_usuario
    ON propostas_generos(usuario_id, genero COLLATE NOCASE)
    WHERE status = 'pendente';

  CREATE TABLE IF NOT EXISTS propostas_categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente'
      CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisada_em TEXT,
    revisor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    revisor_email TEXT NOT NULL DEFAULT '',
    motivo_revisao TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS indice_propostas_categorias_status
    ON propostas_categorias(status, criada_em);
  CREATE UNIQUE INDEX IF NOT EXISTS indice_proposta_categoria_pendente
    ON propostas_categorias(categoria COLLATE NOCASE)
    WHERE status = 'pendente';
  CREATE UNIQUE INDEX IF NOT EXISTS indice_proposta_categoria_aprovada
    ON propostas_categorias(categoria COLLATE NOCASE)
    WHERE status = 'aprovado';

  CREATE TABLE IF NOT EXISTS categorias_profissionais_aprovadas (
    categoria TEXT PRIMARY KEY COLLATE NOCASE,
    aprovada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    revisor_email TEXT NOT NULL DEFAULT '',
    motivo_aprovacao TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS excecoes_categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    administrador_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    administrador_email TEXT NOT NULL,
    motivo TEXT NOT NULL,
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usada_em TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS indice_excecao_categoria_pendente_usuario
    ON excecoes_categorias(usuario_id) WHERE usada_em IS NULL;

  CREATE TABLE IF NOT EXISTS solicitacoes_excecao_categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente'
      CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revisada_em TEXT,
    revisor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    revisor_email TEXT NOT NULL DEFAULT '',
    motivo_revisao TEXT NOT NULL DEFAULT '',
    excecao_id TEXT REFERENCES excecoes_categorias(id) ON DELETE SET NULL,
    categorias_antes_json TEXT NOT NULL DEFAULT '[]',
    categorias_solicitadas_json TEXT NOT NULL DEFAULT '[]',
    respostas_solicitadas_json TEXT NOT NULL DEFAULT '{}',
    visibilidades_solicitadas_json TEXT NOT NULL DEFAULT '{}',
    motivo_codigo TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS indice_solicitacoes_excecao_status_data
    ON solicitacoes_excecao_categorias(status, criada_em);
  CREATE UNIQUE INDEX IF NOT EXISTS indice_solicitacao_excecao_pendente_usuario
    ON solicitacoes_excecao_categorias(usuario_id) WHERE status = 'pendente';

  CREATE TABLE IF NOT EXISTS historico_solicitacoes_categorias (
    id TEXT PRIMARY KEY,
    solicitacao_id TEXT NOT NULL REFERENCES solicitacoes_excecao_categorias(id) ON DELETE CASCADE,
    autor_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    autor_tipo TEXT NOT NULL CHECK (autor_tipo IN ('usuario', 'administrador')),
    mensagem TEXT NOT NULL,
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_historico_solicitacoes_categoria
    ON historico_solicitacoes_categorias(solicitacao_id, criada_em, id);

  CREATE TABLE IF NOT EXISTS auditoria_categorias (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    administrador_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    excecao_id TEXT REFERENCES excecoes_categorias(id) ON DELETE SET NULL,
    categorias_antes_json TEXT NOT NULL,
    categorias_depois_json TEXT NOT NULL,
    motivo TEXT NOT NULL DEFAULT '',
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_auditoria_categorias_usuario
    ON auditoria_categorias(usuario_id, criada_em DESC);

  CREATE TABLE IF NOT EXISTS respostas_atuacao_categoria (
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    respostas_json TEXT NOT NULL DEFAULT '{}',
    visibilidades_json TEXT NOT NULL DEFAULT '{}',
    versao_questionario INTEGER NOT NULL DEFAULT 1 CHECK (versao_questionario > 0),
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, categoria)
  );

  CREATE INDEX IF NOT EXISTS indice_respostas_atuacao_categoria
    ON respostas_atuacao_categoria(categoria, usuario_id);
`;

function bancoAtivo(): BancoCypher {
  if (!banco) {
    throw new Error(
      "O banco Cypher não foi inicializado. Inicialize-o antes de consultar os Models."
    );
  }
  return banco;
}

function normalizarCategoria(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

function inserirPropostaCategoria(
  db: BancoCypher,
  usuarioId: string,
  valorRecebido: string
): "criada" | "ja_pendente" | "ja_aprovada" | "categoria_base" | "invalida" {
  const categoria = valorRecebido.trim().replace(/\s+/g, " ");
  if (categoria.length < 2 || categoria.length > 60) return "invalida";
  const normalizada = normalizarCategoria(categoria);
  if (
    categoriasGerais.some(
      existente => normalizarCategoria(existente) === normalizada
    )
  ) {
    return "categoria_base";
  }
  const aprovadas = db
    .prepare("SELECT categoria FROM categorias_profissionais_aprovadas")
    .all() as Array<{ categoria: string }>;
  if (
    aprovadas.some(item => normalizarCategoria(item.categoria) === normalizada)
  ) {
    return "ja_aprovada";
  }
  const pendentes = db
    .prepare(
      "SELECT categoria FROM propostas_categorias WHERE status = 'pendente'"
    )
    .all() as Array<{ categoria: string }>;
  const existente = pendentes.find(
    item => normalizarCategoria(item.categoria) === normalizada
  );
  if (existente) return "ja_pendente";
  const resultado = db
    .prepare(
      `INSERT INTO propostas_categorias (id, usuario_id, categoria)
       VALUES (?, ?, ?) ON CONFLICT DO NOTHING`
    )
    .run(randomUUID(), usuarioId, categoria);
  return resultado.changes === 1 ? "criada" : "ja_pendente";
}

export function listarCategoriasProfissionaisCypher(): string[] {
  const aprovadas = bancoAtivo()
    .prepare(
      "SELECT categoria FROM categorias_profissionais_aprovadas ORDER BY categoria COLLATE NOCASE"
    )
    .all() as Array<{ categoria: string }>;
  const resultado = [...categoriasGerais];
  const conhecidas = new Set(resultado.map(normalizarCategoria));
  for (const { categoria } of aprovadas) {
    const normalizada = normalizarCategoria(categoria);
    if (!conhecidas.has(normalizada)) {
      resultado.push(categoria);
      conhecidas.add(normalizada);
    }
  }
  return resultado;
}

export function solicitarCategoriaProfissionalCypher(
  usuarioId: string,
  categoria: string
):
  | "criada"
  | "ja_pendente"
  | "ja_aprovada"
  | "categoria_base"
  | "invalida"
  | "nao_encontrada" {
  const db = bancoAtivo();
  const solicitar = db.transaction(() => {
    const conta = db
      .prepare("SELECT 1 FROM usuarios WHERE id = ? AND demonstracao = 0")
      .get(usuarioId);
    if (!conta) return "nao_encontrada" as const;
    return inserirPropostaCategoria(db, usuarioId, categoria);
  });
  return solicitar();
}

export function listarPropostasCategoriasPendentesCypher(): PropostaCategoriaPersistida[] {
  return bancoAtivo()
    .prepare(
      `SELECT c.id, c.usuario_id AS usuarioId, p.nome,
              p.identificador AS handle, c.categoria,
              c.criada_em AS criadaEm
       FROM propostas_categorias c
       JOIN perfis p ON p.usuario_id = c.usuario_id
       JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.status = 'pendente' AND u.demonstracao = 0
       ORDER BY datetime(c.criada_em), c.id`
    )
    .all() as PropostaCategoriaPersistida[];
}

export function criarNotificacaoCypher(dados: {
  usuarioDestinoId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  url: string;
  entidadeTipo?: string;
  entidadeId?: string;
  chaveOrigem?: string;
}): void {
  bancoAtivo()
    .prepare(
      `
      INSERT INTO notificacoes (
        id, usuario_destino_id, tipo, titulo, mensagem, url,
        entidade_tipo, entidade_id, chave_origem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(chave_origem) DO NOTHING
      `
    )
    .run(
      randomUUID(),
      dados.usuarioDestinoId,
      dados.tipo,
      dados.titulo,
      dados.mensagem,
      dados.url,
      dados.entidadeTipo ?? "",
      dados.entidadeId ?? "",
      dados.chaveOrigem ?? null
    );
}

function linhaNotificacao(
  linha: Record<string, unknown>
): NotificacaoPersistida {
  return {
    id: String(linha.id),
    tipo: String(linha.tipo),
    titulo: String(linha.titulo),
    mensagem: String(linha.mensagem),
    url: String(linha.url),
    entidadeTipo: String(linha.entidadeTipo),
    entidadeId: String(linha.entidadeId),
    lida: Boolean(linha.lida),
    criadaEm: String(linha.criadaEm),
  };
}

export function listarNotificacoesCypher(
  usuarioId: string,
  limite = 8
): NotificacaoPersistida[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT id, tipo, titulo, mensagem, url,
             entidade_tipo AS entidadeTipo,
             entidade_id AS entidadeId,
             lida, criada_em AS criadaEm
      FROM notificacoes
      WHERE usuario_destino_id = ?
      ORDER BY datetime(criada_em) DESC, id DESC
      LIMIT ?
      `
    )
    .all(usuarioId, Math.max(1, Math.min(50, limite)))
    .map(linha => linhaNotificacao(linha as Record<string, unknown>));
}

export function contarNotificacoesNaoLidasCypher(usuarioId: string): number {
  return (
    bancoAtivo()
      .prepare(
        "SELECT COUNT(*) AS total FROM notificacoes WHERE usuario_destino_id = ? AND lida = 0"
      )
      .get(usuarioId) as { total: number }
  ).total;
}

export function marcarNotificacaoLidaCypher(
  notificacaoId: string,
  usuarioId: string
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE notificacoes
      SET lida = 1, lida_em = CURRENT_TIMESTAMP
      WHERE id = ? AND usuario_destino_id = ? AND lida = 0
      `
    )
    .run(notificacaoId, usuarioId);
  return resultado.changes > 0;
}

export function marcarTodasNotificacoesLidasCypher(usuarioId: string): number {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE notificacoes
      SET lida = 1, lida_em = CURRENT_TIMESTAMP
      WHERE usuario_destino_id = ? AND lida = 0
      `
    )
    .run(usuarioId);
  return resultado.changes;
}

function ofertasDoBeat(beatId: string): OfertaBeatPersistida[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT
        id,
        tipo,
        preco_centavos AS precoCentavos,
        descricao,
        ativa
      FROM ofertas_beats
      WHERE beat_id = ? AND ativa = 1
      ORDER BY criado_em, id
      `
    )
    .all(beatId)
    .map(linha => {
      const oferta = linha as Omit<OfertaBeatPersistida, "ativa"> & {
        ativa: number;
      };
      return { ...oferta, ativa: Boolean(oferta.ativa) };
    });
}

function precoEmCentavos(valor: string): number | null {
  if (!valor.trim()) return null;
  const normalizado = valor.replace(",", ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) && numero >= 0
    ? Math.round(numero * 100)
    : null;
}

function substituirOfertasBeat(
  db: BancoCypher,
  beatId: string,
  ofertas: DadosOfertaBeat[],
  vendaExclusiva: boolean
): void {
  db.prepare("DELETE FROM ofertas_beats WHERE beat_id = ?").run(beatId);
  const inserir = db.prepare(
    `
    INSERT INTO ofertas_beats (id, beat_id, tipo, preco_centavos, descricao)
    VALUES (?, ?, ?, ?, ?)
    `
  );
  const ofertasParaSalvar = vendaExclusiva
    ? ofertas.filter(oferta => oferta.tipo === "Exclusiva").slice(0, 1)
    : ofertas;
  for (const oferta of ofertasParaSalvar) {
    inserir.run(
      randomUUID(),
      beatId,
      oferta.tipo,
      precoEmCentavos(oferta.preco),
      oferta.descricao
    );
  }
}

export function caminhoBancoCypher(): string {
  const configurado = process.env.CYPHER_DB_PATH;
  return path.resolve(
    configurado || path.join(process.cwd(), "data", "cypher.sqlite")
  );
}

export function inicializarBancoCypher(dados: DadosDemoIniciais): void {
  if (banco) return;

  const caminho = caminhoBancoCypher();
  fs.mkdirSync(path.dirname(caminho), { recursive: true });

  const conexao = new Database(caminho);
  conexao.pragma("foreign_keys = ON");
  conexao.pragma("busy_timeout = 5000");

  try {
    const inicializar = conexao.transaction(() => {
      const versaoAtual = conexao.pragma("user_version", {
        simple: true,
      }) as number;
      if (versaoAtual > versaoEsquema) {
        throw new Error(
          `O banco Cypher usa uma versão de esquema mais recente (${versaoAtual}) que a suportada (${versaoEsquema}).`
        );
      }

      conexao.exec(esquema);

      const garantirColunas = (
        tabela: string,
        colunas: ReadonlyArray<readonly [string, string]>
      ) => {
        const existentes = new Set(
          (
            conexao.pragma(`table_info(${tabela})`) as Array<{ name: string }>
          ).map(coluna => coluna.name)
        );
        for (const [nome, definicao] of colunas) {
          if (!existentes.has(nome)) {
            conexao.exec(
              `ALTER TABLE ${tabela} ADD COLUMN ${nome} ${definicao}`
            );
          }
        }
      };

      garantirColunas("usuarios", [
        ["codigo_publico", "TEXT"],
        ["numero_sequencial", "INTEGER"],
      ]);
      garantirColunas("perfis", [
        ["categorias_json", "TEXT NOT NULL DEFAULT '[]'"],
        ["outra_categoria", "TEXT NOT NULL DEFAULT ''"],
        ["equipamentos_json", "TEXT NOT NULL DEFAULT '[]'"],
        ["ultima_alteracao_categorias_em", "TEXT"],
        [
          "localizacao_publica",
          "INTEGER NOT NULL DEFAULT 1 CHECK (localizacao_publica IN (0, 1))",
        ],
        [
          "contato_publico",
          "INTEGER NOT NULL DEFAULT 0 CHECK (contato_publico IN (0, 1))",
        ],
      ]);
      garantirColunas("solicitacoes_excecao_categorias", [
        ["categorias_antes_json", "TEXT NOT NULL DEFAULT '[]'"],
        ["categorias_solicitadas_json", "TEXT NOT NULL DEFAULT '[]'"],
        ["respostas_solicitadas_json", "TEXT NOT NULL DEFAULT '{}'"],
        ["visibilidades_solicitadas_json", "TEXT NOT NULL DEFAULT '{}'"],
        ["motivo_codigo", "TEXT NOT NULL DEFAULT ''"],
      ]);
      if (versaoAtual < 16) {
        conexao.exec(`
          UPDATE solicitacoes_excecao_categorias
          SET categorias_antes_json = COALESCE((
            SELECT p.categorias_json FROM perfis p
            WHERE p.usuario_id = solicitacoes_excecao_categorias.usuario_id
          ), '[]')
          WHERE categorias_antes_json = '[]';
        `);
        conexao.exec(`
          INSERT INTO historico_solicitacoes_categorias (
            id, solicitacao_id, autor_id, autor_tipo, mensagem, criada_em
          )
          SELECT 'migracao-usuario-' || s.id, s.id, s.usuario_id,
                 'usuario', s.motivo, s.criada_em
          FROM solicitacoes_excecao_categorias s
          WHERE trim(s.motivo) <> ''
            AND NOT EXISTS (
              SELECT 1 FROM historico_solicitacoes_categorias h
              WHERE h.solicitacao_id = s.id
            );
          INSERT INTO historico_solicitacoes_categorias (
            id, solicitacao_id, autor_id, autor_tipo, mensagem, criada_em
          )
          SELECT 'migracao-admin-' || s.id, s.id, s.revisor_id,
                 'administrador', s.motivo_revisao, COALESCE(s.revisada_em, s.criada_em)
          FROM solicitacoes_excecao_categorias s
          WHERE trim(s.motivo_revisao) <> ''
            AND NOT EXISTS (
              SELECT 1 FROM historico_solicitacoes_categorias h
              WHERE h.solicitacao_id = s.id AND h.autor_tipo = 'administrador'
            );
        `);
      }
      conexao.exec(`
        UPDATE perfis
        SET ultima_alteracao_categorias_em = COALESCE(atualizado_em, criado_em, CURRENT_TIMESTAMP)
        WHERE demonstracao = 0 AND ultima_alteracao_categorias_em IS NULL
      `);
      garantirColunas("obras", [
        ["genero", "TEXT NOT NULL DEFAULT ''"],
        ["letra", "TEXT NOT NULL DEFAULT ''"],
        ["data_lancamento", "TEXT NOT NULL DEFAULT ''"],
        ["link_escuta", "TEXT NOT NULL DEFAULT ''"],
      ]);
      garantirColunas("beats", [
        [
          "venda_exclusiva",
          "INTEGER NOT NULL DEFAULT 0 CHECK (venda_exclusiva IN (0, 1))",
        ],
      ]);
      garantirColunas("eventos", [
        [
          "tipo_participacao",
          "TEXT NOT NULL DEFAULT 'aberta' CHECK (tipo_participacao IN ('aberta', 'aprovacao'))",
        ],
      ]);

      if (versaoAtual < 13) {
        const categoriasLegadas = conexao
          .prepare(
            `SELECT p.usuario_id AS usuarioId,
                    p.categorias_json AS categoriasJson,
                    p.outra_categoria AS outraCategoria
             FROM perfis p JOIN usuarios u ON u.id = p.usuario_id
             WHERE u.demonstracao = 0 AND trim(p.outra_categoria) <> ''`
          )
          .all() as Array<{
          usuarioId: string;
          categoriasJson: string;
          outraCategoria: string;
        }>;
        const limparCategoriaLegada = conexao.prepare(
          "UPDATE perfis SET funcao = ?, outra_categoria = '' WHERE usuario_id = ?"
        );
        for (const perfil of categoriasLegadas) {
          const categorias = JSON.parse(perfil.categoriasJson) as string[];
          if (categorias.includes("Outros")) {
            inserirPropostaCategoria(
              conexao,
              perfil.usuarioId,
              perfil.outraCategoria
            );
            limparCategoriaLegada.run(categorias.join(" · "), perfil.usuarioId);
          }
        }
      }

      if (versaoAtual < 14) {
        const categoriasAprovadas = conexao
          .prepare(
            `SELECT categoria, revisada_em AS aprovadaEm,
                    revisor_id AS revisorId, revisor_email AS revisorEmail,
                    motivo_revisao AS motivo
             FROM propostas_categorias
             WHERE status = 'aprovado'
             ORDER BY datetime(revisada_em), id`
          )
          .all() as Array<{
          categoria: string;
          aprovadaEm: string | null;
          revisorId: string | null;
          revisorEmail: string;
          motivo: string;
        }>;
        const existentes = conexao
          .prepare("SELECT categoria FROM categorias_profissionais_aprovadas")
          .all() as Array<{ categoria: string }>;
        const conhecidas = new Set([
          ...categoriasGerais.map(normalizarCategoria),
          ...existentes.map(item => normalizarCategoria(item.categoria)),
        ]);
        const inserirCategoriaAprovada = conexao.prepare(
          `INSERT INTO categorias_profissionais_aprovadas (
             categoria, aprovada_em, revisor_id, revisor_email, motivo_aprovacao
           ) VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?)
           ON CONFLICT DO NOTHING`
        );
        for (const item of categoriasAprovadas) {
          const chave = normalizarCategoria(item.categoria);
          if (conhecidas.has(chave)) continue;
          inserirCategoriaAprovada.run(
            item.categoria,
            item.aprovadaEm,
            item.revisorId,
            item.revisorEmail,
            item.motivo
          );
          conhecidas.add(chave);
        }
      }

      if (versaoAtual < 3) {
        conexao.exec(`
          UPDATE perfis
          SET perfil_publico = 0, localizacao_publica = 0, contato_publico = 0
          WHERE usuario_id IN (
            SELECT id FROM usuarios WHERE demonstracao = 0
          )
        `);
      }

      let proximoNumero = (
        conexao
          .prepare(
            "SELECT COALESCE(MAX(numero_sequencial), 0) + 1 AS proximo FROM usuarios WHERE demonstracao = 0"
          )
          .get() as { proximo: number }
      ).proximo;
      const contasReais = conexao
        .prepare(
          `
          SELECT u.id, u.codigo_publico AS codigoPublico,
                 u.numero_sequencial AS numeroSequencial,
                 p.nome
          FROM usuarios u
          LEFT JOIN perfis p ON p.usuario_id = u.id
          WHERE u.demonstracao = 0
            AND (u.codigo_publico IS NULL OR u.numero_sequencial IS NULL)
          ORDER BY datetime(u.criado_em), u.id
          `
        )
        .all() as Array<{
        id: string;
        codigoPublico: string | null;
        numeroSequencial: number | null;
        nome: string | null;
      }>;
      const atualizarConta = conexao.prepare(
        "UPDATE usuarios SET codigo_publico = ?, numero_sequencial = ? WHERE id = ?"
      );
      for (const conta of contasReais) {
        const numero = conta.numeroSequencial ?? proximoNumero++;
        const codigo =
          conta.codigoPublico ??
          codigoPublicoReal(iniciaisPublicas(conta.nome ?? "Conta"), numero);
        atualizarConta.run(codigo, numero, conta.id);
      }

      const contasDemo = conexao
        .prepare(
          `
          SELECT u.id, u.codigo_publico AS codigoPublico,
                 COALESCE(p.ordem_demo, 0) AS ordemDemo
          FROM usuarios u
          LEFT JOIN perfis p ON p.usuario_id = u.id
          WHERE u.demonstracao = 1 AND u.codigo_publico IS NULL
          ORDER BY ordemDemo, u.id
          `
        )
        .all() as Array<{
        id: string;
        codigoPublico: string | null;
        ordemDemo: number;
      }>;
      for (const conta of contasDemo) {
        const codigo =
          conta.id === "demo-og-emice"
            ? "CYP-FANTASMA"
            : `CYP-DEMO${String(conta.ordemDemo + 1).padStart(4, "0")}`;
        atualizarConta.run(codigo, null, conta.id);
      }

      conexao
        .prepare(
          `
          INSERT INTO sequencias (nome, proximo_numero)
          VALUES ('usuarios_reais', ?)
          ON CONFLICT(nome) DO UPDATE SET
            proximo_numero = MAX(sequencias.proximo_numero, excluded.proximo_numero)
          `
        )
        .run(proximoNumero);

      conexao.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS indice_usuarios_codigo_publico
          ON usuarios(codigo_publico) WHERE codigo_publico IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS indice_usuarios_numero_sequencial_real
          ON usuarios(numero_sequencial)
          WHERE demonstracao = 0 AND numero_sequencial IS NOT NULL;
      `);

      conexao.exec(`
        INSERT INTO ofertas_beats (id, beat_id, tipo, preco_centavos, descricao)
        SELECT
          'oferta-legada-' || b.id,
          b.id,
          b.licenca,
          NULL,
          b.condicoes_uso
        FROM beats b
        WHERE NOT EXISTS (
          SELECT 1 FROM ofertas_beats o WHERE o.beat_id = b.id
        )
      `);

      conexao.exec(`
        DELETE FROM eventos WHERE demonstracao = 1;
        DELETE FROM ofertas_beats
        WHERE beat_id IN (SELECT id FROM beats WHERE demonstracao = 1);
        DELETE FROM beats WHERE demonstracao = 1;
      `);

      banco = conexao;
      carregarDadosDemonstrativos(dados);
      const violacoesChaveEstrangeira = conexao
        .prepare("PRAGMA foreign_key_check")
        .all();
      if (violacoesChaveEstrangeira.length > 0) {
        throw new Error(
          `A inicialização do banco encontrou ${violacoesChaveEstrangeira.length} violação(ões) de chave estrangeira.`
        );
      }
      conexao.pragma(`user_version = ${versaoEsquema}`);
    });
    inicializar();
  } catch (erro) {
    banco = undefined;
    conexao.close();
    throw erro;
  }
}

function carregarDadosDemonstrativos(dados: DadosDemoIniciais): void {
  const db = bancoAtivo();

  const carregar = db.transaction(() => {
    const inserirUsuario = db.prepare(`
      INSERT INTO usuarios (
        id, email, senha_hash, tipo_conta, demonstracao, codigo_publico,
        numero_sequencial
      )
      VALUES (@id, @email, NULL, @tipoConta, 1, @codigoPublico, NULL)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        tipo_conta = excluded.tipo_conta,
        codigo_publico = excluded.codigo_publico
      WHERE usuarios.demonstracao = 1
    `);
    const inserirPerfil = db.prepare(`
      INSERT INTO perfis (
        usuario_id, c_tag, nome, funcao, cidade, identificador, iniciais,
        reputacao, generos_json, categorias_json, outra_categoria,
        etiqueta, tom, ordem_demo, demonstracao
      ) VALUES (
        @id, @cTag, @nome, @funcao, @cidade, @identificador, @iniciais,
        @reputacao, @generosJson, @categoriasJson, @outraCategoria,
        @etiqueta, @tom, @ordem, 1
      )
      ON CONFLICT(usuario_id) DO UPDATE SET
        c_tag = excluded.c_tag,
        nome = excluded.nome,
        funcao = excluded.funcao,
        cidade = excluded.cidade,
        identificador = excluded.identificador,
        iniciais = excluded.iniciais,
        reputacao = excluded.reputacao,
        generos_json = excluded.generos_json,
        categorias_json = excluded.categorias_json,
        outra_categoria = excluded.outra_categoria,
        etiqueta = excluded.etiqueta,
        tom = excluded.tom,
        ordem_demo = excluded.ordem_demo
      WHERE perfis.demonstracao = 1
    `);

    for (const perfil of dados.perfis) {
      inserirUsuario.run({
        id: perfil.id,
        email: perfil.email,
        tipoConta: perfil.tipoConta,
        codigoPublico: perfil.codigoPublico,
      });
      inserirPerfil.run({
        id: perfil.id,
        ordem: perfil.ordem,
        cTag: perfil.cTag,
        nome: perfil.nome,
        funcao: perfil.funcao,
        cidade: perfil.cidade,
        identificador: perfil.identificador,
        iniciais: perfil.iniciais,
        reputacao: perfil.reputacao,
        generosJson: JSON.stringify(perfil.generos),
        categoriasJson: JSON.stringify(perfil.categorias),
        outraCategoria: perfil.outraCategoria,
        etiqueta: perfil.etiqueta,
        tom: perfil.tom,
      });
    }

    const inserirObra = db.prepare(`
      INSERT INTO obras (
        id, proprietario_id, titulo, tipo, situacao, metadados, funcao_principal,
        quantidade_creditos, descricao, bpm, isrc, iswc, publicada, ordem_demo, demonstracao
      ) VALUES (
        @id, @proprietarioId, @title, @type, @status, @meta, @role,
        @credits, @description, @bpm, @isrc, @iswc, @published, @ordem, 1
      )
      ON CONFLICT(id) DO UPDATE SET
        proprietario_id = excluded.proprietario_id,
        titulo = excluded.titulo,
        tipo = excluded.tipo,
        situacao = excluded.situacao,
        metadados = excluded.metadados,
        funcao_principal = excluded.funcao_principal,
        quantidade_creditos = excluded.quantidade_creditos,
        descricao = excluded.descricao,
        bpm = excluded.bpm,
        isrc = excluded.isrc,
        iswc = excluded.iswc,
        publicada = excluded.publicada,
        ordem_demo = excluded.ordem_demo
      WHERE obras.demonstracao = 1
    `);
    for (const obra of dados.obras) {
      inserirObra.run({
        id: obra.id,
        proprietarioId: obra.proprietarioId,
        title: obra.title,
        type: obra.type,
        status: obra.status,
        meta: obra.meta,
        role: obra.role,
        credits: obra.credits,
        description: obra.description,
        bpm: obra.bpm,
        isrc: obra.isrc,
        iswc: obra.iswc,
        published: Number(obra.published),
        ordem: obra.ordem,
      });
    }

    const inserirCreditoDemo = db.prepare(`
      INSERT OR IGNORE INTO creditos (
        id, obra_id, usuario_creditado_id, nome_creditado, funcao,
        participacao, verificado, demonstracao
      ) VALUES (?, ?, ?, ?, ?, '', 0, 1)
    `);
    for (const obra of dados.obras) {
      inserirCreditoDemo.run(
        `credito-demo-${obra.id}`,
        obra.id,
        dados.usuarioDemoId,
        "OG Emicê",
        obra.role
      );
    }

    const inserirEvento = db.prepare(`
      INSERT INTO eventos (
        id, proprietario_id, titulo, categoria, data_texto, horario, local,
        organizador, situacao, cor, descricao, formato, inscricao, premio,
        etiquetas_json, tipo_participacao, ordem_demo, demonstracao
      ) VALUES (
        @id, @proprietarioId, @title, @category, @date, @time, @location,
        @org, @status, @color, @description, @format, @registration, @prize,
        @etiquetasJson, @participationType, @ordem, 1
      )
      ON CONFLICT(id) DO UPDATE SET
        proprietario_id = excluded.proprietario_id,
        titulo = excluded.titulo,
        categoria = excluded.categoria,
        data_texto = excluded.data_texto,
        horario = excluded.horario,
        local = excluded.local,
        organizador = excluded.organizador,
        situacao = excluded.situacao,
        cor = excluded.cor,
        descricao = excluded.descricao,
        formato = excluded.formato,
        inscricao = excluded.inscricao,
        premio = excluded.premio,
        etiquetas_json = excluded.etiquetas_json,
        tipo_participacao = excluded.tipo_participacao,
        ordem_demo = excluded.ordem_demo
      WHERE eventos.demonstracao = 1
    `);
    for (const evento of dados.eventos) {
      inserirEvento.run({
        id: evento.id,
        proprietarioId: evento.proprietarioId,
        title: evento.title,
        category: evento.category,
        date: evento.date,
        time: evento.time,
        location: evento.location,
        org: evento.org,
        status: evento.status,
        color: evento.color,
        description: evento.description,
        format: evento.format,
        registration: evento.registration,
        prize: evento.prize,
        etiquetasJson: JSON.stringify(evento.tags),
        participationType: evento.participationType,
        ordem: evento.ordem,
      });
    }

    const inserirBeat = db.prepare(`
      INSERT INTO beats (
        id, produtor_id, titulo, bpm, tom_musical, genero, licenca,
        duracao, cor, descricao, condicoes_uso, ordem_demo, demonstracao
      ) VALUES (
        @id, @produtorId, @title, @bpm, @key, @genre, @license,
        @duration, @color, @description, @usage, @ordem, 1
      )
      ON CONFLICT(id) DO UPDATE SET
        produtor_id = excluded.produtor_id,
        titulo = excluded.titulo,
        bpm = excluded.bpm,
        tom_musical = excluded.tom_musical,
        genero = excluded.genero,
        licenca = excluded.licenca,
        duracao = excluded.duracao,
        cor = excluded.cor,
        descricao = excluded.descricao,
        condicoes_uso = excluded.condicoes_uso,
        ordem_demo = excluded.ordem_demo
      WHERE beats.demonstracao = 1
    `);
    for (const beat of dados.beats) {
      inserirBeat.run({
        id: beat.id,
        produtorId: beat.produtorId,
        title: beat.title,
        bpm: beat.bpm,
        key: beat.key,
        genre: beat.genre,
        license: beat.license,
        duration: beat.duration,
        color: beat.color,
        description: beat.description,
        usage: beat.usage,
        ordem: beat.ordem,
      });
    }
  });

  carregar();
}

export function obterUsuarioDemo(
  id: string
): UsuarioDemoPersistido | undefined {
  const resultado = bancoAtivo()
    .prepare(
      `
      SELECT
        p.nome AS name,
        p.funcao AS role,
        p.cidade AS city,
        p.identificador AS handle,
        u.email AS email,
        u.codigo_publico AS publicCode,
        p.iniciais AS initials,
        p.c_tag AS cTag,
        p.reputacao AS reputation,
        p.generos_json AS genresJson
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.id = ? AND u.demonstracao = 1
    `
    )
    .get(id) as
    | (Omit<UsuarioDemoPersistido, "genres"> & { genresJson: string })
    | undefined;

  if (!resultado) return undefined;
  return {
    name: resultado.name,
    role: resultado.role,
    city: resultado.city,
    handle: resultado.handle,
    email: resultado.email,
    publicCode: resultado.publicCode,
    initials: resultado.initials,
    cTag: resultado.cTag,
    reputation: resultado.reputation,
    genres: JSON.parse(resultado.genresJson) as string[],
  };
}

export function listarPessoasDemo(
  nomes: readonly string[]
): PessoaPersistida[] {
  if (nomes.length === 0) return [];

  const parametros = nomes.map(() => "?").join(", ");
  return bancoAtivo()
    .prepare(
      `
      SELECT
        p.nome AS name,
        p.funcao AS role,
        p.cidade AS city,
        p.etiqueta AS tag,
        p.tom AS tone,
        p.iniciais AS initials
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 1
        AND u.tipo_conta = 'profissional'
        AND u.id <> ?
        AND p.nome IN (${parametros})
      ORDER BY p.ordem_demo, p.nome COLLATE NOCASE
    `
    )
    .all("demo-og-emice", ...nomes) as PessoaPersistida[];
}

export function listarEventosDemo(): EventoPersistido[] {
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        titulo AS title,
        categoria AS category,
        data_texto AS date,
        horario AS time,
        local AS location,
        organizador AS org,
        situacao AS status,
        cor AS color,
        descricao AS description,
        formato AS format,
        inscricao AS registration,
        premio AS prize,
        etiquetas_json AS tagsJson,
        tipo_participacao AS participationType
      FROM eventos
      WHERE demonstracao = 1
      ORDER BY ordem_demo
    `
    )
    .all() as Array<Omit<EventoPersistido, "tags"> & { tagsJson: string }>;

  return linhas.map(({ tagsJson, ...evento }) => ({
    ...evento,
    tags: JSON.parse(tagsJson) as string[],
  }));
}

export function listarEventosCypher(
  filtros: FiltrosEventos,
  usuarioId: string
): EventoContaPersistido[] {
  const filtrosSql: string[] = [];
  const parametros: Record<string, string> = { usuarioId };
  if (filtros.categoria) {
    filtrosSql.push("e.categoria = @categoria");
    parametros.categoria = filtros.categoria;
  }
  if (filtros.localizacao) {
    filtrosSql.push("LOWER(e.local) LIKE LOWER(@localizacao)");
    parametros.localizacao = `%${filtros.localizacao}%`;
  }
  if (filtros.formato) {
    filtrosSql.push("e.formato = @formato");
    parametros.formato = filtros.formato;
  }
  if (filtros.periodo === "proximos") {
    filtrosSql.push("(e.data_texto = '' OR e.data_texto >= date('now'))");
  } else if (filtros.periodo === "passados") {
    filtrosSql.push("e.data_texto <> '' AND e.data_texto < date('now')");
  }
  const ordenacao = {
    recentes: "e.criado_em DESC, e.id DESC",
    data: "CASE WHEN e.data_texto = '' THEN 1 ELSE 0 END, e.data_texto ASC, e.horario ASC, e.id ASC",
    titulo: "e.titulo COLLATE NOCASE ASC, e.id ASC",
  }[filtros.ordem];
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        e.id,
        e.proprietario_id AS proprietarioId,
        e.titulo AS title,
        e.categoria AS category,
        e.data_texto AS date,
        e.horario AS time,
        e.local AS location,
        e.organizador AS org,
        e.situacao AS status,
        e.cor AS color,
        e.descricao AS description,
        e.formato AS format,
        e.inscricao AS registration,
        e.premio AS prize,
        e.etiquetas_json AS tagsJson,
        e.tipo_participacao AS participationType,
        e.demonstracao,
        e.criado_em AS criadoEm,
        CASE WHEN e.proprietario_id = @usuarioId AND e.demonstracao = 0 THEN 1 ELSE 0 END AS owned,
        (
          SELECT ie.status
          FROM interesses_eventos ie
          WHERE ie.evento_id = e.id AND ie.usuario_id = @usuarioId
        ) AS interesseStatus,
        (
          SELECT COUNT(*)
          FROM interesses_eventos ie
          WHERE ie.evento_id = e.id
            AND e.demonstracao = 0
            AND ie.status IN ('interessado', 'inscrito', 'confirmado')
        ) AS totalInteressados
      FROM eventos e
      WHERE ${filtrosSql.length ? filtrosSql.join(" AND ") : "1 = 1"}
      ORDER BY ${ordenacao}
      `
    )
    .all(parametros) as Array<
    Omit<EventoContaPersistido, "tags" | "demonstracao" | "owned"> & {
      tagsJson: string;
      demonstracao: number;
      owned: number;
      interesseStatus: StatusInteresseEvento | null;
      totalInteressados: number;
    }
  >;
  return linhas.map(
    ({
      tagsJson,
      demonstracao,
      owned,
      totalInteressados,
      interessados = [],
      ...evento
    }) => ({
      ...evento,
      tags: JSON.parse(tagsJson) as string[],
      demonstracao: Boolean(demonstracao),
      owned: Boolean(owned),
      totalInteressados: Number(totalInteressados),
      interessados: owned
        ? listarInteressesEventoCypher(evento.id)
        : interessados,
    })
  );
}

export function obterEventoCypher(
  id: string,
  usuarioId: string
): EventoContaPersistido | undefined {
  const linha = bancoAtivo()
    .prepare(
      `
      SELECT
        e.id,
        e.proprietario_id AS proprietarioId,
        e.titulo AS title,
        e.categoria AS category,
        e.data_texto AS date,
        e.horario AS time,
        e.local AS location,
        e.organizador AS org,
        e.situacao AS status,
        e.cor AS color,
        e.descricao AS description,
        e.formato AS format,
        e.inscricao AS registration,
        e.premio AS prize,
        e.etiquetas_json AS tagsJson,
        e.tipo_participacao AS participationType,
        e.demonstracao,
        e.criado_em AS criadoEm,
        CASE WHEN e.proprietario_id = ? AND e.demonstracao = 0 THEN 1 ELSE 0 END AS owned,
        (
          SELECT ie.status
          FROM interesses_eventos ie
          WHERE ie.evento_id = e.id AND ie.usuario_id = ?
        ) AS interesseStatus,
        (
          SELECT COUNT(*)
          FROM interesses_eventos ie
          WHERE ie.evento_id = e.id
            AND e.demonstracao = 0
            AND ie.status IN ('interessado', 'inscrito', 'confirmado')
        ) AS totalInteressados
      FROM eventos e
      WHERE e.id = ?
      `
    )
    .get(usuarioId, usuarioId, id) as
    | (Omit<EventoContaPersistido, "tags" | "demonstracao" | "owned"> & {
        tagsJson: string;
        demonstracao: number;
        owned: number;
        interesseStatus: StatusInteresseEvento | null;
        totalInteressados: number;
      })
    | undefined;
  if (!linha) return undefined;
  const { tagsJson, demonstracao, owned, totalInteressados, ...evento } = linha;
  return {
    ...evento,
    tags: JSON.parse(tagsJson) as string[],
    demonstracao: Boolean(demonstracao),
    owned: Boolean(owned),
    totalInteressados: Number(totalInteressados),
    interessados: owned ? listarInteressesEventoCypher(evento.id) : [],
  };
}

export function listarInteressesEventoCypher(
  eventoId: string
): InteresseEventoPersistido[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT
        ie.id,
        ie.evento_id AS eventoId,
        ie.usuario_id AS usuarioId,
        p.nome AS nome,
        p.identificador AS handle,
        ie.status,
        ie.criado_em AS criadoEm,
        ie.atualizado_em AS atualizadoEm
      FROM interesses_eventos ie
      JOIN perfis p ON p.usuario_id = ie.usuario_id
      WHERE ie.evento_id = ?
        AND ie.status <> 'cancelado'
      ORDER BY
        CASE ie.status
          WHEN 'interessado' THEN 1
          WHEN 'inscrito' THEN 2
          WHEN 'confirmado' THEN 3
          WHEN 'rejeitado' THEN 4
          ELSE 5
        END,
        ie.criado_em ASC,
        ie.id ASC
      `
    )
    .all(eventoId) as InteresseEventoPersistido[];
}

export function demonstrarInteresseEventoCypher(
  eventoId: string,
  usuarioId: string
): StatusInteresseEvento | null {
  const db = bancoAtivo();
  const evento = db
    .prepare(
      `
      SELECT e.id, e.tipo_participacao AS participationType
      FROM eventos e
      JOIN usuarios u ON u.id = ?
      WHERE e.id = ?
        AND e.demonstracao = 0
        AND e.situacao <> 'Encerrado'
        AND u.demonstracao = 0
        AND e.proprietario_id <> ?
      `
    )
    .get(usuarioId, eventoId, usuarioId) as
    { id: string; participationType: "aberta" | "aprovacao" } | undefined;
  if (!evento) return null;

  db.prepare(
    `
    INSERT INTO interesses_eventos (id, evento_id, usuario_id, status)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(evento_id, usuario_id) DO UPDATE SET
      status = excluded.status,
      atualizado_em = CURRENT_TIMESTAMP
    `
  ).run(
    randomUUID(),
    eventoId,
    usuarioId,
    evento.participationType === "aprovacao" ? "inscrito" : "interessado"
  );
  return evento.participationType === "aprovacao" ? "inscrito" : "interessado";
}

export function cancelarInteresseEventoCypher(
  eventoId: string,
  usuarioId: string
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE interesses_eventos
      SET status = 'cancelado', atualizado_em = CURRENT_TIMESTAMP
      WHERE evento_id = ? AND usuario_id = ? AND status <> 'cancelado'
      `
    )
    .run(eventoId, usuarioId);
  return resultado.changes > 0;
}

export function atualizarStatusInteresseEventoCypher(
  eventoId: string,
  organizadorId: string,
  usuarioInteressadoId: string,
  status: Extract<
    StatusInteresseEvento,
    "interessado" | "inscrito" | "confirmado" | "rejeitado"
  >
): boolean {
  const db = bancoAtivo();
  const atual = db
    .prepare(
      `
      SELECT ie.status
      FROM interesses_eventos ie
      JOIN eventos e ON e.id = ie.evento_id
      WHERE ie.evento_id = ?
        AND ie.usuario_id = ?
        AND e.proprietario_id = ?
        AND e.demonstracao = 0
        AND e.situacao <> 'Encerrado'
      `
    )
    .get(eventoId, usuarioInteressadoId, organizadorId) as
    { status: StatusInteresseEvento } | undefined;
  if (!atual || atual.status === "cancelado") return false;

  const transicoes: Record<
    Exclude<StatusInteresseEvento, "cancelado">,
    readonly StatusInteresseEvento[]
  > = {
    interessado: ["interessado", "inscrito", "rejeitado"],
    inscrito: ["interessado", "inscrito", "confirmado", "rejeitado"],
    confirmado: ["confirmado"],
    rejeitado: ["interessado", "rejeitado"],
  };
  if (!transicoes[atual.status].includes(status)) return false;

  const resultado = db
    .prepare(
      `
      UPDATE interesses_eventos
      SET status = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE evento_id = ?
        AND usuario_id = ?
        AND status <> 'cancelado'
        AND EXISTS (
          SELECT 1 FROM eventos e
          WHERE e.id = interesses_eventos.evento_id
            AND e.proprietario_id = ?
            AND e.demonstracao = 0
            AND e.situacao <> 'Encerrado'
        )
      `
    )
    .run(status, eventoId, usuarioInteressadoId, organizadorId);
  return resultado.changes > 0;
}

export function criarEventoCypher(
  proprietarioId: string,
  dados: DadosEventoCypher
): string {
  const id = randomUUID();
  bancoAtivo()
    .prepare(
      `
      INSERT INTO eventos (
        id, proprietario_id, titulo, categoria, data_texto, horario, local,
        organizador, situacao, cor, descricao, formato, inscricao, premio,
        etiquetas_json, tipo_participacao, demonstracao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `
    )
    .run(
      id,
      proprietarioId,
      dados.title,
      dados.category,
      dados.date,
      dados.time,
      dados.location,
      dados.org,
      dados.status,
      dados.color,
      dados.description,
      dados.format,
      dados.registration,
      dados.prize,
      JSON.stringify(dados.tags),
      dados.participationType
    );
  return id;
}

export function atualizarEventoCypher(
  id: string,
  proprietarioId: string,
  dados: DadosEventoCypher
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE eventos
      SET titulo = ?, categoria = ?, data_texto = ?, horario = ?, local = ?,
          organizador = ?, situacao = ?, cor = ?, descricao = ?, formato = ?,
          inscricao = ?, premio = ?, etiquetas_json = ?, tipo_participacao = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ? AND proprietario_id = ? AND demonstracao = 0
      `
    )
    .run(
      dados.title,
      dados.category,
      dados.date,
      dados.time,
      dados.location,
      dados.org,
      dados.status,
      dados.color,
      dados.description,
      dados.format,
      dados.registration,
      dados.prize,
      JSON.stringify(dados.tags),
      dados.participationType,
      id,
      proprietarioId
    );
  return resultado.changes > 0;
}

export function excluirEventoCypher(
  id: string,
  proprietarioId: string
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      "DELETE FROM eventos WHERE id = ? AND proprietario_id = ? AND demonstracao = 0"
    )
    .run(id, proprietarioId);
  return resultado.changes > 0;
}

export function listarBeatsCypher(usuarioId?: string): BeatContaPersistido[] {
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        b.id,
        b.produtor_id AS produtorId,
        b.titulo AS title,
        p.nome AS producer,
        b.bpm AS bpm,
        b.tom_musical AS key,
        b.genero AS genre,
        b.licenca AS license,
        b.duracao AS duration,
        b.cor AS color,
        b.descricao AS description,
        b.condicoes_uso AS usage,
        b.venda_exclusiva AS vendaExclusiva,
        b.demonstracao AS demonstracao,
        (b.demonstracao = 0 AND b.produtor_id = ?) AS owned,
        b.criado_em AS criadoEm
      FROM beats b
      JOIN perfis p ON p.usuario_id = b.produtor_id
      WHERE b.demonstracao IN (0, 1)
      ORDER BY b.demonstracao DESC, datetime(b.criado_em) DESC, b.ordem_demo
      `
    )
    .all(usuarioId ?? "") as Array<
    BeatPersistido & { demonstracao: number; owned: number; criadoEm: string }
  >;

  return linhas.map(linha => ({
    ...linha,
    vendaExclusiva: Boolean(linha.vendaExclusiva),
    demonstracao: Boolean(linha.demonstracao),
    owned: Boolean(linha.owned),
    ofertas: ofertasDoBeat(linha.id),
  }));
}

export function criarBeatCypher(
  produtorId: string,
  dados: DadosBeatCypher
): string {
  const id = randomUUID();
  const db = bancoAtivo();
  db.transaction(() => {
    db.prepare(
      `
      INSERT INTO beats (
        id, produtor_id, titulo, bpm, tom_musical, genero, licenca,
        duracao, cor, descricao, condicoes_uso, demonstracao, venda_exclusiva
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'yellow', ?, ?, 0, ?)
      `
    ).run(
      id,
      produtorId,
      dados.title,
      dados.bpm,
      dados.key,
      dados.genre,
      dados.license,
      dados.duration,
      dados.description,
      dados.usage,
      dados.vendaExclusiva ? 1 : 0
    );
    substituirOfertasBeat(db, id, dados.ofertas, dados.vendaExclusiva);
  })();
  return id;
}

export function obterBeatCypher(
  id: string,
  produtorId: string
): BeatContaPersistido | undefined {
  const linha = bancoAtivo()
    .prepare(
      `
      SELECT
        b.id,
        b.produtor_id AS produtorId,
        b.titulo AS title,
        p.nome AS producer,
        b.bpm AS bpm,
        b.tom_musical AS key,
        b.genero AS genre,
        b.licenca AS license,
        b.duracao AS duration,
        b.cor AS color,
        b.descricao AS description,
        b.condicoes_uso AS usage,
        b.venda_exclusiva AS vendaExclusiva,
        b.demonstracao AS demonstracao,
        1 AS owned,
        b.criado_em AS criadoEm
      FROM beats b
      JOIN perfis p ON p.usuario_id = b.produtor_id
      WHERE b.id = ? AND b.produtor_id = ? AND b.demonstracao = 0
      `
    )
    .get(id, produtorId) as
    | (BeatPersistido & {
        demonstracao: number;
        owned: number;
        criadoEm: string;
      })
    | undefined;
  if (!linha) return undefined;
  return {
    ...linha,
    vendaExclusiva: Boolean(linha.vendaExclusiva),
    demonstracao: false,
    owned: true,
    ofertas: ofertasDoBeat(id),
  };
}

export function atualizarBeatCypher(
  id: string,
  produtorId: string,
  dados: DadosBeatCypher
): boolean {
  const db = bancoAtivo();
  const resultado = db.transaction(() => {
    const atualizacao = db
      .prepare(
        `
        UPDATE beats
        SET titulo = ?, bpm = ?, tom_musical = ?, genero = ?, licenca = ?,
            duracao = ?, descricao = ?, condicoes_uso = ?,
            venda_exclusiva = ?, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ? AND produtor_id = ? AND demonstracao = 0
        `
      )
      .run(
        dados.title,
        dados.bpm,
        dados.key,
        dados.genre,
        dados.license,
        dados.duration,
        dados.description,
        dados.usage,
        dados.vendaExclusiva ? 1 : 0,
        id,
        produtorId
      );
    if (atualizacao.changes > 0) {
      substituirOfertasBeat(db, id, dados.ofertas, dados.vendaExclusiva);
    }
    return atualizacao;
  })();
  return resultado.changes > 0;
}

export function excluirBeatCypher(id: string, produtorId: string): boolean {
  const resultado = bancoAtivo()
    .prepare(
      "DELETE FROM beats WHERE id = ? AND produtor_id = ? AND demonstracao = 0"
    )
    .run(id, produtorId);
  return resultado.changes > 0;
}

export function listarObrasDemo(): ObraPersistida[] {
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        id,
        titulo AS title,
        tipo AS type,
        situacao AS status,
        metadados AS meta,
        funcao_principal AS role,
        quantidade_creditos AS credits,
        descricao AS description,
        bpm,
        isrc,
        iswc,
        publicada AS published
      FROM obras
      WHERE demonstracao = 1
      ORDER BY ordem_demo
    `
    )
    .all() as Array<Omit<ObraPersistida, "published"> & { published: number }>;

  return linhas.map(obra => ({
    ...obra,
    published: Boolean(obra.published),
  }));
}

export function estatisticasObrasDemo(): {
  publicadasComoArtista: number;
  participacoesComoFeat: number;
  emAndamento: number;
} {
  const resultado = bancoAtivo()
    .prepare(
      `
      SELECT
        COALESCE(SUM(CASE WHEN publicada = 1 AND funcao_principal = 'Artista principal' THEN 1 ELSE 0 END), 0) AS publicadasComoArtista,
        COALESCE(SUM(CASE WHEN publicada = 1 AND funcao_principal = 'Participação como feat' THEN 1 ELSE 0 END), 0) AS participacoesComoFeat,
        COALESCE(SUM(CASE WHEN situacao = 'Em produção' THEN 1 ELSE 0 END), 0) AS emAndamento
      FROM obras
      WHERE demonstracao = 1
    `
    )
    .get() as {
    publicadasComoArtista: number;
    participacoesComoFeat: number;
    emAndamento: number;
  };

  return resultado;
}

function salvarAtuacoesCategoria(
  db: BancoCypher,
  usuarioId: string,
  categoriasAtivas: readonly string[],
  atuacoes: readonly AtuacaoProfissionalPersistida[]
): void {
  const permitidas = new Set(categoriasAtivas);
  const existentes = db
    .prepare(
      "SELECT categoria FROM respostas_atuacao_categoria WHERE usuario_id = ?"
    )
    .all(usuarioId) as Array<{ categoria: string }>;
  const remover = db.prepare(
    "DELETE FROM respostas_atuacao_categoria WHERE usuario_id = ? AND categoria = ?"
  );
  for (const item of existentes) {
    if (!permitidas.has(item.categoria)) remover.run(usuarioId, item.categoria);
  }
  const salvar = db.prepare(`
    INSERT INTO respostas_atuacao_categoria (
      usuario_id, categoria, respostas_json, visibilidades_json,
      versao_questionario, atualizado_em
    ) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(usuario_id, categoria) DO UPDATE SET
      respostas_json = excluded.respostas_json,
      visibilidades_json = excluded.visibilidades_json,
      versao_questionario = excluded.versao_questionario,
      atualizado_em = CURRENT_TIMESTAMP
  `);
  for (const atuacao of atuacoes) {
    if (!permitidas.has(atuacao.categoria)) {
      throw new Error("ATUACAO_NAO_SELECIONADA");
    }
    const visibilidades = Object.fromEntries(
      Object.entries(atuacao.visibilidades).filter(([, valor]) =>
        ["publico", "colaboradores", "privado"].includes(valor)
      )
    );
    salvar.run(
      usuarioId,
      atuacao.categoria,
      JSON.stringify(atuacao.respostas),
      JSON.stringify(visibilidades)
    );
  }
}

export function criarContaCypher(conta: DadosNovaConta): void {
  const db = bancoAtivo();
  const salvar = db.transaction(() => {
    const sequencia = db
      .prepare(
        "SELECT proximo_numero AS numero FROM sequencias WHERE nome = 'usuarios_reais'"
      )
      .get() as { numero: number } | undefined;
    if (!sequencia) throw new Error("SEQUENCIA_USUARIOS_NAO_INICIALIZADA");
    db.prepare(
      "UPDATE sequencias SET proximo_numero = proximo_numero + 1 WHERE nome = 'usuarios_reais'"
    ).run();
    const codigoPublico = codigoPublicoReal(conta.iniciais, sequencia.numero);

    db.prepare(
      `
      INSERT INTO usuarios (
        id, email, senha_hash, tipo_conta, demonstracao, codigo_publico,
        numero_sequencial
      ) VALUES (
        @id, @email, @senhaHash, @tipoConta, 0, @codigoPublico,
        @numeroSequencial
      )
    `
    ).run({
      id: conta.id,
      email: conta.email,
      senhaHash: conta.senhaHash,
      tipoConta: conta.tipoConta,
      codigoPublico,
      numeroSequencial: sequencia.numero,
    });

    db.prepare(
      `
      INSERT INTO perfis (
        usuario_id, c_tag, nome, funcao, identificador, iniciais,
        categorias_json, outra_categoria, generos_json,
        ultima_alteracao_categorias_em, perfil_publico,
        localizacao_publica, contato_publico, demonstracao
      ) VALUES (
        @id, @cTag, @nome, @funcao, @identificador, @iniciais,
        @categoriasJson, '', '[]', CURRENT_TIMESTAMP, 0, 0, 0, 0
      )
    `
    ).run({
      id: conta.id,
      cTag: conta.cTag,
      nome: conta.nome,
      funcao: conta.funcao,
      identificador: conta.identificador,
      iniciais: conta.iniciais,
      categoriasJson: JSON.stringify(conta.categorias),
    });
    if (conta.atuacoes) {
      salvarAtuacoesCategoria(db, conta.id, conta.categorias, conta.atuacoes);
    }
    if (conta.categorias.includes("Outros") && conta.outraCategoria) {
      inserirPropostaCategoria(db, conta.id, conta.outraCategoria);
    }
  });

  salvar();
}

export function buscarCredenciaisCypher(
  email: string
): CredenciaisUsuario | undefined {
  return bancoAtivo()
    .prepare(
      `
      SELECT id, email, senha_hash AS senhaHash
      FROM usuarios
      WHERE email = ? COLLATE NOCASE AND demonstracao = 0
    `
    )
    .get(email) as CredenciaisUsuario | undefined;
}

export function criarSessaoCypher(
  usuarioId: string,
  tokenHash: string,
  expiraEm: number,
  agora: number
): void {
  const db = bancoAtivo();
  const criar = db.transaction(() => {
    db.prepare("DELETE FROM sessoes WHERE expira_em <= ?").run(agora);
    db.prepare(
      `
      INSERT INTO sessoes (token_hash, usuario_id, expira_em, criada_em)
      VALUES (?, ?, ?, ?)
    `
    ).run(tokenHash, usuarioId, expiraEm, agora);
  });
  criar();
}

export function obterUsuarioDaSessaoCypher(
  tokenHash: string,
  agora: number
): UsuarioDaSessao | undefined {
  const db = bancoAtivo();
  const sessao = db
    .prepare("SELECT usuario_id, expira_em FROM sessoes WHERE token_hash = ?")
    .get(tokenHash) as { usuario_id: string; expira_em: number } | undefined;

  if (!sessao) return undefined;
  if (sessao.expira_em <= agora) {
    db.prepare("DELETE FROM sessoes WHERE token_hash = ?").run(tokenHash);
    return undefined;
  }

  const perfil = db
    .prepare(
      `
      SELECT
        u.id,
        u.email,
        u.codigo_publico AS publicCode,
        u.tipo_conta AS tipoConta,
        u.demonstracao AS demonstracao,
        p.nome AS name,
        p.funcao AS role,
        p.cidade AS city,
        p.identificador AS handle,
        p.iniciais AS initials,
        p.c_tag AS cTag,
        p.reputacao AS reputation,
        p.generos_json AS genresJson,
        p.categorias_json AS categoriesJson,
        p.outra_categoria AS otherCategory,
        p.biografia AS biography,
        p.contato AS contact,
        p.disponibilidade AS availability,
        p.equipamentos_json AS equipmentJson,
        p.perfil_publico AS profilePublic,
        p.localizacao_publica AS locationPublic,
        p.contato_publico AS contactPublic,
        p.criado_em AS createdAt
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.id = ?
    `
    )
    .get(sessao.usuario_id) as
    | (Omit<
        UsuarioDaSessao,
        | "demonstracao"
        | "genres"
        | "categories"
        | "equipment"
        | "profilePublic"
        | "locationPublic"
        | "contactPublic"
      > & {
        demonstracao: number;
        genresJson: string;
        categoriesJson: string;
        equipmentJson: string;
        profilePublic: number;
        locationPublic: number;
        contactPublic: number;
      })
    | undefined;

  if (!perfil) {
    db.prepare("DELETE FROM sessoes WHERE token_hash = ?").run(tokenHash);
    return undefined;
  }

  return {
    ...perfil,
    demonstracao: Boolean(perfil.demonstracao),
    genres: JSON.parse(perfil.genresJson) as string[],
    categories: JSON.parse(perfil.categoriesJson) as string[],
    equipment: JSON.parse(perfil.equipmentJson) as string[],
    profilePublic: Boolean(perfil.profilePublic),
    locationPublic: Boolean(perfil.locationPublic),
    contactPublic: Boolean(perfil.contactPublic),
  };
}

export function atualizarPerfilCypher(dados: DadosAtualizacaoPerfil): boolean {
  const db = bancoAtivo();
  const salvar = db.transaction(() => {
    const atual = db
      .prepare(
        `SELECT categorias_json AS categoriasJson,
                ultima_alteracao_categorias_em AS alteradaEm
         FROM perfis WHERE usuario_id = ? AND demonstracao = 0`
      )
      .get(dados.id) as
      { categoriasJson: string; alteradaEm: string | null } | undefined;
    if (!atual) return false;
    const antes = JSON.parse(atual.categoriasJson) as string[];
    const categoriasPermitidas = new Set(listarCategoriasProfissionaisCypher());
    if (antes.includes(categoriaLegadaRapperMC)) {
      categoriasPermitidas.add(categoriaLegadaRapperMC);
    }
    if (
      dados.categories.length === 0 ||
      new Set(dados.categories).size !== dados.categories.length ||
      dados.categories.some(categoria => !categoriasPermitidas.has(categoria))
    ) {
      throw new Error("CATEGORIA_PROFISSIONAL_INVALIDA");
    }
    const ordenarCategorias = (lista: string[]) => [...new Set(lista)].sort();
    const antesJson = JSON.stringify(ordenarCategorias(antes));
    const depoisJson = JSON.stringify(ordenarCategorias(dados.categories));
    const categoriasMudaram = antesJson !== depoisJson;
    let excecao:
      { id: string; administradorId: string; motivo: string } | undefined;
    let proximaAlteracao: string | null = null;

    if (categoriasMudaram) {
      const possuiAlteracaoAnterior = Boolean(
        (
          db
            .prepare(
              "SELECT EXISTS (SELECT 1 FROM auditoria_categorias WHERE usuario_id = ?) AS alterou"
            )
            .get(dados.id) as { alterou: number }
        ).alterou
      );
      if (possuiAlteracaoAnterior && atual.alteradaEm) {
        const prazo = db
          .prepare(
            "SELECT datetime(?, '+60 days') AS proxima, datetime(?, '+60 days') > datetime('now') AS bloqueada"
          )
          .get(atual.alteradaEm, atual.alteradaEm) as {
          proxima: string | null;
          bloqueada: number;
        };
        proximaAlteracao = prazo.proxima;
        if (prazo.bloqueada) {
          excecao = db
            .prepare(
              `SELECT id, administrador_id AS administradorId, motivo
               FROM excecoes_categorias
               WHERE usuario_id = ? AND usada_em IS NULL
               ORDER BY criada_em, id LIMIT 1`
            )
            .get(dados.id) as
            { id: string; administradorId: string; motivo: string } | undefined;
          if (!excecao) {
            throw new Error(`CATEGORIAS_BLOQUEADAS:${proximaAlteracao ?? ""}`);
          }
          const consumida = db
            .prepare(
              "UPDATE excecoes_categorias SET usada_em = CURRENT_TIMESTAMP WHERE id = ? AND usada_em IS NULL"
            )
            .run(excecao.id);
          if (consumida.changes !== 1) {
            throw new Error(`CATEGORIAS_BLOQUEADAS:${proximaAlteracao ?? ""}`);
          }
        }
      }
      db.prepare(
        `INSERT INTO auditoria_categorias (
           id, usuario_id, administrador_id, excecao_id,
           categorias_antes_json, categorias_depois_json, motivo
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        dados.id,
        excecao?.administradorId ?? null,
        excecao?.id ?? null,
        antesJson,
        depoisJson,
        excecao?.motivo ?? ""
      );
    }

    const atualizado = db
      .prepare(
        `
        UPDATE perfis SET
          nome = @name,
          funcao = @role,
          cidade = @city,
          biografia = @biography,
          contato = @contact,
          disponibilidade = @availability,
          generos_json = @genresJson,
          categorias_json = @categoriesJson,
          ultima_alteracao_categorias_em = CASE
            WHEN @categoriasMudaram = 1 THEN CURRENT_TIMESTAMP
            ELSE ultima_alteracao_categorias_em
          END,
          outra_categoria = @otherCategory,
          equipamentos_json = @equipmentJson,
          iniciais = @initials,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE usuario_id = @id AND demonstracao = 0
      `
      )
      .run({
        id: dados.id,
        name: dados.name,
        role: dados.role,
        city: dados.city,
        biography: dados.biography,
        contact: dados.contact,
        availability: dados.availability,
        genresJson: JSON.stringify(dados.genres),
        categoriesJson: depoisJson,
        categoriasMudaram: Number(categoriasMudaram),
        otherCategory: dados.otherCategory,
        equipmentJson: JSON.stringify(dados.equipment),
        initials: dados.initials,
      });
    if (atualizado.changes !== 1) return false;

    db.prepare(
      `
      UPDATE usuarios SET tipo_conta = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ? AND demonstracao = 0
    `
    ).run(dados.tipoConta, dados.id);
    const propostaGenero = dados.propostaGenero?.trim();
    if (dados.atuacoes) {
      salvarAtuacoesCategoria(db, dados.id, dados.categories, dados.atuacoes);
    }
    if (propostaGenero) {
      db.prepare(
        `INSERT INTO propostas_generos (id, usuario_id, genero)
         VALUES (?, ?, ?) ON CONFLICT DO NOTHING`
      ).run(randomUUID(), dados.id, propostaGenero);
    }
    return true;
  });
  return salvar();
}

export function atualizarPrivacidadeCypher(
  id: string,
  preferencias: {
    profilePublic: boolean;
    locationPublic: boolean;
    contactPublic: boolean;
  }
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE perfis SET
        perfil_publico = ?,
        localizacao_publica = ?,
        contato_publico = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE usuario_id = ? AND demonstracao = 0
    `
    )
    .run(
      Number(preferencias.profilePublic),
      Number(preferencias.locationPublic),
      Number(preferencias.contactPublic),
      id
    );
  return resultado.changes === 1;
}

export function estadoAlteracaoCategoriasCypher(
  usuarioId: string
): EstadoAlteracaoCategorias {
  const linha = bancoAtivo()
    .prepare(
      `
      SELECT
        CASE WHEN EXISTS (
               SELECT 1 FROM auditoria_categorias a
               WHERE a.usuario_id = p.usuario_id
             )
             THEN datetime(p.ultima_alteracao_categorias_em, '+60 days')
             ELSE NULL END AS proximaAlteracao,
        CASE WHEN EXISTS (
               SELECT 1 FROM auditoria_categorias a
               WHERE a.usuario_id = p.usuario_id
             )
              AND p.ultima_alteracao_categorias_em IS NOT NULL
              AND datetime(p.ultima_alteracao_categorias_em, '+60 days') > datetime('now')
             THEN 1 ELSE 0 END AS dentroDoPrazo,
        EXISTS (SELECT 1 FROM excecoes_categorias e
                WHERE e.usuario_id = p.usuario_id AND e.usada_em IS NULL) AS excecaoDisponivel
      FROM perfis p WHERE p.usuario_id = ? AND p.demonstracao = 0
      `
    )
    .get(usuarioId) as
    | {
        proximaAlteracao: string | null;
        dentroDoPrazo: number;
        excecaoDisponivel: number;
      }
    | undefined;
  const excecaoDisponivel = Boolean(linha?.excecaoDisponivel);
  return {
    bloqueada: Boolean(linha?.dentroDoPrazo) && !excecaoDisponivel,
    proximaAlteracao: linha?.proximaAlteracao ?? null,
    excecaoDisponivel,
  };
}

export function listarPropostasGenerosPendentesCypher(): PropostaGeneroPersistida[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT g.id, g.usuario_id AS usuarioId, p.nome, p.identificador AS handle,
             g.genero, g.criada_em AS criadaEm
      FROM propostas_generos g
      JOIN perfis p ON p.usuario_id = g.usuario_id
      JOIN usuarios u ON u.id = g.usuario_id
      WHERE g.status = 'pendente' AND u.demonstracao = 0
      ORDER BY datetime(g.criada_em), g.id
      `
    )
    .all() as PropostaGeneroPersistida[];
}

export function listarPerfisParaExcecaoCategoriaCypher(
  consulta = "",
  limite?: number
): PerfilParaExcecaoCategoria[] {
  const db = bancoAtivo();
  const termo = consulta.trim();
  const filtro = termo
    ? "AND (lower(p.nome) LIKE lower(?) OR lower(u.email) LIKE lower(?) OR lower(p.categorias_json) LIKE lower(?))"
    : "";
  const parametros: Array<string | number> = termo
    ? [`%${termo}%`, `%${termo}%`, `%${termo}%`]
    : [];
  const limiteSql =
    limite === undefined
      ? ""
      : (parametros.push(Math.max(0, limite)), "LIMIT ?");
  return db
    .prepare(
      `
      SELECT u.id AS usuarioId, p.nome, u.email,
             p.categorias_json AS categoriasJson,
             p.ultima_alteracao_categorias_em AS alteradaEm,
             datetime(p.ultima_alteracao_categorias_em, '+60 days') AS proximaAlteracao,
             EXISTS (SELECT 1 FROM excecoes_categorias e
                     WHERE e.usuario_id = u.id AND e.usada_em IS NULL) AS excecaoPendente,
             EXISTS (SELECT 1 FROM solicitacoes_excecao_categorias s
                     WHERE s.usuario_id = u.id AND s.status = 'pendente') AS solicitacaoPendente
      FROM usuarios u JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 0 ${filtro}
      ORDER BY p.nome COLLATE NOCASE
      ${limiteSql}
      `
    )
    .all(...parametros)
    .map(linha => {
      const perfil = linha as Omit<
        PerfilParaExcecaoCategoria,
        "excecaoPendente" | "solicitacaoPendente"
      > & {
        excecaoPendente: number;
        solicitacaoPendente: number;
      };
      return {
        ...perfil,
        excecaoPendente: Boolean(perfil.excecaoPendente),
        solicitacaoPendente: Boolean(perfil.solicitacaoPendente),
      };
    });
}

export function obterEstadoSolicitacaoExcecaoCategoriaCypher(
  usuarioId: string
): EstadoSolicitacaoExcecaoCategoria | null {
  const db = bancoAtivo();
  const linha = db
    .prepare(
      `SELECT id, status, motivo, motivo_codigo AS motivoCodigo,
              motivo_revisao AS motivoRevisao,
              categorias_antes_json AS categoriasAntesJson,
              categorias_solicitadas_json AS categoriasSolicitadasJson,
              respostas_solicitadas_json AS respostasSolicitadasJson,
              visibilidades_solicitadas_json AS visibilidadesSolicitadasJson,
              criada_em AS criadaEm
       FROM solicitacoes_excecao_categorias
       WHERE usuario_id = ? ORDER BY rowid DESC LIMIT 1`
    )
    .get(usuarioId) as
    | (Omit<
        EstadoSolicitacaoExcecaoCategoria,
        | "categoriasAntes"
        | "categoriasSolicitadas"
        | "respostasSolicitadas"
        | "visibilidadesSolicitadas"
        | "historico"
      > & {
        categoriasAntesJson: string;
        categoriasSolicitadasJson: string;
        respostasSolicitadasJson: string;
        visibilidadesSolicitadasJson: string;
      })
    | undefined;
  if (!linha) return null;
  return {
    id: linha.id,
    status: linha.status,
    motivo: linha.motivo,
    motivoCodigo: linha.motivoCodigo,
    motivoRevisao: linha.motivoRevisao,
    categoriasAntes: jsonLista(linha.categoriasAntesJson),
    categoriasSolicitadas: jsonLista(linha.categoriasSolicitadasJson),
    respostasSolicitadas: jsonObjeto(linha.respostasSolicitadasJson),
    visibilidadesSolicitadas: jsonObjeto(linha.visibilidadesSolicitadasJson),
    historico: historicoSolicitacao(db, linha.id),
    criadaEm: linha.criadaEm,
  };
}

export function listarSolicitacoesExcecaoCategoriaPendentesCypher(
  visitanteId?: string
): SolicitacaoExcecaoCategoriaPersistida[] {
  const db = bancoAtivo();
  const linhas = db
    .prepare(
      `SELECT s.id, s.usuario_id AS usuarioId, p.nome, u.email,
              p.identificador AS handle, s.motivo,
              s.categorias_antes_json AS categoriasAntesJson,
              s.categorias_solicitadas_json AS categoriasSolicitadasJson,
              s.respostas_solicitadas_json AS respostasSolicitadasJson,
              s.visibilidades_solicitadas_json AS visibilidadesSolicitadasJson,
              s.motivo_codigo AS motivoCodigo, s.criada_em AS criadaEm
       FROM solicitacoes_excecao_categorias s
       JOIN usuarios u ON u.id = s.usuario_id
       JOIN perfis p ON p.usuario_id = u.id
       WHERE s.status = 'pendente' AND u.demonstracao = 0
       ORDER BY datetime(s.criada_em), s.id`
    )
    .all() as Array<
    Omit<
      SolicitacaoExcecaoCategoriaPersistida,
      | "categoriasAntes"
      | "categoriasSolicitadas"
      | "respostasSolicitadas"
      | "visibilidadesSolicitadas"
      | "historico"
    > & {
      categoriasAntesJson: string;
      categoriasSolicitadasJson: string;
      respostasSolicitadasJson: string;
      visibilidadesSolicitadasJson: string;
      motivoCodigo: string;
    }
  >;
  return linhas.map(linha => {
    const respostas = jsonObjeto<Record<string, RespostasAtuacao>>(
      linha.respostasSolicitadasJson
    );
    const visibilidades = jsonObjeto<
      Record<string, VisibilidadesAtuacao>
    >(linha.visibilidadesSolicitadasJson);
    const colaborador = Boolean(
      visitanteId && ehColaboradorDaConta(db, linha.usuarioId, visitanteId)
    );
    const respostasVisiveis = Object.fromEntries(
      Object.entries(respostas).map(([categoria, dados]) => {
        const visibilidade = visibilidades[categoria] ?? {};
        const podeVerCategoria =
          (visibilidade[chaveVisibilidadeCategoria] ?? "publico") === "publico" ||
          (visibilidade[chaveVisibilidadeCategoria] === "colaboradores" && colaborador);
        if (!podeVerCategoria) return [categoria, {}];
        return [
          categoria,
          Object.fromEntries(
            Object.entries(dados).filter(([campo]) => {
              const nivel = visibilidade[campo] ?? "privado";
              return nivel === "publico" || (nivel === "colaboradores" && colaborador);
            })
          ),
        ];
      })
    );
    return {
      ...linha,
      categoriasAntes: jsonLista(linha.categoriasAntesJson),
      categoriasSolicitadas: jsonLista(linha.categoriasSolicitadasJson),
      respostasSolicitadas: respostasVisiveis,
      visibilidadesSolicitadas: visibilidades,
      historico: historicoSolicitacao(db, linha.id),
    };
  });
}

export function solicitarExcecaoCategoriaCypher(
  usuarioId: string,
  motivo: string,
  detalhes?: {
    motivoCodigo: string;
    categoriasSolicitadas: string[];
    respostasSolicitadas: Record<string, RespostasAtuacao>;
    visibilidadesSolicitadas: Record<string, VisibilidadesAtuacao>;
  }
):
  | "criada"
  | "ja_pendente"
  | "nao_bloqueada"
  | "excecao_disponivel"
  | "categorias_iguais"
  | "snapshot_invalido"
  | "nao_encontrada" {
  const db = bancoAtivo();
  const executar = db.transaction(() => {
    const perfil = db
      .prepare(
        `SELECT ultima_alteracao_categorias_em AS alteradaEm,
                categorias_json AS categoriasJson
         FROM perfis WHERE usuario_id = ? AND demonstracao = 0`
      )
      .get(usuarioId) as
      | { alteradaEm: string | null; categoriasJson: string }
      | undefined;
    if (!perfil) return "nao_encontrada" as const;

    const pendente = db
      .prepare(
        `SELECT 1 FROM solicitacoes_excecao_categorias
         WHERE usuario_id = ? AND status = 'pendente' LIMIT 1`
      )
      .get(usuarioId);
    if (pendente) return "ja_pendente" as const;

    const excecao = db
      .prepare(
        `SELECT 1 FROM excecoes_categorias
         WHERE usuario_id = ? AND usada_em IS NULL LIMIT 1`
      )
      .get(usuarioId);
    if (excecao) return "excecao_disponivel" as const;
    const possuiAlteracaoAnterior = Boolean(
      (
        db
          .prepare(
            "SELECT EXISTS (SELECT 1 FROM auditoria_categorias WHERE usuario_id = ?) AS alterou"
          )
          .get(usuarioId) as { alterou: number }
      ).alterou
    );
    if (!possuiAlteracaoAnterior || !perfil.alteradaEm)
      return "nao_bloqueada" as const;

    const prazo = db
      .prepare("SELECT datetime(?, '+60 days') > datetime('now') AS bloqueada")
      .get(perfil.alteradaEm) as { bloqueada: number };
    if (!prazo.bloqueada) return "nao_bloqueada" as const;

    const categoriasAntes = jsonLista(perfil.categoriasJson);
    const categoriasSolicitadas = detalhes?.categoriasSolicitadas ?? [];
    if (
      detalhes &&
      categoriasAntes.slice().sort().join("\u0000") ===
        categoriasSolicitadas.slice().sort().join("\u0000")
    ) {
      return "categorias_iguais" as const;
    }
    if (detalhes) {
      const permitidas = new Set(listarCategoriasProfissionaisCypher());
      if (categoriasAntes.includes(categoriaLegadaRapperMC)) {
        permitidas.add(categoriaLegadaRapperMC);
      }
      const respostas = detalhes.respostasSolicitadas;
      const visibilidades = detalhes.visibilidadesSolicitadas;
      const niveisVisibilidade = new Set(["publico", "colaboradores", "privado"]);
      if (
        categoriasSolicitadas.length === 0 ||
        new Set(categoriasSolicitadas).size !== categoriasSolicitadas.length ||
        categoriasSolicitadas.some(categoria => !permitidas.has(categoria)) ||
        Object.keys(respostas).some(categoria => !categoriasSolicitadas.includes(categoria)) ||
        Object.keys(visibilidades).some(categoria => !categoriasSolicitadas.includes(categoria))
      ) {
        return "snapshot_invalido" as const;
      }
      for (const categoria of categoriasSolicitadas) {
        const resposta = respostas[categoria] ?? {};
        if (
          !validarRespostasAtuacao(
            categoria,
            resposta,
            !categoriasAntes.includes(categoria)
          ).valido
        ) {
          return "snapshot_invalido" as const;
        }
        const perguntas = new Set(
          catalogoPerguntasPorCategoria(categoria).map(pergunta => pergunta.campo)
        );
        const niveis = visibilidades[categoria] ?? {};
        if (
          Object.entries(niveis).some(
            ([campo, nivel]) =>
              (campo !== chaveVisibilidadeCategoria && !perguntas.has(campo)) ||
              !niveisVisibilidade.has(nivel)
          )
        ) {
          return "snapshot_invalido" as const;
        }
      }
    }
    const solicitacaoId = randomUUID();
    const insercao = db
      .prepare(
        `INSERT INTO solicitacoes_excecao_categorias (
           id, usuario_id, motivo, motivo_codigo, categorias_antes_json,
           categorias_solicitadas_json, respostas_solicitadas_json,
           visibilidades_solicitadas_json
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`
      )
      .run(
        solicitacaoId,
        usuarioId,
        motivo,
        detalhes?.motivoCodigo ?? "",
        JSON.stringify(categoriasAntes),
        JSON.stringify(categoriasSolicitadas),
        JSON.stringify(detalhes?.respostasSolicitadas ?? {}),
        JSON.stringify(detalhes?.visibilidadesSolicitadas ?? {})
      );
    if (insercao.changes !== 1) return "ja_pendente" as const;
    db.prepare(
      `INSERT INTO historico_solicitacoes_categorias (
         id, solicitacao_id, autor_id, autor_tipo, mensagem
       ) VALUES (?, ?, ?, 'usuario', ?)`
    ).run(randomUUID(), solicitacaoId, usuarioId, motivo);
    return "criada" as const;
  });
  return executar();
}

export function revisarSolicitacaoExcecaoCategoriaCypher(
  solicitacaoId: string,
  administradorId: string,
  administradorEmail: string,
  aprovada: boolean,
  motivoRevisao: string
):
  | "aprovada"
  | "rejeitada"
  | "nao_pendente"
  | "aguarda_resposta"
  | "conflito"
  | "nao_bloqueada"
  | "nao_encontrada" {
  const db = bancoAtivo();
  const executar = db.transaction(() => {
    const solicitacao = db
      .prepare(
        `SELECT usuario_id AS usuarioId,
                categorias_antes_json AS categoriasAntesJson,
                categorias_solicitadas_json AS categoriasSolicitadasJson,
                respostas_solicitadas_json AS respostasSolicitadasJson,
                visibilidades_solicitadas_json AS visibilidadesSolicitadasJson
         FROM solicitacoes_excecao_categorias
         WHERE id = ? AND status = 'pendente'`
      )
      .get(solicitacaoId) as
      | {
          usuarioId: string;
          categoriasAntesJson: string;
          categoriasSolicitadasJson: string;
          respostasSolicitadasJson: string;
          visibilidadesSolicitadasJson: string;
        }
      | undefined;
    if (!solicitacao) {
      const existe = db
        .prepare("SELECT 1 FROM solicitacoes_excecao_categorias WHERE id = ?")
        .get(solicitacaoId);
      return existe ? ("nao_pendente" as const) : ("nao_encontrada" as const);
    }

    const ultimaMensagem = db
      .prepare(
        `SELECT autor_tipo AS autorTipo FROM historico_solicitacoes_categorias
         WHERE solicitacao_id = ? ORDER BY datetime(criada_em) DESC, id DESC LIMIT 1`
      )
      .get(solicitacaoId) as { autorTipo: string } | undefined;
    if (ultimaMensagem?.autorTipo === "administrador")
      return "aguarda_resposta" as const;

    let excecaoId: string | null = null;
    if (aprovada) {
      const perfil = db
        .prepare(
          `SELECT p.ultima_alteracao_categorias_em AS alteradaEm,
                  p.categorias_json AS categoriasJson
           FROM perfis p JOIN usuarios u ON u.id = p.usuario_id
           WHERE u.id = ? AND u.demonstracao = 0`
        )
        .get(solicitacao.usuarioId) as
        { alteradaEm: string | null; categoriasJson: string } | undefined;
      if (!perfil) return "nao_encontrada" as const;
      const possuiAlteracaoAnterior = Boolean(
        (
          db
            .prepare(
              "SELECT EXISTS (SELECT 1 FROM auditoria_categorias WHERE usuario_id = ?) AS alterou"
            )
            .get(solicitacao.usuarioId) as { alterou: number }
        ).alterou
      );
      if (!possuiAlteracaoAnterior || !perfil.alteradaEm)
        return "nao_bloqueada" as const;
      const prazo = db
        .prepare("SELECT datetime(?, '+60 days') > datetime('now') AS bloqueada")
        .get(perfil.alteradaEm) as { bloqueada: number };
      if (!prazo.bloqueada) return "nao_bloqueada" as const;

      const categoriasAntes = jsonLista(perfil.categoriasJson);
      const categoriasSnapshot = jsonLista(solicitacao.categoriasAntesJson);
      if (
        categoriasAntes.slice().sort().join("\u0000") !==
        categoriasSnapshot.slice().sort().join("\u0000")
      ) {
        return "conflito" as const;
      }
      const categoriasSolicitadas = jsonLista(
        solicitacao.categoriasSolicitadasJson
      );
      const alteracaoDeCategorias = categoriasSolicitadas.length > 0;
      excecaoId = randomUUID();
      db.prepare(
        `INSERT INTO excecoes_categorias (
           id, usuario_id, administrador_id, administrador_email, motivo, usada_em
         ) VALUES (?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)`
      ).run(
        excecaoId,
        solicitacao.usuarioId,
        administradorId,
        administradorEmail,
        motivoRevisao,
        Number(alteracaoDeCategorias)
      );

      if (alteracaoDeCategorias) {
        db.prepare(
          `UPDATE perfis SET categorias_json = ?, funcao = ?,
             ultima_alteracao_categorias_em = CURRENT_TIMESTAMP,
             atualizado_em = CURRENT_TIMESTAMP
           WHERE usuario_id = ? AND demonstracao = 0`
        ).run(
          JSON.stringify(categoriasSolicitadas),
          categoriasSolicitadas.join(", "),
          solicitacao.usuarioId
        );
        const respostas = jsonObjeto<Record<string, RespostasAtuacao>>(
          solicitacao.respostasSolicitadasJson
        );
        const visibilidades = jsonObjeto<
          Record<string, VisibilidadesAtuacao>
        >(solicitacao.visibilidadesSolicitadasJson);
        salvarAtuacoesCategoria(
          db,
          solicitacao.usuarioId,
          categoriasSolicitadas,
          Object.entries(respostas).map(([categoria, resposta]) => ({
            categoria,
            respostas: resposta,
            visibilidades: visibilidades[categoria] ?? {},
          }))
        );
        db.prepare(
          `INSERT INTO auditoria_categorias (
             id, usuario_id, administrador_id, excecao_id,
             categorias_antes_json, categorias_depois_json, motivo
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          randomUUID(),
          solicitacao.usuarioId,
          administradorId,
          excecaoId,
          JSON.stringify(categoriasAntes),
          JSON.stringify(categoriasSolicitadas),
          motivoRevisao
        );
      }
    }

    const status = aprovada ? "aprovado" : "rejeitado";
    const atualizado = db
      .prepare(
        `UPDATE solicitacoes_excecao_categorias
         SET status = ?, revisada_em = CURRENT_TIMESTAMP,
             revisor_id = ?, revisor_email = ?, motivo_revisao = ?, excecao_id = ?
         WHERE id = ? AND status = 'pendente'`
      )
      .run(
        status,
        administradorId,
        administradorEmail,
        motivoRevisao,
        excecaoId,
        solicitacaoId
    );
    if (atualizado.changes !== 1) return "nao_pendente" as const;
    db.prepare(
      `INSERT INTO historico_solicitacoes_categorias (
         id, solicitacao_id, autor_id, autor_tipo, mensagem
       ) VALUES (?, ?, ?, 'administrador', ?)`
    ).run(randomUUID(), solicitacaoId, administradorId, motivoRevisao);
    return aprovada ? ("aprovada" as const) : ("rejeitada" as const);
  });
  return executar();
}

export function solicitarInformacaoSolicitacaoCategoriaCypher(
  solicitacaoId: string,
  administradorId: string,
  mensagem: string
): boolean {
  const db = bancoAtivo();
  const executar = db.transaction(() => {
    const pendente = db
      .prepare(
        `SELECT 1 FROM solicitacoes_excecao_categorias
         WHERE id = ? AND status = 'pendente'`
      )
      .get(solicitacaoId);
    if (!pendente) return false;
    const ultima = db
      .prepare(
        `SELECT autor_tipo AS autorTipo FROM historico_solicitacoes_categorias
         WHERE solicitacao_id = ? ORDER BY datetime(criada_em) DESC, id DESC LIMIT 1`
      )
      .get(solicitacaoId) as { autorTipo: string } | undefined;
    if (ultima?.autorTipo === "administrador") return false;
    db.prepare(
      `INSERT INTO historico_solicitacoes_categorias (
         id, solicitacao_id, autor_id, autor_tipo, mensagem
       ) VALUES (?, ?, ?, 'administrador', ?)`
    ).run(randomUUID(), solicitacaoId, administradorId, mensagem);
    return true;
  });
  return executar();
}

export function responderSolicitacaoCategoriaCypher(
  solicitacaoId: string,
  usuarioId: string,
  mensagem: string
): boolean {
  const db = bancoAtivo();
  const executar = db.transaction(() => {
    const pendente = db
      .prepare(
        `SELECT 1 FROM solicitacoes_excecao_categorias
         WHERE id = ? AND usuario_id = ? AND status = 'pendente'`
      )
      .get(solicitacaoId, usuarioId);
    if (!pendente) return false;
    const ultima = db
      .prepare(
        `SELECT autor_tipo AS autorTipo FROM historico_solicitacoes_categorias
         WHERE solicitacao_id = ? ORDER BY datetime(criada_em) DESC, id DESC LIMIT 1`
      )
      .get(solicitacaoId) as { autorTipo: string } | undefined;
    if (ultima?.autorTipo !== "administrador") return false;
    db.prepare(
      `INSERT INTO historico_solicitacoes_categorias (
         id, solicitacao_id, autor_id, autor_tipo, mensagem
       ) VALUES (?, ?, ?, 'usuario', ?)`
    ).run(randomUUID(), solicitacaoId, usuarioId, mensagem);
    return true;
  });
  return executar();
}

export function contarPerfisParaExcecaoCategoriaCypher(consulta = ""): number {
  const termo = consulta.trim();
  const linha = termo
    ? (bancoAtivo()
        .prepare(
          `SELECT COUNT(*) AS total FROM usuarios u
           JOIN perfis p ON p.usuario_id = u.id
           WHERE u.demonstracao = 0
             AND (lower(p.nome) LIKE lower(?) OR lower(u.email) LIKE lower(?) OR lower(p.categorias_json) LIKE lower(?))`
        )
        .get(`%${termo}%`, `%${termo}%`, `%${termo}%`) as {
        total: number;
      })
    : (bancoAtivo()
        .prepare(
          `SELECT COUNT(*) AS total FROM usuarios u
           JOIN perfis p ON p.usuario_id = u.id
           WHERE u.demonstracao = 0`
        )
        .get() as { total: number });
  return linha.total;
}

export function concederExcecaoCategoriaCypher(
  usuarioId: string,
  administradorId: string,
  administradorEmail: string,
  motivo: string
):
  | "concedida"
  | "ja_pendente"
  | "solicitacao_pendente"
  | "nao_bloqueada"
  | "nao_encontrada" {
  const db = bancoAtivo();
  const executar = db.transaction(() => {
    const perfil = db
      .prepare(
        `SELECT p.ultima_alteracao_categorias_em AS alteradaEm
         FROM perfis p JOIN usuarios u ON u.id = p.usuario_id
         WHERE u.id = ? AND u.demonstracao = 0`
      )
      .get(usuarioId) as { alteradaEm: string | null } | undefined;
    if (!perfil) return "nao_encontrada" as const;
    const solicitacaoPendente = db
      .prepare(
        `SELECT 1 FROM solicitacoes_excecao_categorias
         WHERE usuario_id = ? AND status = 'pendente' LIMIT 1`
      )
      .get(usuarioId);
    if (solicitacaoPendente) return "solicitacao_pendente" as const;
    if (!perfil.alteradaEm) return "nao_bloqueada" as const;
    const prazo = db
      .prepare("SELECT datetime(?, '+60 days') > datetime('now') AS bloqueada")
      .get(perfil.alteradaEm) as { bloqueada: number };
    if (!prazo.bloqueada) return "nao_bloqueada" as const;
    const insercao = db
      .prepare(
        `INSERT INTO excecoes_categorias (
           id, usuario_id, administrador_id, administrador_email, motivo
         ) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`
      )
      .run(
        randomUUID(),
        usuarioId,
        administradorId,
        administradorEmail,
        motivo
      );
    return insercao.changes === 1 ? "concedida" : "ja_pendente";
  });
  return executar();
}

export function revisarPropostaGeneroCypher(
  propostaId: string,
  revisorId: string,
  aprovada: boolean,
  motivo: string
): boolean {
  const db = bancoAtivo();
  const revisar = db.transaction(() => {
    const proposta = db
      .prepare(
        `SELECT usuario_id AS usuarioId, genero FROM propostas_generos
         WHERE id = ? AND status = 'pendente'`
      )
      .get(propostaId) as { usuarioId: string; genero: string } | undefined;
    if (!proposta) return false;
    if (aprovada) {
      const linha = db
        .prepare(
          "SELECT generos_json AS generosJson FROM perfis WHERE usuario_id = ?"
        )
        .get(proposta.usuarioId) as { generosJson: string } | undefined;
      if (!linha) return false;
      const generos = JSON.parse(linha.generosJson) as string[];
      const normalizar = (valor: string) =>
        valor.trim().toLocaleLowerCase("pt-BR");
      if (
        !generos.some(
          genero => normalizar(genero) === normalizar(proposta.genero)
        )
      ) {
        generos.push(proposta.genero);
        db.prepare(
          "UPDATE perfis SET generos_json = ?, atualizado_em = CURRENT_TIMESTAMP WHERE usuario_id = ?"
        ).run(JSON.stringify(generos), proposta.usuarioId);
      }
    }
    const resultado = db
      .prepare(
        `UPDATE propostas_generos
         SET status = ?, revisada_em = CURRENT_TIMESTAMP,
             revisor_id = ?, motivo_revisao = ?
         WHERE id = ? AND status = 'pendente'`
      )
      .run(aprovada ? "aprovado" : "rejeitado", revisorId, motivo, propostaId);
    return resultado.changes === 1;
  });
  return revisar();
}

export function revisarPropostaCategoriaCypher(
  propostaId: string,
  revisorId: string,
  revisorEmail: string,
  aprovada: boolean,
  motivo: string
): boolean {
  const db = bancoAtivo();
  const revisar = db.transaction(() => {
    const proposta = db
      .prepare(
        "SELECT categoria FROM propostas_categorias WHERE id = ? AND status = 'pendente'"
      )
      .get(propostaId) as { categoria: string } | undefined;
    if (!proposta) return false;
    if (aprovada) {
      const chave = normalizarCategoria(proposta.categoria);
      const jaAtiva =
        categoriasGerais.some(
          categoria => normalizarCategoria(categoria) === chave
        ) ||
        (
          db
            .prepare("SELECT categoria FROM categorias_profissionais_aprovadas")
            .all() as Array<{ categoria: string }>
        ).some(item => normalizarCategoria(item.categoria) === chave);
      if (jaAtiva) return false;
    }
    const resultado = db
      .prepare(
        `UPDATE propostas_categorias
       SET status = ?, revisada_em = CURRENT_TIMESTAMP,
           revisor_id = ?, revisor_email = ?, motivo_revisao = ?
       WHERE id = ? AND status = 'pendente'`
      )
      .run(
        aprovada ? "aprovado" : "rejeitado",
        revisorId,
        revisorEmail,
        motivo,
        propostaId
      );
    if (resultado.changes !== 1) return false;
    if (aprovada) {
      db.prepare(
        `INSERT INTO categorias_profissionais_aprovadas (
           categoria, revisor_id, revisor_email, motivo_aprovacao
         ) VALUES (?, ?, ?, ?)`
      ).run(proposta.categoria, revisorId, revisorEmail, motivo);
    }
    return true;
  });
  return revisar();
}

const chaveVisibilidadeCategoria = "__categoria__";

function jsonObjeto<T extends Record<string, unknown>>(texto: string): T {
  try {
    const valor: unknown = JSON.parse(texto);
    return valor && typeof valor === "object" && !Array.isArray(valor)
      ? (valor as T)
      : ({} as T);
  } catch {
    return {} as T;
  }
}

function jsonLista(texto: string): string[] {
  try {
    const valor: unknown = JSON.parse(texto);
    return Array.isArray(valor)
      ? valor.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function historicoSolicitacao(
  db: BancoCypher,
  solicitacaoId: string
): SolicitacaoExcecaoCategoriaPersistida["historico"] {
  return db
    .prepare(
      `SELECT autor_tipo AS autorTipo, mensagem, criada_em AS criadaEm
       FROM historico_solicitacoes_categorias
       WHERE solicitacao_id = ? ORDER BY datetime(criada_em), id`
    )
    .all(solicitacaoId) as SolicitacaoExcecaoCategoriaPersistida["historico"];
}

export function listarAtuacoesUsuarioCypher(
  usuarioId: string
): AtuacaoProfissionalPersistida[] {
  return bancoAtivo()
    .prepare(
      `SELECT categoria, respostas_json AS respostasJson,
              visibilidades_json AS visibilidadesJson
       FROM respostas_atuacao_categoria WHERE usuario_id = ?
       ORDER BY categoria COLLATE NOCASE`
    )
    .all(usuarioId)
    .map(linha => {
      const item = linha as {
        categoria: string;
        respostasJson: string;
        visibilidadesJson: string;
      };
      return {
        categoria: item.categoria,
        respostas: jsonObjeto<RespostasAtuacao>(item.respostasJson),
        visibilidades: jsonObjeto<VisibilidadesAtuacao>(item.visibilidadesJson),
      };
    });
}

function ehColaboradorDaConta(db: BancoCypher, titularId: string, visitanteId: string): boolean {
  return Boolean(
    (
      db
        .prepare(
          `SELECT EXISTS (
             SELECT 1 FROM obras o
             JOIN creditos c ON c.obra_id = o.id
             WHERE o.proprietario_id = ? AND c.usuario_creditado_id = ?
               AND o.demonstracao = 0 AND c.demonstracao = 0
               AND o.publicada = 1 AND o.situacao = 'Lançado'
           ) AS colaborador`
        )
        .get(titularId, visitanteId) as { colaborador: number }
    ).colaborador
  );
}

function atuacoesVisiveis(
  db: BancoCypher,
  titularId: string,
  categorias: readonly string[],
  visitanteId: string | undefined,
  perfilPublico: boolean
): Array<{ categoria: string; respostas: RespostasAtuacao }> {
  const titular = visitanteId === titularId;
  if (!titular && !perfilPublico) return [];
  const colaborador = Boolean(
    visitanteId && visitanteId !== titularId && ehColaboradorDaConta(db, titularId, visitanteId)
  );
  const registros = new Map(
    listarAtuacoesUsuarioCypher(titularId).map(item => [item.categoria, item])
  );
  return categorias.flatMap(categoria => {
    const registro = registros.get(categoria);
    const visibilidades = registro?.visibilidades ?? {};
    const visibilidadeCategoria = visibilidades[chaveVisibilidadeCategoria] ?? "publico";
    const podeVerCategoria =
      titular ||
      visibilidadeCategoria === "publico" ||
      (visibilidadeCategoria === "colaboradores" && colaborador);
    if (!podeVerCategoria) return [];
    const respostas = Object.fromEntries(
      Object.entries(registro?.respostas ?? {}).filter(([campo]) => {
        const visibilidade = visibilidades[campo] ?? "privado";
        return (
          titular ||
          visibilidade === "publico" ||
          (visibilidade === "colaboradores" && colaborador)
        );
      })
    ) as RespostasAtuacao;
    return [{ categoria, respostas }];
  });
}

export function obterPerfilPublicoCypher(
  identificador: string,
  visitanteId?: string
): PerfilPublico | undefined {
  const db = bancoAtivo();
  const resultado = db
    .prepare(
      `
      SELECT
        u.id AS userId,
        p.nome AS name,
        p.funcao AS role,
        CASE WHEN p.localizacao_publica = 1 THEN p.cidade ELSE '' END AS city,
        p.identificador AS handle,
        u.codigo_publico AS publicCode,
        p.iniciais AS initials,
        p.c_tag AS cTag,
        p.biografia AS biography,
        CASE WHEN p.contato_publico = 1 THEN p.contato ELSE '' END AS contact,
        p.disponibilidade AS availability,
        p.generos_json AS genresJson,
        p.categorias_json AS categoriesJson,
        p.equipamentos_json AS equipmentJson,
        p.criado_em AS createdAt
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 0
        AND p.perfil_publico = 1
        AND p.identificador = ? COLLATE NOCASE
    `
    )
    .get(identificador) as
    | (Omit<PerfilPublico, "genres" | "categories" | "equipment" | "atuacoes"> & {
        userId: string;
        genresJson: string;
        categoriesJson: string;
        equipmentJson: string;
      })
    | undefined;

  if (!resultado) return undefined;
  const categorias = JSON.parse(resultado.categoriesJson) as string[];
  const atuacoes = atuacoesVisiveis(
    db,
    resultado.userId,
    categorias,
    visitanteId,
    true
  );
  const categories = atuacoes.map(atuacao => atuacao.categoria);
  return {
    ...resultado,
    role: categories.join(" · ") || "Atuação profissional",
    genres: JSON.parse(resultado.genresJson) as string[],
    categories,
    atuacoes,
    equipment: JSON.parse(resultado.equipmentJson) as string[],
  };
}

function normalizarTextoBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function opcoesUnicasBusca(valores: readonly string[]): string[] {
  const unicas = new Map<string, string>();
  for (const valor of valores) {
    const texto = valor.trim();
    const chave = normalizarTextoBusca(texto);
    if (chave && !unicas.has(chave)) unicas.set(chave, texto);
  }
  return [...unicas.values()].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
}

export function buscarPerfisPublicosCypher(
  filtrosRecebidos: FiltrosBuscaPerfisPublicos,
  usuarioId: string
): ResultadoBuscaPerfisPublicos {
  type LinhaBusca = Omit<
    PerfilBuscaPublico,
    "genres" | "categories" | "tone"
  > & {
    userId: string;
    genresJson: string;
    categoriesJson: string;
    locationPublic: number;
    tone: string;
  };

  const db = bancoAtivo();
  const linhas = db
    .prepare(
      `
      SELECT
        u.id AS userId,
        p.nome AS name,
        p.funcao AS role,
        p.cidade AS city,
        p.localizacao_publica AS locationPublic,
        p.identificador AS handle,
        p.iniciais AS initials,
        p.disponibilidade AS availability,
        p.generos_json AS genresJson,
        p.categorias_json AS categoriesJson,
        p.outra_categoria AS otherCategory,
        p.tom AS tone
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 0
        AND p.demonstracao = 0
        AND p.perfil_publico = 1
        AND u.id <> ?
      ORDER BY p.nome COLLATE NOCASE ASC
    `
    )
    .all(usuarioId) as LinhaBusca[];

  const tonsPermitidos = new Set(["yellow", "green", "black", "cream"]);
  const perfis: PerfilBuscaPublico[] = linhas.map(linha => {
    const categories = atuacoesVisiveis(
      db,
      linha.userId,
      JSON.parse(linha.categoriesJson) as string[],
      usuarioId,
      true
    ).map(atuacao => atuacao.categoria);
    return {
      name: linha.name,
      role: categories.join(" · ") || "Atuação profissional",
      city: linha.locationPublic ? linha.city : "",
      handle: linha.handle,
      initials: linha.initials,
      availability: linha.availability,
      genres: JSON.parse(linha.genresJson) as string[],
      categories,
      otherCategory: categories.includes("Outros") ? linha.otherCategory : "",
      tone: tonsPermitidos.has(linha.tone) ? linha.tone : "yellow",
    };
  });

  const opcoes = {
    categorias: opcoesUnicasBusca(
      perfis.flatMap(perfil => [
        ...perfil.categories,
        ...(perfil.categories.includes("Outros") && perfil.otherCategory
          ? [perfil.otherCategory]
          : []),
      ])
    ),
    generos: opcoesUnicasBusca(perfis.flatMap(perfil => perfil.genres)),
    localizacoes: opcoesUnicasBusca(
      perfis.map(perfil => perfil.city).filter(Boolean)
    ),
  };

  const selecionarOpcao = (valores: readonly string[], recebido: string) =>
    valores.find(
      valor => normalizarTextoBusca(valor) === normalizarTextoBusca(recebido)
    ) ?? "";
  const filtros = {
    q: filtrosRecebidos.q.trim().slice(0, 100),
    categoria: selecionarOpcao(opcoes.categorias, filtrosRecebidos.categoria),
    genero: selecionarOpcao(opcoes.generos, filtrosRecebidos.genero),
    localizacao: selecionarOpcao(
      opcoes.localizacoes,
      filtrosRecebidos.localizacao
    ),
  };
  const termos = normalizarTextoBusca(filtros.q).split(/\s+/).filter(Boolean);
  const pessoas = perfis.filter(perfil => {
    const categorias = [
      ...perfil.categories,
      ...(perfil.categories.includes("Outros") && perfil.otherCategory
        ? [perfil.otherCategory]
        : []),
    ];
    const camposBusca = normalizarTextoBusca(
      [
        perfil.name,
        perfil.role,
        perfil.city,
        perfil.handle,
        ...categorias,
        ...perfil.genres,
      ].join(" ")
    );
    return (
      termos.every(termo => camposBusca.includes(termo)) &&
      (!filtros.categoria ||
        categorias.some(
          categoria =>
            normalizarTextoBusca(categoria) ===
            normalizarTextoBusca(filtros.categoria)
        )) &&
      (!filtros.genero ||
        perfil.genres.some(
          genero =>
            normalizarTextoBusca(genero) ===
            normalizarTextoBusca(filtros.genero)
        )) &&
      (!filtros.localizacao ||
        normalizarTextoBusca(perfil.city) ===
          normalizarTextoBusca(filtros.localizacao))
    );
  });

  return { pessoas, filtros, opcoes };
}

export function listarObrasProprietarioCypher(
  proprietarioId: string
): ObraPersistida[] {
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        id,
        titulo AS title,
        tipo AS type,
        situacao AS status,
        metadados AS meta,
        funcao_principal AS role,
        quantidade_creditos AS credits,
        descricao AS description,
        bpm,
        isrc,
        iswc,
        publicada AS published
      FROM obras
      WHERE proprietario_id = ?
        AND demonstracao = 0
      ORDER BY criado_em DESC, ordem_demo ASC
      LIMIT 5
    `
    )
    .all(proprietarioId) as Array<
    Omit<ObraPersistida, "published"> & { published: number }
  >;
  return linhas.map(obra => ({ ...obra, published: Boolean(obra.published) }));
}

export function listarObrasPublicasPerfilCypher(
  identificador: string
): ObraPublicaPerfil[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT
        o.titulo AS title,
        o.tipo AS type,
        o.genero AS genre,
        o.funcao_principal AS role,
        o.data_lancamento AS releaseDate,
        o.link_escuta AS listenLink,
        o.letra AS lyrics
      FROM obras o
      JOIN usuarios u ON u.id = o.proprietario_id
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 0
        AND p.demonstracao = 0
        AND p.perfil_publico = 1
        AND p.identificador = ? COLLATE NOCASE
        AND o.demonstracao = 0
        AND o.publicada = 1
        AND o.situacao = 'Lançado'
      ORDER BY
        CASE WHEN o.data_lancamento = '' THEN 1 ELSE 0 END,
        o.data_lancamento DESC,
        o.criado_em DESC,
        o.id DESC
      `
    )
    .all(identificador) as ObraPublicaPerfil[];
}

type LinhaCreditoObra = Omit<CreditoObraPersistido, "verified"> & {
  obraId: string;
  verified: number;
};

function creditosDasObras(ids: string[]): Map<string, CreditoObraPersistido[]> {
  if (ids.length === 0) return new Map();

  const db = bancoAtivo();
  const marcadores = ids.map(() => "?").join(", ");
  const linhas = db
    .prepare(
      `
      SELECT
        c.id,
        c.obra_id AS obraId,
        c.usuario_creditado_id AS userId,
        p.identificador AS handle,
        c.nome_creditado AS name,
        c.funcao AS role,
        c.participacao AS participation,
        c.verificado AS verified
      FROM creditos c
      LEFT JOIN perfis p ON p.usuario_id = c.usuario_creditado_id
      WHERE c.demonstracao = 0
        AND c.obra_id IN (${marcadores})
      ORDER BY c.criado_em ASC, c.id ASC
    `
    )
    .all(...ids) as LinhaCreditoObra[];

  const resultado = new Map<string, CreditoObraPersistido[]>();
  for (const linha of linhas) {
    const creditos = resultado.get(linha.obraId) ?? [];
    const { obraId, ...credito } = linha;
    creditos.push({ ...credito, verified: Boolean(credito.verified) });
    resultado.set(obraId, creditos);
  }
  return resultado;
}

export function listarObrasContaCypher(
  proprietarioId: string,
  filtros?: FiltrosCatalogoObras
): ObraContaPersistida[] {
  const filtro = filtros ?? {
    status: "",
    type: "",
    genre: "",
    role: "",
    order: "recentes" as const,
  };
  const ordenacao = {
    recentes: "o.criado_em DESC, o.id DESC",
    antigas: "o.criado_em ASC, o.id ASC",
    titulo: "o.titulo COLLATE NOCASE ASC, o.id ASC",
    lancamento:
      "CASE WHEN o.data_lancamento = '' THEN 1 ELSE 0 END, o.data_lancamento DESC, o.id DESC",
    status:
      "CASE o.situacao WHEN 'Rascunho' THEN 1 WHEN 'Em produção' THEN 2 WHEN 'Lançado' THEN 3 ELSE 4 END, o.titulo COLLATE NOCASE ASC",
  }[filtro.order];
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        o.id,
        o.titulo AS title,
        o.tipo AS type,
        o.situacao AS status,
        o.metadados AS meta,
        o.funcao_principal AS role,
        (SELECT COUNT(*) FROM creditos c
          WHERE c.obra_id = o.id AND c.demonstracao = 0) AS credits,
        o.descricao AS description,
        o.genero AS genre,
        o.letra AS lyrics,
        o.bpm,
        o.isrc,
        o.iswc,
        o.data_lancamento AS releaseDate,
        o.link_escuta AS listenLink,
        o.publicada AS published,
        o.proprietario_id = @proprietarioId AS owned,
        COALESCE(
          (SELECT c.funcao FROM creditos c
           WHERE c.obra_id = o.id
             AND c.usuario_creditado_id = @proprietarioId
             AND c.demonstracao = 0
           ORDER BY c.criado_em ASC, c.id ASC LIMIT 1),
          ''
        ) AS participationRole
      FROM obras o
      WHERE o.demonstracao = 0
        AND (
          o.proprietario_id = @proprietarioId
          OR EXISTS (
            SELECT 1 FROM creditos c
            WHERE c.obra_id = o.id
              AND c.usuario_creditado_id = @proprietarioId
              AND c.demonstracao = 0
          )
        )
        AND (@status = '' OR o.situacao = @status)
        AND (@type = '' OR o.tipo = @type)
        AND (@genre = '' OR o.genero = @genre)
        AND (
          @role = ''
          OR o.funcao_principal = @role
          OR EXISTS (
            SELECT 1 FROM creditos c
            WHERE c.obra_id = o.id
              AND c.usuario_creditado_id = @proprietarioId
              AND c.funcao = @role
              AND c.demonstracao = 0
          )
        )
      ORDER BY ${ordenacao}
      `
    )
    .all({
      proprietarioId,
      status: filtro.status,
      type: filtro.type,
      genre: filtro.genre,
      role: filtro.role,
    }) as Array<
    Omit<ObraContaPersistida, "published" | "creditDetails" | "owned"> & {
      published: number;
      owned: number;
      participationRole: string;
    }
  >;

  const creditos = creditosDasObras(linhas.map(obra => obra.id));
  return linhas.map(obra => ({
    ...obra,
    role: obra.owned ? obra.role : obra.participationRole,
    published: Boolean(obra.published),
    owned: Boolean(obra.owned),
    creditDetails: creditos.get(obra.id) ?? [],
  }));
}

export function obterObraContaCypher(
  id: string,
  proprietarioId: string
): ObraContaPersistida | undefined {
  return listarObrasContaCypher(proprietarioId).find(
    obra => obra.id === id && obra.owned
  );
}

export function listarPerfisParaCreditoCypher(
  usuarioAtualId: string
): PerfilParaCredito[] {
  return bancoAtivo()
    .prepare(
      `
      SELECT p.nome AS name, p.identificador AS handle
      FROM usuarios u
      JOIN perfis p ON p.usuario_id = u.id
      WHERE u.demonstracao = 0
        AND p.demonstracao = 0
        AND p.perfil_publico = 1
        AND u.id <> ?
      ORDER BY p.nome COLLATE NOCASE, p.identificador COLLATE NOCASE
      `
    )
    .all(usuarioAtualId) as PerfilParaCredito[];
}

function metadadosObra(dados: DadosObraCypher): string {
  const data = dados.releaseDate
    ? dados.releaseDate.split("-").reverse().join("/")
    : "";
  return [dados.genre, data].filter(Boolean).join(" · ");
}

function salvarCreditosObra(
  db: BancoCypher,
  obraId: string,
  proprietarioId: string,
  creditos: CreditoObraEntrada[]
): void {
  const obterPerfil = db.prepare(
    `
    SELECT u.id, p.nome AS name
    FROM usuarios u
    JOIN perfis p ON p.usuario_id = u.id
    WHERE lower(p.identificador) = lower(?)
      AND u.demonstracao = 0
      AND p.demonstracao = 0
    `
  );
  const inserir = db.prepare(`
    INSERT INTO creditos (
      id, obra_id, usuario_creditado_id, nome_creditado, funcao,
      participacao, verificado, demonstracao
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0)
  `);
  const creditosVistos = new Set<string>();

  for (const credito of creditos) {
    let usuarioCreditadoId: string | null = null;
    let nome = credito.name.trim();
    let chave: string;

    if (credito.handle) {
      const perfil = obterPerfil.get(credito.handle) as
        { id: string; name: string } | undefined;
      if (!perfil) throw new Error("CREDITO_PERFIL_NAO_ENCONTRADO");
      if (perfil.id === proprietarioId) throw new Error("CREDITO_PROPRIO");
      usuarioCreditadoId = perfil.id;
      nome = perfil.name;
      chave = `usuario:${perfil.id}`;
    } else {
      chave = `mencao:${nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")}`;
    }

    if (creditosVistos.has(chave)) throw new Error("CREDITOS_DUPLICADOS");
    creditosVistos.add(chave);
    inserir.run(
      randomUUID(),
      obraId,
      usuarioCreditadoId,
      nome,
      credito.role.trim(),
      credito.participation.trim()
    );
  }
}

export function criarObraCypher(
  proprietarioId: string,
  dados: DadosObraCypher,
  creditos: CreditoObraEntrada[]
): string {
  const db = bancoAtivo();
  const salvar = db.transaction(() => {
    const id = randomUUID();
    db.prepare(
      `
      INSERT INTO obras (
        id, proprietario_id, titulo, tipo, situacao, metadados,
        funcao_principal, quantidade_creditos, descricao, genero, letra,
        bpm, isrc, iswc, data_lancamento, link_escuta, publicada,
        ordem_demo, demonstracao
      ) VALUES (
        @id, @proprietarioId, @title, @type, @status, @meta,
        @role, @credits, @description, @genre, @lyrics,
        @bpm, @isrc, @iswc, @releaseDate, @listenLink, @published,
        0, 0
      )
      `
    ).run({
      id,
      proprietarioId,
      title: dados.title,
      type: dados.type,
      status: dados.status,
      meta: metadadosObra(dados),
      role: dados.role,
      credits: creditos.length,
      description: dados.description,
      genre: dados.genre,
      lyrics: dados.lyrics,
      bpm: dados.bpm,
      isrc: dados.isrc,
      iswc: dados.iswc,
      releaseDate: dados.releaseDate,
      listenLink: dados.listenLink,
      published: Number(dados.status === "Lançado"),
    });
    salvarCreditosObra(db, id, proprietarioId, creditos);
    return id;
  });
  return salvar();
}

export function atualizarObraCypher(
  id: string,
  proprietarioId: string,
  dados: DadosObraCypher,
  creditos: CreditoObraEntrada[]
): boolean {
  const db = bancoAtivo();
  const salvar = db.transaction(() => {
    const resultado = db
      .prepare(
        `
        UPDATE obras SET
          titulo = @title,
          tipo = @type,
          situacao = @status,
          metadados = @meta,
          funcao_principal = @role,
          quantidade_creditos = @credits,
          descricao = @description,
          genero = @genre,
          letra = @lyrics,
          bpm = @bpm,
          isrc = @isrc,
          iswc = @iswc,
          data_lancamento = @releaseDate,
          link_escuta = @listenLink,
          publicada = @published,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = @id
          AND proprietario_id = @proprietarioId
          AND demonstracao = 0
        `
      )
      .run({
        id,
        proprietarioId,
        title: dados.title,
        type: dados.type,
        status: dados.status,
        meta: metadadosObra(dados),
        role: dados.role,
        credits: creditos.length,
        description: dados.description,
        genre: dados.genre,
        lyrics: dados.lyrics,
        bpm: dados.bpm,
        isrc: dados.isrc,
        iswc: dados.iswc,
        releaseDate: dados.releaseDate,
        listenLink: dados.listenLink,
        published: Number(dados.status === "Lançado"),
      });
    if (resultado.changes !== 1) return false;

    db.prepare(
      "DELETE FROM creditos WHERE obra_id = ? AND demonstracao = 0"
    ).run(id);
    salvarCreditosObra(db, id, proprietarioId, creditos);
    return true;
  });
  return salvar();
}

export function excluirObraCypher(id: string, proprietarioId: string): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      DELETE FROM obras
      WHERE id = ? AND proprietario_id = ? AND demonstracao = 0
      `
    )
    .run(id, proprietarioId);
  return resultado.changes === 1;
}

export function estatisticasObrasUsuarioCypher(proprietarioId: string): {
  publicadasComoArtista: number;
  participacoesComoFeat: number;
  emAndamento: number;
} {
  return bancoAtivo()
    .prepare(
      `
      SELECT
        COALESCE(SUM(CASE WHEN publicada = 1 AND funcao_principal = 'Artista principal' THEN 1 ELSE 0 END), 0) AS publicadasComoArtista,
        COALESCE(SUM(CASE WHEN publicada = 1 AND funcao_principal = 'Participação como feat' THEN 1 ELSE 0 END), 0) AS participacoesComoFeat,
        COALESCE(SUM(CASE WHEN situacao = 'Em produção' THEN 1 ELSE 0 END), 0) AS emAndamento
      FROM obras
      WHERE proprietario_id = ? AND demonstracao = 0
      `
    )
    .get(proprietarioId) as {
    publicadasComoArtista: number;
    participacoesComoFeat: number;
    emAndamento: number;
  };
}

export function excluirContaCypher(id: string): ResultadoExclusaoConta {
  const db = bancoAtivo();
  const excluir = db.transaction(() => {
    const obras = db
      .prepare("SELECT COUNT(*) AS total FROM obras WHERE proprietario_id = ?")
      .get(id) as { total: number };
    const eventos = db
      .prepare(
        "SELECT COUNT(*) AS total FROM eventos WHERE proprietario_id = ?"
      )
      .get(id) as { total: number };
    const beats = db
      .prepare("SELECT COUNT(*) AS total FROM beats WHERE produtor_id = ?")
      .get(id) as { total: number };
    if (obras.total || eventos.total || beats.total) {
      return {
        excluida: false,
        obras: obras.total,
        eventos: eventos.total,
        beats: beats.total,
      };
    }

    const removido = db
      .prepare("DELETE FROM usuarios WHERE id = ? AND demonstracao = 0")
      .run(id);
    return {
      excluida: removido.changes === 1,
      obras: 0,
      eventos: 0,
      beats: 0,
    };
  });
  return excluir();
}

export function revogarSessaoCypher(tokenHash: string): void {
  bancoAtivo()
    .prepare("DELETE FROM sessoes WHERE token_hash = ?")
    .run(tokenHash);
}

export function fecharBancoCypher(): void {
  banco?.close();
  banco = undefined;
}

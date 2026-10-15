import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

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
};

export type DadosEventoCypher = EventoPersistido;

export type FiltrosEventos = {
  categoria: string;
  localizacao: string;
  formato: string;
  periodo: "todos" | "proximos" | "passados";
  ordem: "recentes" | "data" | "titulo";
};

export type EventoContaPersistido = EventoPersistido & {
  id: string;
  proprietarioId: string;
  demonstracao: boolean;
  owned: boolean;
  criadoEm: string;
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
  categories: string[];
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
  usuarioDestinoId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  url: string;
  entidadeTipo: string;
  entidadeId: string;
  lida: boolean;
  criadaEm: string;
  lidaEm: string | null;
};

export type DadosNovaNotificacao = {
  usuarioDestinoId: string;
  tipo: string;
  titulo: string;
  mensagem?: string;
  url?: string;
  entidadeTipo?: string;
  entidadeId?: string;
};

type BancoCypher = InstanceType<typeof Database>;

let banco: BancoCypher | undefined;

const versaoEsquema = 7;

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
    ordem_demo INTEGER NOT NULL DEFAULT 0,
    demonstracao INTEGER NOT NULL DEFAULT 0 CHECK (demonstracao IN (0, 1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS indice_eventos_proprietario
    ON eventos(proprietario_id, criado_em);

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
    lida_em TEXT
  );

  CREATE INDEX IF NOT EXISTS indice_notificacoes_usuario_data
    ON notificacoes(usuario_destino_id, criada_em);

  CREATE INDEX IF NOT EXISTS indice_notificacoes_usuario_lida
    ON notificacoes(usuario_destino_id, lida, criada_em);

  CREATE TABLE IF NOT EXISTS sessoes (
    token_hash TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    expira_em INTEGER NOT NULL,
    criada_em INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS indice_sessoes_expiracao ON sessoes(expira_em);

  CREATE TABLE IF NOT EXISTS sequencias (
    nome TEXT PRIMARY KEY,
    proximo_numero INTEGER NOT NULL CHECK (proximo_numero > 0)
  );
`;

function bancoAtivo(): BancoCypher {
  if (!banco) {
    throw new Error(
      "O banco Cypher não foi inicializado. Inicialize-o antes de consultar os Models."
    );
  }
  return banco;
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

  const versaoAtual = conexao.pragma("user_version", {
    simple: true,
  }) as number;
  if (versaoAtual > versaoEsquema) {
    conexao.close();
    throw new Error(
      `O banco Cypher usa uma versão de esquema mais recente (${versaoAtual}) que a suportada (${versaoEsquema}).`
    );
  }

  conexao.exec(esquema);

  const colunasUsuario = new Set(
    (conexao.pragma("table_info(usuarios)") as Array<{ name: string }>).map(
      coluna => coluna.name
    )
  );
  if (!colunasUsuario.has("codigo_publico")) {
    conexao.exec("ALTER TABLE usuarios ADD COLUMN codigo_publico TEXT");
  }
  if (!colunasUsuario.has("numero_sequencial")) {
    conexao.exec("ALTER TABLE usuarios ADD COLUMN numero_sequencial INTEGER");
  }

  const colunasPerfil = new Set(
    (conexao.pragma("table_info(perfis)") as Array<{ name: string }>).map(
      coluna => coluna.name
    )
  );
  if (!colunasPerfil.has("categorias_json")) {
    conexao.exec(
      "ALTER TABLE perfis ADD COLUMN categorias_json TEXT NOT NULL DEFAULT '[]'"
    );
  }
  if (!colunasPerfil.has("outra_categoria")) {
    conexao.exec(
      "ALTER TABLE perfis ADD COLUMN outra_categoria TEXT NOT NULL DEFAULT ''"
    );
  }
  if (!colunasPerfil.has("equipamentos_json")) {
    conexao.exec(
      "ALTER TABLE perfis ADD COLUMN equipamentos_json TEXT NOT NULL DEFAULT '[]'"
    );
  }
  if (!colunasPerfil.has("localizacao_publica")) {
    conexao.exec(
      "ALTER TABLE perfis ADD COLUMN localizacao_publica INTEGER NOT NULL DEFAULT 1 CHECK (localizacao_publica IN (0, 1))"
    );
  }
  if (!colunasPerfil.has("contato_publico")) {
    conexao.exec(
      "ALTER TABLE perfis ADD COLUMN contato_publico INTEGER NOT NULL DEFAULT 0 CHECK (contato_publico IN (0, 1))"
    );
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

  if (versaoAtual < 4) {
    const colunasObra = new Set(
      (conexao.pragma("table_info(obras)") as Array<{ name: string }>).map(
        coluna => coluna.name
      )
    );
    const novasColunas = [
      ["genero", "TEXT NOT NULL DEFAULT ''"],
      ["letra", "TEXT NOT NULL DEFAULT ''"],
      ["data_lancamento", "TEXT NOT NULL DEFAULT ''"],
      ["link_escuta", "TEXT NOT NULL DEFAULT ''"],
    ] as const;
    for (const [nome, definicao] of novasColunas) {
      if (!colunasObra.has(nome)) {
        conexao.exec(`ALTER TABLE obras ADD COLUMN ${nome} ${definicao}`);
      }
    }
  }

  if (versaoAtual < 5) {
    const migrarIdentificadores = conexao.transaction(() => {
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
          JOIN perfis p ON p.usuario_id = u.id
          WHERE u.demonstracao = 0
          ORDER BY datetime(u.criado_em), u.id
          `
        )
        .all() as Array<{
        id: string;
        codigoPublico: string | null;
        numeroSequencial: number | null;
        nome: string;
      }>;
      const atualizarConta = conexao.prepare(
        `
        UPDATE usuarios
        SET codigo_publico = ?, numero_sequencial = ?
        WHERE id = ?
        `
      );
      for (const conta of contasReais) {
        const numero = conta.numeroSequencial ?? proximoNumero++;
        const codigo =
          conta.codigoPublico ??
          codigoPublicoReal(iniciaisPublicas(conta.nome), numero);
        atualizarConta.run(codigo, numero, conta.id);
      }

      const contasDemo = conexao
        .prepare(
          `
          SELECT u.id, u.codigo_publico AS codigoPublico, p.ordem_demo AS ordemDemo
          FROM usuarios u
          JOIN perfis p ON p.usuario_id = u.id
          WHERE u.demonstracao = 1
          ORDER BY p.ordem_demo, u.id
          `
        )
        .all() as Array<{
        id: string;
        codigoPublico: string | null;
        ordemDemo: number;
      }>;
      for (const conta of contasDemo) {
        if (conta.codigoPublico) continue;
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
    });
    migrarIdentificadores();
  }

  const colunasBeat = new Set(
    (
      conexao.prepare("PRAGMA table_info(beats)").all() as Array<{
        name: string;
      }>
    ).map(coluna => coluna.name)
  );
  if (!colunasBeat.has("venda_exclusiva")) {
    conexao.exec(
      "ALTER TABLE beats ADD COLUMN venda_exclusiva INTEGER NOT NULL DEFAULT 0 CHECK (venda_exclusiva IN (0, 1))"
    );
  }

  if (versaoAtual < versaoEsquema) {
    conexao.pragma(`user_version = ${versaoEsquema}`);
  }

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

  banco = conexao;
  carregarDadosDemonstrativos(dados);
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
        etiquetas_json, ordem_demo, demonstracao
      ) VALUES (
        @id, @proprietarioId, @title, @category, @date, @time, @location,
        @org, @status, @color, @description, @format, @registration, @prize,
        @etiquetasJson, @ordem, 1
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
        etiquetas_json AS tagsJson
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
        e.demonstracao,
        e.criado_em AS criadoEm,
        CASE WHEN e.proprietario_id = @usuarioId AND e.demonstracao = 0 THEN 1 ELSE 0 END AS owned
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
    }
  >;
  return linhas.map(({ tagsJson, demonstracao, owned, ...evento }) => ({
    ...evento,
    tags: JSON.parse(tagsJson) as string[],
    demonstracao: Boolean(demonstracao),
    owned: Boolean(owned),
  }));
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
        e.demonstracao,
        e.criado_em AS criadoEm,
        CASE WHEN e.proprietario_id = ? AND e.demonstracao = 0 THEN 1 ELSE 0 END AS owned
      FROM eventos e
      WHERE e.id = ?
      `
    )
    .get(usuarioId, id) as
    | (Omit<EventoContaPersistido, "tags" | "demonstracao" | "owned"> & {
        tagsJson: string;
        demonstracao: number;
        owned: number;
      })
    | undefined;
  if (!linha) return undefined;
  const { tagsJson, demonstracao, owned, ...evento } = linha;
  return {
    ...evento,
    tags: JSON.parse(tagsJson) as string[],
    demonstracao: Boolean(demonstracao),
    owned: Boolean(owned),
  };
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
        etiquetas_json, demonstracao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
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
      JSON.stringify(dados.tags)
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
          inscricao = ?, premio = ?, etiquetas_json = ?, atualizado_em = CURRENT_TIMESTAMP
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
        categorias_json, outra_categoria, generos_json, perfil_publico,
        localizacao_publica, contato_publico, demonstracao
      ) VALUES (
        @id, @cTag, @nome, @funcao, @identificador, @iniciais,
        @categoriasJson, @outraCategoria, '[]', 0, 0, 0, 0
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
      outraCategoria: conta.outraCategoria,
    });
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
        categoriesJson: JSON.stringify(dados.categories),
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

export function obterPerfilPublicoCypher(
  identificador: string
): PerfilPublico | undefined {
  const resultado = bancoAtivo()
    .prepare(
      `
      SELECT
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
    | (Omit<PerfilPublico, "genres" | "categories" | "equipment"> & {
        genresJson: string;
        categoriesJson: string;
        equipmentJson: string;
      })
    | undefined;

  if (!resultado) return undefined;
  return {
    ...resultado,
    genres: JSON.parse(resultado.genresJson) as string[],
    categories: JSON.parse(resultado.categoriesJson) as string[],
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
    genresJson: string;
    categoriesJson: string;
    locationPublic: number;
    tone: string;
  };

  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
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
  const perfis: PerfilBuscaPublico[] = linhas.map(linha => ({
    name: linha.name,
    role: linha.role,
    city: linha.locationPublic ? linha.city : "",
    handle: linha.handle,
    initials: linha.initials,
    availability: linha.availability,
    genres: JSON.parse(linha.genresJson) as string[],
    categories: JSON.parse(linha.categoriesJson) as string[],
    otherCategory: linha.otherCategory,
    tone: tonsPermitidos.has(linha.tone) ? linha.tone : "yellow",
  }));

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

export function criarNotificacaoCypher(
  dados: DadosNovaNotificacao
): NotificacaoPersistida {
  const notificacao = {
    id: randomUUID(),
    usuarioDestinoId: dados.usuarioDestinoId,
    tipo: dados.tipo.trim(),
    titulo: dados.titulo.trim(),
    mensagem: dados.mensagem?.trim() ?? "",
    url: dados.url?.trim() ?? "",
    entidadeTipo: dados.entidadeTipo?.trim() ?? "",
    entidadeId: dados.entidadeId?.trim() ?? "",
  };
  if (!notificacao.tipo || !notificacao.titulo) {
    throw new Error("Uma notificação precisa de tipo e título.");
  }

  bancoAtivo()
    .prepare(
      `
      INSERT INTO notificacoes (
        id, usuario_destino_id, tipo, titulo, mensagem, url,
        entidade_tipo, entidade_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      notificacao.id,
      notificacao.usuarioDestinoId,
      notificacao.tipo,
      notificacao.titulo,
      notificacao.mensagem,
      notificacao.url,
      notificacao.entidadeTipo,
      notificacao.entidadeId
    );

  return obterNotificacaoPorIdCypher(notificacao.id, dados.usuarioDestinoId)!;
}

function mapearNotificacao(
  linha: Omit<NotificacaoPersistida, "lida"> & { lida: number }
): NotificacaoPersistida {
  return { ...linha, lida: Boolean(linha.lida) };
}

function obterNotificacaoPorIdCypher(
  id: string,
  usuarioDestinoId: string
): NotificacaoPersistida | undefined {
  const linha = bancoAtivo()
    .prepare(
      `
      SELECT
        id,
        usuario_destino_id AS usuarioDestinoId,
        tipo,
        titulo,
        mensagem,
        url,
        entidade_tipo AS entidadeTipo,
        entidade_id AS entidadeId,
        lida,
        criada_em AS criadaEm,
        lida_em AS lidaEm
      FROM notificacoes
      WHERE id = ? AND usuario_destino_id = ?
      `
    )
    .get(id, usuarioDestinoId) as
    (Omit<NotificacaoPersistida, "lida"> & { lida: number }) | undefined;
  return linha ? mapearNotificacao(linha) : undefined;
}

export function listarNotificacoesCypher(
  usuarioDestinoId: string,
  limite = 50
): NotificacaoPersistida[] {
  const limiteSeguro = Math.min(Math.max(Math.trunc(limite), 1), 100);
  const linhas = bancoAtivo()
    .prepare(
      `
      SELECT
        id,
        usuario_destino_id AS usuarioDestinoId,
        tipo,
        titulo,
        mensagem,
        url,
        entidade_tipo AS entidadeTipo,
        entidade_id AS entidadeId,
        lida,
        criada_em AS criadaEm,
        lida_em AS lidaEm
      FROM notificacoes
      WHERE usuario_destino_id = ?
      ORDER BY datetime(criada_em) DESC, id DESC
      LIMIT ?
      `
    )
    .all(usuarioDestinoId, limiteSeguro) as Array<
    Omit<NotificacaoPersistida, "lida"> & { lida: number }
  >;
  return linhas.map(mapearNotificacao);
}

export function contarNotificacoesNaoLidasCypher(
  usuarioDestinoId: string
): number {
  const resultado = bancoAtivo()
    .prepare(
      `
      SELECT COUNT(*) AS total
      FROM notificacoes
      WHERE usuario_destino_id = ? AND lida = 0
      `
    )
    .get(usuarioDestinoId) as { total: number };
  return resultado.total;
}

export function marcarNotificacaoLidaCypher(
  id: string,
  usuarioDestinoId: string
): boolean {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE notificacoes
      SET lida = 1, lida_em = CURRENT_TIMESTAMP
      WHERE id = ? AND usuario_destino_id = ? AND lida = 0
      `
    )
    .run(id, usuarioDestinoId);
  return resultado.changes === 1;
}

export function marcarTodasNotificacoesLidasCypher(
  usuarioDestinoId: string
): number {
  const resultado = bancoAtivo()
    .prepare(
      `
      UPDATE notificacoes
      SET lida = 1, lida_em = CURRENT_TIMESTAMP
      WHERE usuario_destino_id = ? AND lida = 0
      `
    )
    .run(usuarioDestinoId);
  return resultado.changes;
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

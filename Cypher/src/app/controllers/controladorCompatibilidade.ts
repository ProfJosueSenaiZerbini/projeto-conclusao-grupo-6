import type { NextFunction, Request, Response } from "express";
import {
  CypherModel,
  generosObra,
  papeisObra,
  statusObra,
  tiposObra,
  type CreditoObraEntrada,
  type DadosObraCypher,
} from "../models/modeloCypher.js";
import {
  autenticarUsuario,
  cadastrarUsuario,
  encerrarSessao,
  iniciarSessao,
  usuarioDaSessao,
  duracaoSessaoMs,
} from "../models/autenticacaoCypher.js";
import {
  atualizarPerfilCypher,
  atualizarPrivacidadeCypher,
  excluirContaCypher,
  listarObrasPublicasPerfilCypher,
  listarObrasProprietarioCypher,
  obterPerfilPublicoCypher,
  type FiltrosCatalogoObras,
  type UsuarioDaSessao,
} from "../models/bancoDados.js";
import {
  opcoesStatusPorCategoria,
  rotuloStatusProfissional,
  todasOpcoesStatus,
} from "../models/modeloPerfil.js";
import {
  validarEmail,
  validarNomeCadastro,
  validarSenha,
} from "../validators/validarAutenticacao.js";
import { mensagemErroCredito } from "../validators/validarCredito.js";
import {
  validarConfirmacaoExclusao,
  validarSenhaExclusao,
} from "../validators/validarConta.js";
import { validarCategoriaEvento } from "../validators/validarEvento.js";
import { validarBpm, validarLinkEscuta } from "../validators/validarObra.js";
import { listaDeLinhas, validarPerfil } from "../validators/validarPerfil.js";

const nomeCookieSessao = "cypher_session";
const categoriasCadastro = [
  "Rapper / MC",
  "Beatmaker",
  "Produtor musical",
  "DJ",
  "Empreendedor",
  "Organizador de eventos",
  "Outros",
];

function acessoOgDisponivel(): boolean {
  return (
    process.env.CYPHER_ALLOW_OG_ACCESS === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

const caminhosProtegidos = new Set([
  "/",
  "/dashboard",
  "/search",
  "/events",
  "/events/new",
  "/works",
  "/works/new",
  "/beats",
  "/beats/new",
  "/central",
  "/notificacoes",
  "/notificacoes/marcar-todas-lidas",
  "/profile",
  "/settings",
  "/settings/privacy",
  "/settings/delete-account",
]);

function caminhoProtegido(caminho: string): boolean {
  return (
    caminhosProtegidos.has(caminho) ||
    /^\/(?:works|events|beats)\/[^/]+\/(?:edit|delete)$/.test(caminho) ||
    /^\/notificacoes\/[^/]+\/lida$/.test(caminho)
  );
}

function tokenDaRequisicao(req: Request): string | undefined {
  const cookie = req.headers.cookie
    ?.split(";")
    .map(valor => valor.trim())
    .find(valor => valor.startsWith(`${nomeCookieSessao}=`));
  return cookie?.slice(nomeCookieSessao.length + 1);
}

function usuarioDaRequisicao(req: Request): UsuarioDaSessao | undefined {
  const token = tokenDaRequisicao(req);
  return token ? usuarioDaSessao(token) : undefined;
}

function exigeAcesso(req: Request, res: Response): UsuarioDaSessao | undefined {
  const usuario =
    (res.locals.usuario as UsuarioDaSessao | undefined) ??
    usuarioDaRequisicao(req);
  if (caminhoProtegido(req.path) && !usuario) {
    res.redirect("/login");
    return undefined;
  }
  return usuario;
}

function usuarioParaView(usuario: UsuarioDaSessao) {
  return {
    ...usuario,
    availabilityLabel: rotuloStatusProfissional(
      usuario.availability,
      usuario.categories
    ),
  };
}

const ordensCatalogo = [
  { value: "recentes", label: "Mais recentes" },
  { value: "antigas", label: "Mais antigas" },
  { value: "titulo", label: "Título (A–Z)" },
  { value: "lancamento", label: "Data de lançamento" },
  { value: "status", label: "Status" },
] as const;

function chaveCatalogo(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function valorCatalogo(opcoes: readonly string[], recebido: string): string {
  return opcoes.find(opcao => chaveCatalogo(opcao) === recebido) ?? "";
}

function filtrosCatalogo(req: Request): FiltrosCatalogoObras {
  const ordemRecebida = parametroTexto(req, "ordem");
  const ordem: FiltrosCatalogoObras["order"] = ordensCatalogo.some(
    opcao => opcao.value === ordemRecebida
  )
    ? (ordemRecebida as FiltrosCatalogoObras["order"])
    : "recentes";
  return {
    status: valorCatalogo(statusObra, parametroTexto(req, "status")),
    type: valorCatalogo(tiposObra, parametroTexto(req, "tipo")),
    genre: valorCatalogo(generosObra, parametroTexto(req, "genero")),
    role: valorCatalogo(papeisObra, parametroTexto(req, "papel")),
    order: ordem,
  };
}

function gruposCatalogo(obras: ReturnType<typeof CypherModel.obrasDoUsuario>) {
  const grupos = [
    {
      id: "lancadas",
      titulo: "Lançadas",
      descricao: "Obras disponibilizadas publicamente",
      obras: [] as typeof obras,
    },
    {
      id: "producao",
      titulo: "Em produção",
      descricao: "Obras em desenvolvimento",
      obras: [] as typeof obras,
    },
    {
      id: "rascunhos",
      titulo: "Rascunhos",
      descricao: "Obras ainda não finalizadas",
      obras: [] as typeof obras,
    },
    {
      id: "participacoes",
      titulo: "Participações",
      descricao: "Obras de terceiros com seus créditos",
      obras: [] as typeof obras,
    },
    {
      id: "beats",
      titulo: "Beats",
      descricao: "Instrumentais cadastrados",
      obras: [] as typeof obras,
    },
    {
      id: "outros",
      titulo: "Outros projetos",
      descricao: "Demais tipos de trabalho",
      obras: [] as typeof obras,
    },
  ];
  for (const obra of obras) {
    const grupo = !obra.owned
      ? grupos[3]
      : obra.type === "Beat"
        ? grupos[4]
        : obra.status === "Rascunho"
          ? grupos[2]
          : obra.status === "Em produção"
            ? grupos[1]
            : obra.status === "Lançado" && obra.published
              ? grupos[0]
              : grupos[5];
    grupo.obras.push(obra);
  }
  return grupos;
}

function tempoRelativoNotificacao(data: string): string {
  const instante = Date.parse(`${data.replace(" ", "T")}Z`);
  if (!Number.isFinite(instante)) return data;
  const segundos = Math.max(0, Math.floor((Date.now() - instante) / 1000));
  if (segundos < 60) return "agora";
  if (segundos < 3600) return `há ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `há ${Math.floor(segundos / 3600)} h`;
  if (segundos < 604800) return `há ${Math.floor(segundos / 86400)} dias`;
  return new Date(instante).toLocaleDateString("pt-BR");
}

function notificacoesParaView(usuarioId: string, limite = 5) {
  return CypherModel.notificacoes(usuarioId, limite).map(notificacao => ({
    ...notificacao,
    dataRelativa: tempoRelativoNotificacao(notificacao.criadaEm),
  }));
}

function dadosNotificacoes(usuarioId: string) {
  return {
    notificacoesRecentes: notificacoesParaView(usuarioId),
    quantidadeNotificacoesNaoLidas:
      CypherModel.quantidadeNotificacoesNaoLidas(usuarioId),
  };
}

export function middlewareAutorizacao(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!caminhoProtegido(req.path)) return next();

  const usuario = usuarioDaRequisicao(req);
  if (!usuario) return res.redirect("/login");

  res.locals.usuario = usuario;
  Object.assign(res.locals, dadosNotificacoes(usuario.id));
  return next();
}

function definirCookieSessao(req: Request, res: Response, token: string): void {
  const seguro = req.secure;
  res.cookie(nomeCookieSessao, token, {
    httpOnly: true,
    sameSite: seguro ? "none" : "lax",
    secure: seguro,
    path: "/",
    maxAge: duracaoSessaoMs,
  });
}

function substituirSessao(
  req: Request,
  res: Response,
  usuarioId: string
): void {
  const tokenAnterior = tokenDaRequisicao(req);
  if (tokenAnterior) encerrarSessao(tokenAnterior);
  definirCookieSessao(req, res, iniciarSessao(usuarioId));
}

function renderizarCadastro(
  res: Response,
  status: number,
  erro: string,
  dados: {
    nome?: string;
    email?: string;
    categoriasSelecionadas?: string[];
    outraCategoria?: string;
  }
) {
  return res.status(status).render("pages/cadastro", {
    title: "Criar conta",
    path: "/register",
    stylesheet: "autenticacao",
    authenticated: false,
    erro,
    categoriasDisponiveis: categoriasCadastro,
    nome: dados.nome ?? "",
    email: dados.email ?? "",
    categoriasSelecionadas: dados.categoriasSelecionadas ?? [],
    outraCategoria: dados.outraCategoria ?? "",
  });
}

function categoriasRecebidas(valor: unknown): string[] {
  const valores = Array.isArray(valor) ? valor : [valor];
  return [
    ...new Set(
      valores
        .filter((item): item is string => typeof item === "string")
        .map(item => item.trim())
        .filter(Boolean)
    ),
  ];
}

export function paginaAutenticacao(req: Request, res: Response) {
  const cadastro = req.path === "/register";
  const cadastroConcluido = req.query.cadastro === "sucesso";
  const contaExcluida = req.query.conta === "excluida";
  return res.render(cadastro ? "pages/cadastro" : "pages/entrar", {
    title: cadastro ? "Criar conta" : "Entrar",
    path: req.path,
    stylesheet: "autenticacao",
    authenticated: false,
    erro: null,
    mensagem: !cadastro
      ? cadastroConcluido
        ? "Conta criada. Entre com seu e-mail e senha para continuar."
        : contaExcluida
          ? "A conta e o perfil foram excluídos."
          : null
      : null,
    categoriasDisponiveis: categoriasCadastro,
    categoriasSelecionadas: [],
    nome: "",
    email: "",
    outraCategoria: "",
    allowOgAccess: !cadastro && acessoOgDisponivel(),
  });
}

export function renderizarPagina(
  view: string,
  title: string,
  data: Record<string, unknown> | (() => Record<string, unknown>) = {}
) {
  return (req: Request, res: Response) => {
    const usuarioSessao = exigeAcesso(req, res);
    if (caminhosProtegidos.has(req.path) && !usuarioSessao) return;

    const stylesheet = view.split("/").pop();
    const dadosDaPagina = typeof data === "function" ? data() : data;
    return res.render(view, {
      title,
      path: req.path,
      stylesheet,
      authenticated: Boolean(usuarioSessao),
      usuario: usuarioSessao
        ? usuarioParaView(usuarioSessao)
        : CypherModel.usuario(),
      ...dadosDaPagina,
    });
  };
}

function parametroTexto(req: Request, chave: string): string {
  const valor = req.query[chave];
  return typeof valor === "string" ? valor : "";
}

function classeStatusBusca(status: string): string {
  if (status === "indisponivel") return "unavailable";
  if (status.startsWith("disponivel") || status === "recebendo-inscricoes")
    return "available";
  if (status.startsWith("buscando")) return "searching";
  return "unknown";
}

export async function login(req: Request, res: Response) {
  if (req.body.guest === "true") {
    if (!acessoOgDisponivel()) {
      return res.status(401).render("pages/entrar", {
        title: "Entrar",
        path: "/login",
        stylesheet: "autenticacao",
        authenticated: false,
        erro: "E-mail ou senha inválidos. Confira os dados e tente novamente.",
        mensagem: null,
        email: "",
        allowOgAccess: false,
      });
    }
    substituirSessao(req, res, "demo-og-emice");
    return res.redirect("/dashboard");
  }

  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  const senha = String(req.body.password ?? "");
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido || !senha || senha.length > 128 || email.length > 254) {
    return res.status(401).render("pages/entrar", {
      title: "Entrar",
      path: "/login",
      stylesheet: "autenticacao",
      authenticated: false,
      erro: "E-mail ou senha inválidos. Confira os dados e tente novamente.",
      mensagem: null,
      email,
      allowOgAccess: acessoOgDisponivel(),
    });
  }

  try {
    const usuarioId = await autenticarUsuario(email, senha);
    if (!usuarioId) {
      return res.status(401).render("pages/entrar", {
        title: "Entrar",
        path: "/login",
        stylesheet: "autenticacao",
        authenticated: false,
        erro: "E-mail ou senha inválidos. Confira os dados e tente novamente.",
        mensagem: null,
        email,
        allowOgAccess: acessoOgDisponivel(),
      });
    }

    substituirSessao(req, res, usuarioId);
    return res.redirect("/dashboard");
  } catch (erro) {
    console.error("Falha ao autenticar usuário Cypher:", erro);
    return res.status(500).render("pages/entrar", {
      title: "Entrar",
      path: "/login",
      stylesheet: "autenticacao",
      authenticated: false,
      erro: "Não foi possível concluir o acesso agora. Tente novamente.",
      mensagem: null,
      email,
      allowOgAccess: acessoOgDisponivel(),
    });
  }
}

export async function register(req: Request, res: Response) {
  const nome = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "")
    .trim()
    .toLowerCase();
  const senha = String(req.body.password ?? "");
  const categorias = categoriasRecebidas(req.body.categorias);
  const outrasCategorias = String(req.body.outraCategoria ?? "").trim();
  const dadosFormulario = {
    nome,
    email,
    categoriasSelecionadas: categorias,
    outraCategoria: outrasCategorias,
  };

  if (validarNomeCadastro(nome)) {
    return renderizarCadastro(
      res,
      400,
      "Informe um nome entre 2 e 80 caracteres.",
      dadosFormulario
    );
  }
  if (validarEmail(email)) {
    return renderizarCadastro(
      res,
      400,
      "Informe um endereço de e-mail válido.",
      dadosFormulario
    );
  }
  if (validarSenha(senha)) {
    return renderizarCadastro(
      res,
      400,
      "A senha precisa ter entre 8 e 128 caracteres.",
      dadosFormulario
    );
  }
  if (
    categorias.length === 0 ||
    categorias.some(categoria => !categoriasCadastro.includes(categoria))
  ) {
    return renderizarCadastro(
      res,
      400,
      "Selecione pelo menos uma categoria válida.",
      dadosFormulario
    );
  }
  if (
    categorias.includes("Outros") &&
    (outrasCategorias.length < 2 || outrasCategorias.length > 60)
  ) {
    return renderizarCadastro(
      res,
      400,
      "Descreva a outra categoria em até 60 caracteres.",
      dadosFormulario
    );
  }

  try {
    await cadastrarUsuario({
      nome,
      email,
      senha,
      categorias,
      outraCategoria: categorias.includes("Outros") ? outrasCategorias : "",
    });
    return res.redirect(303, "/login?cadastro=sucesso");
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : "";
    if (mensagemErro === "EMAIL_DUPLICADO") {
      return renderizarCadastro(
        res,
        409,
        "Este e-mail já está cadastrado. Entre na sua conta ou use outro e-mail.",
        dadosFormulario
      );
    }

    console.error("Falha ao criar conta Cypher:", erro);
    return renderizarCadastro(
      res,
      500,
      "Não foi possível criar sua conta agora. Tente novamente.",
      dadosFormulario
    );
  }
}

export function logout(req: Request, res: Response) {
  const token = tokenDaRequisicao(req);
  if (token) encerrarSessao(token);
  res.clearCookie(nomeCookieSessao, {
    path: "/",
    httpOnly: true,
    sameSite: req.secure ? "none" : "lax",
    secure: req.secure,
  });
  return res.redirect("/login");
}

export const analisarCategoria = (req: Request, res: Response) => {
  const categoria = String(req.body.categoria ?? "").trim();
  if (validarCategoriaEvento(categoria)) {
    return res.status(400).json({
      status: "invalida",
      mensagem: "Descreva a categoria para solicitar uma análise.",
    });
  }
  return res.json({
    status: "demonstracao",
    mensagem: `A proposta “${categoria}” parece compatível com um perfil profissional e pode seguir para avaliação. Esta é uma pré-análise simulada; a categoria não foi oficializada no protótipo.`,
  });
};

export const visaoGeral = renderizarPagina(
  "pages/visao-geral",
  "Visão geral",
  () => ({
    eventos: CypherModel.eventos(),
    pessoas: CypherModel.pessoas(),
    estatisticasObras: CypherModel.estatisticasObras(),
    hitDoMes: CypherModel.hitDoMes(),
  })
);
export const buscarPessoas = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;

  const resultado = CypherModel.buscarPessoasPublicas(
    {
      q: parametroTexto(req, "q"),
      categoria: parametroTexto(req, "categoria"),
      genero: parametroTexto(req, "genero"),
      localizacao: parametroTexto(req, "localizacao"),
    },
    usuario.id
  );
  const pessoas = resultado.pessoas.map(pessoa => {
    const categories = pessoa.categories.flatMap(categoria =>
      categoria === "Outros" && pessoa.otherCategory
        ? [pessoa.otherCategory]
        : [categoria]
    );
    return {
      ...pessoa,
      availabilityLabel: rotuloStatusProfissional(
        pessoa.availability,
        pessoa.categories
      ),
      statusClass: classeStatusBusca(pessoa.availability),
      categoryLabels: categories,
      publicSlug: pessoa.handle.replace(/^@/, ""),
    };
  });
  const filtrosAtivos = Object.values(resultado.filtros).some(Boolean);

  return res.render("pages/busca-pessoas", {
    title: "Buscar pessoas",
    path: req.path,
    stylesheet: "busca-pessoas",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    pessoas,
    filtros: resultado.filtros,
    opcoesFiltros: resultado.opcoes,
    filtrosAtivos,
  });
};
export const oportunidades = renderizarPagina(
  "pages/oportunidades",
  "Oportunidades",
  () => ({ eventos: CypherModel.eventos() })
);
type ValoresFormularioObra = {
  titulo: string;
  tipo: string;
  genero: string;
  status: string;
  descricao: string;
  letra: string;
  bpm: string;
  papel: string;
  isrc: string;
  iswc: string;
  dataLancamento: string;
  link: string;
};

type LinhaCreditoPerfilFormulario = {
  handle: string;
  papel: string;
  participacao: string;
};

type LinhaMencaoFormulario = {
  nome: string;
  papel: string;
  participacao: string;
};

const formularioObraVazio: ValoresFormularioObra = {
  titulo: "",
  tipo: "",
  genero: "",
  status: "Em produção",
  descricao: "",
  letra: "",
  bpm: "",
  papel: "Artista principal",
  isrc: "",
  iswc: "",
  dataLancamento: "",
  link: "",
};

function formularioObraRecebido(req: Request): ValoresFormularioObra {
  return {
    titulo: String(req.body.titulo ?? "").trim(),
    tipo: String(req.body.tipo ?? "").trim(),
    genero: String(req.body.genero ?? "").trim(),
    status: String(req.body.status ?? "").trim(),
    descricao: String(req.body.descricao ?? "").trim(),
    letra: String(req.body.letra ?? "").trim(),
    bpm: String(req.body.bpm ?? "").trim(),
    papel: String(req.body.papel ?? "").trim(),
    isrc: String(req.body.isrc ?? "").trim(),
    iswc: String(req.body.iswc ?? "").trim(),
    dataLancamento: String(req.body.dataLancamento ?? "").trim(),
    link: String(req.body.link ?? "").trim(),
  };
}

function camposRepetidos(req: Request, nome: string): string[] {
  const valor = (req.body as Record<string, unknown>)[nome];
  const valores = Array.isArray(valor)
    ? valor
    : valor === undefined
      ? []
      : [valor];
  return valores.map(item => (typeof item === "string" ? item.trim() : ""));
}

function linhasRepetidas<T extends Record<string, string>>(
  req: Request,
  campos: Record<keyof T, string>
): { linhas: T[]; alinhadas: boolean } {
  const valores = Object.fromEntries(
    Object.entries(campos).map(([chave, nome]) => [
      chave,
      camposRepetidos(req, nome),
    ])
  ) as Record<keyof T, string[]>;
  const comprimentos = Object.values(valores).map(lista => lista.length);
  const tamanho = Math.max(0, ...comprimentos);
  const alinhadas = comprimentos.every(comprimento => comprimento === tamanho);
  const linhas = Array.from({ length: tamanho }, (_, indice) =>
    Object.fromEntries(
      Object.entries(valores).map(([chave, lista]) => [
        chave,
        lista[indice] ?? "",
      ])
    )
  ) as T[];
  return { linhas, alinhadas };
}

function preencherFormularioObra(
  obra: NonNullable<ReturnType<typeof CypherModel.obraDoUsuario>>
): ValoresFormularioObra {
  return {
    titulo: obra.title,
    tipo: obra.type,
    genero: obra.genre,
    status: obra.status,
    descricao: obra.description,
    letra: obra.lyrics,
    bpm: obra.bpm,
    papel: obra.role,
    isrc: obra.isrc,
    iswc: obra.iswc,
    dataLancamento: obra.releaseDate,
    link: obra.listenLink,
  };
}

function creditosDoFormulario(
  obra?: NonNullable<ReturnType<typeof CypherModel.obraDoUsuario>> | undefined
) {
  if (!obra) return { perfis: [], mencoes: [] };
  return {
    perfis: obra.creditDetails
      .filter(credito => credito.handle)
      .map(credito => ({
        handle: credito.handle ?? "",
        papel: credito.role,
        participacao: credito.participation,
      })),
    mencoes: obra.creditDetails
      .filter(credito => !credito.handle)
      .map(credito => ({
        nome: credito.name,
        papel: credito.role,
        participacao: credito.participation,
      })),
  };
}

function renderizarFormularioObra(
  res: Response,
  usuario: UsuarioDaSessao,
  opcoes: {
    status?: number;
    editando?: boolean;
    obraId?: string;
    erro?: string | null;
    valores?: ValoresFormularioObra;
    creditosPerfil?: LinhaCreditoPerfilFormulario[];
    mencoesFantasma?: LinhaMencaoFormulario[];
  } = {}
) {
  const editando = opcoes.editando ?? false;
  return res.status(opcoes.status ?? 200).render("pages/cadastro-obra", {
    title: editando ? "Editar obra" : "Cadastrar obra",
    path: "/works",
    stylesheet: "cadastro-obra",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    mensagem: null,
    erro: opcoes.erro ?? null,
    editando,
    obraId: opcoes.obraId ?? "",
    valores: opcoes.valores ?? formularioObraVazio,
    tiposObra,
    generosObra,
    statusObra,
    papeisObra,
    perfisParaCredito: CypherModel.perfisParaCredito(usuario.id),
    creditosPerfil: opcoes.creditosPerfil ?? [],
    mencoesFantasma: opcoes.mencoesFantasma ?? [],
  });
}

function validarFormularioObra(valores: ValoresFormularioObra): string | null {
  if (valores.titulo.length < 2 || valores.titulo.length > 120)
    return "Informe um título entre 2 e 120 caracteres.";
  if (!tiposObra.includes(valores.tipo))
    return "Selecione um tipo de lançamento válido.";
  if (!generosObra.includes(valores.genero))
    return "Selecione um gênero válido.";
  if (!statusObra.includes(valores.status))
    return "Selecione um status válido.";
  if (!papeisObra.includes(valores.papel))
    return "Selecione seu papel principal na obra.";
  if (valores.descricao.length > 500)
    return "A descrição deve ter até 500 caracteres.";
  if (valores.letra.length > 5000)
    return "As letras e observações devem ter até 5.000 caracteres.";
  const erroBpm = validarBpm(valores.bpm);
  if (erroBpm) return erroBpm;
  if (valores.isrc.length > 20 || valores.iswc.length > 20)
    return "ISRC e ISWC devem ter no máximo 20 caracteres cada.";
  if (
    valores.dataLancamento &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(valores.dataLancamento) ||
      Number.isNaN(Date.parse(`${valores.dataLancamento}T00:00:00Z`)) ||
      new Date(`${valores.dataLancamento}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== valores.dataLancamento)
  ) {
    return "Informe uma data de lançamento válida.";
  }
  const erroLink = validarLinkEscuta(valores.link);
  if (erroLink) return erroLink;
  return null;
}

function validarCreditosObra(
  creditosPerfil: LinhaCreditoPerfilFormulario[],
  mencoesFantasma: LinhaMencaoFormulario[],
  perfisAlinhados: boolean,
  mencoesAlinhadas: boolean
): string | null {
  if (!perfisAlinhados || !mencoesAlinhadas)
    return "Revise os dados de cada crédito e tente novamente.";
  if (creditosPerfil.length + mencoesFantasma.length > 20)
    return "Cada obra pode ter até 20 créditos associados.";
  if (
    creditosPerfil.some(
      credito =>
        !/^@[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(credito.handle) ||
        credito.papel.length < 2 ||
        credito.papel.length > 80 ||
        credito.participacao.length > 30
    )
  ) {
    return "Informe para cada perfil Cypher um identificador, uma função e uma participação de até 30 caracteres.";
  }
  if (
    mencoesFantasma.some(
      credito =>
        credito.nome.length < 2 ||
        credito.nome.length > 100 ||
        credito.papel.length < 2 ||
        credito.papel.length > 80 ||
        credito.participacao.length > 30
    )
  ) {
    return "Cada menção precisa de nome e crédito; a participação pode ter até 30 caracteres.";
  }
  const handles = creditosPerfil.map(credito =>
    credito.handle.toLocaleLowerCase("pt-BR")
  );
  if (new Set(handles).size !== handles.length)
    return "O mesmo perfil Cypher não pode ser adicionado duas vezes.";
  const nomes = mencoesFantasma.map(credito =>
    credito.nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
  );
  if (new Set(nomes).size !== nomes.length)
    return "Remova menções repetidas da lista de créditos.";
  return null;
}

function dadosPersistidosObra(valores: ValoresFormularioObra): DadosObraCypher {
  return {
    title: valores.titulo,
    type: valores.tipo,
    genre: valores.genero,
    status: valores.status,
    role: valores.papel,
    description: valores.descricao,
    lyrics: valores.letra,
    bpm: valores.bpm,
    isrc: valores.isrc.toLocaleUpperCase("pt-BR"),
    iswc: valores.iswc.toLocaleUpperCase("pt-BR"),
    releaseDate: valores.dataLancamento,
    listenLink: valores.link,
  };
}

function entradasCreditosObra(
  creditosPerfil: LinhaCreditoPerfilFormulario[],
  mencoesFantasma: LinhaMencaoFormulario[]
): CreditoObraEntrada[] {
  return [
    ...creditosPerfil.map(credito => ({
      handle: credito.handle,
      name: "",
      role: credito.papel,
      participation: credito.participacao,
    })),
    ...mencoesFantasma.map(credito => ({
      handle: null,
      name: credito.nome,
      role: credito.papel,
      participation: credito.participacao,
    })),
  ];
}

function valoresDeCreditosRecebidos(req: Request) {
  const perfis = linhasRepetidas<LinhaCreditoPerfilFormulario>(req, {
    handle: "perfilCreditoHandle",
    papel: "perfilCreditoPapel",
    participacao: "perfilCreditoParticipacao",
  });
  const mencoes = linhasRepetidas<LinhaMencaoFormulario>(req, {
    nome: "mencaoFantasmaNome",
    papel: "mencaoFantasmaPapel",
    participacao: "mencaoFantasmaParticipacao",
  });
  return {
    creditosPerfil: perfis.linhas.filter(linha =>
      Object.values(linha).some(Boolean)
    ),
    mencoesFantasma: mencoes.linhas.filter(linha =>
      Object.values(linha).some(Boolean)
    ),
    perfisAlinhados: perfis.alinhadas,
    mencoesAlinhadas: mencoes.alinhadas,
  };
}

export const obras = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  const mensagens: Record<string, string> = {
    criada: "A obra foi cadastrada.",
    atualizada: "As alterações da obra foram salvas.",
    excluida: "A obra e seus créditos associados foram removidos.",
  };
  const resultado = parametroTexto(req, "resultado");
  const filtros = filtrosCatalogo(req);
  const obrasDoCatalogo = CypherModel.obrasDoUsuario(usuario.id, filtros);
  return res.render("pages/obras", {
    title: "Obras",
    path: req.path,
    stylesheet: "obras",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    obras: obrasDoCatalogo,
    catalogoGrupos: gruposCatalogo(obrasDoCatalogo),
    filtrosCatalogo: {
      status: filtros.status ? chaveCatalogo(filtros.status) : "",
      tipo: filtros.type ? chaveCatalogo(filtros.type) : "",
      genero: filtros.genre ? chaveCatalogo(filtros.genre) : "",
      papel: filtros.role ? chaveCatalogo(filtros.role) : "",
      ordem: filtros.order,
    },
    opcoesFiltroCatalogo: {
      status: statusObra.map(valor => ({
        label: valor,
        value: chaveCatalogo(valor),
      })),
      tipo: tiposObra.map(valor => ({
        label: valor,
        value: chaveCatalogo(valor),
      })),
      genero: generosObra.map(valor => ({
        label: valor,
        value: chaveCatalogo(valor),
      })),
      papel: papeisObra.map(valor => ({
        label: valor,
        value: chaveCatalogo(valor),
      })),
      ordem: ordensCatalogo,
    },
    estatisticasObras: CypherModel.estatisticasObrasDoUsuario(usuario.id),
    mensagem: mensagens[resultado] ?? null,
  });
};

export const novaObra = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);
  return renderizarFormularioObra(res, usuario);
};

export const editarObra = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);
  const obra = CypherModel.obraDoUsuario(req.params.id ?? "", usuario.id);
  if (!obra) return res.sendStatus(404);
  const creditos = creditosDoFormulario(obra);
  return renderizarFormularioObra(res, usuario, {
    editando: true,
    obraId: obra.id,
    valores: preencherFormularioObra(obra),
    creditosPerfil: creditos.perfis,
    mencoesFantasma: creditos.mencoes,
  });
};

function processarFormularioObra(req: Request, res: Response, editar: boolean) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);

  const valores = formularioObraRecebido(req);
  const creditos = valoresDeCreditosRecebidos(req);
  const erro =
    validarFormularioObra(valores) ??
    validarCreditosObra(
      creditos.creditosPerfil,
      creditos.mencoesFantasma,
      creditos.perfisAlinhados,
      creditos.mencoesAlinhadas
    );
  const obraId = editar ? (req.params.id ?? "") : "";
  if (erro) {
    return renderizarFormularioObra(res, usuario, {
      status: 400,
      editando: editar,
      obraId,
      erro,
      valores,
      creditosPerfil: creditos.creditosPerfil,
      mencoesFantasma: creditos.mencoesFantasma,
    });
  }

  try {
    const dados = dadosPersistidosObra(valores);
    const entradas = entradasCreditosObra(
      creditos.creditosPerfil,
      creditos.mencoesFantasma
    );
    if (editar) {
      const atualizado = CypherModel.atualizarObra(
        obraId,
        usuario.id,
        dados,
        entradas
      );
      if (!atualizado) return res.sendStatus(404);
      return res.redirect(303, "/works?resultado=atualizada");
    }
    CypherModel.criarObra(usuario.id, dados, entradas);
    return res.redirect(303, "/works?resultado=criada");
  } catch (erroGravacao) {
    const mensagemCredito = mensagemErroCredito(erroGravacao);
    if (!mensagemCredito) {
      console.error("Falha ao salvar obra Cypher:", erroGravacao);
    }
    return renderizarFormularioObra(res, usuario, {
      status: mensagemCredito ? 400 : 500,
      editando: editar,
      obraId,
      erro:
        mensagemCredito ??
        "Não foi possível salvar a obra agora. Confira os dados e tente novamente.",
      valores,
      creditosPerfil: creditos.creditosPerfil,
      mencoesFantasma: creditos.mencoesFantasma,
    });
  }
}

export const criarObra = (req: Request, res: Response) =>
  processarFormularioObra(req, res, false);

export const atualizarObra = (req: Request, res: Response) =>
  processarFormularioObra(req, res, true);

export const excluirObra = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);
  const excluida = CypherModel.excluirObra(req.params.id ?? "", usuario.id);
  if (!excluida) return res.sendStatus(404);
  return res.redirect(303, "/works?resultado=excluida");
};
export const bancoBeats = renderizarPagina(
  "pages/banco-beats",
  "Banco de Beats",
  () => ({
    beats: CypherModel.beats(),
  })
);
export const central = renderizarPagina("pages/central", "Cypher Central", {
  faqs: CypherModel.faqs(),
});
function valoresPerfil(usuario: UsuarioDaSessao) {
  return {
    nome: usuario.name,
    cidade: usuario.city,
    biografia: usuario.biography,
    contato: usuario.contact,
    categorias: usuario.categories,
    outraCategoria: usuario.otherCategory,
    generos: usuario.genres.join("\n"),
    equipamentos: usuario.equipment.join("\n"),
    disponibilidade: usuario.availability,
  };
}

function renderizarPerfil(
  res: Response,
  usuario: UsuarioDaSessao,
  opcoes: {
    status?: number;
    editando?: boolean;
    erro?: string | null;
    salvo?: boolean;
    valores?: ReturnType<typeof valoresPerfil>;
  } = {}
) {
  return res.status(opcoes.status ?? 200).render("pages/perfil", {
    title: "Meu perfil",
    path: "/profile",
    stylesheet: "perfil",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    obras: listarObrasProprietarioCypher(usuario.id),
    categoriasDisponiveis: categoriasCadastro,
    statusOptions: todasOpcoesStatus(),
    editando: opcoes.editando ?? false,
    erro: opcoes.erro ?? null,
    salvo: opcoes.salvo ?? false,
    valores: opcoes.valores ?? valoresPerfil(usuario),
    publicSlug: usuario.handle.replace(/^@/, ""),
  });
}

export const perfil = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  return renderizarPerfil(res, usuario, {
    editando: req.query.editar === "1",
    salvo: req.query.salvo === "1",
  });
};

export const configuracoes = (req: Request, res: Response) => {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;

  const erros: Record<string, string> = {
    senha: "A senha informada não confere. A conta continua ativa.",
    confirmacao: "Digite EXCLUIR para confirmar o encerramento da conta.",
    registros:
      "Antes de encerrar a conta, remova ou transfira suas obras, eventos e beats próprios.",
    indisponivel: "Não foi possível encerrar a conta agora. Tente novamente.",
  };
  return res.render("pages/configuracoes", {
    title: "Configurações",
    path: "/settings",
    stylesheet: "configuracoes",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    mensagem:
      req.query.privacidade === "salva"
        ? "As preferências de visibilidade foram atualizadas."
        : null,
    erro: erros[String(req.query.erro ?? "")] ?? null,
  });
};

export const perfilPublico = (req: Request, res: Response) => {
  const slug = String(req.params.identificador ?? "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return res.status(404).render("pages/perfil-publico", {
      title: "Perfil indisponível",
      stylesheet: "perfil",
      perfil: null,
      obras: [],
    });
  }

  const perfilPublico = obterPerfilPublicoCypher(`@${slug}`);
  if (!perfilPublico) {
    return res.status(404).render("pages/perfil-publico", {
      title: "Perfil indisponível",
      stylesheet: "perfil",
      perfil: null,
      obras: [],
    });
  }

  return res.render("pages/perfil-publico", {
    title: perfilPublico.name,
    stylesheet: "perfil",
    perfil: {
      ...perfilPublico,
      availabilityLabel: rotuloStatusProfissional(
        perfilPublico.availability,
        perfilPublico.categories
      ),
    },
    obras: listarObrasPublicasPerfilCypher(perfilPublico.handle),
  });
};

export function atualizarPerfil(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);

  const nome = String(req.body.nome ?? "").trim();
  const cidade = String(req.body.cidade ?? "").trim();
  const biografia = String(req.body.biografia ?? "").trim();
  const contato = String(req.body.contato ?? "").trim();
  const categorias = categoriasRecebidas(req.body.categorias);
  const outraCategoria = String(req.body.outraCategoria ?? "").trim();
  const disponibilidade = String(req.body.disponibilidade ?? "").trim();
  const generosTexto = String(req.body.generos ?? "");
  const equipamentosTexto = String(req.body.equipamentos ?? "");
  const generos = listaDeLinhas(generosTexto, 8, 40);
  const equipamentos = listaDeLinhas(equipamentosTexto, 12, 80);
  const valores = {
    nome,
    cidade,
    biografia,
    contato,
    categorias,
    outraCategoria,
    generos: generosTexto,
    equipamentos: equipamentosTexto,
    disponibilidade,
  };
  const statusPermitidos = opcoesStatusPorCategoria(categorias);

  const erro = validarPerfil({
    nome,
    cidade,
    biografia,
    contato,
    categorias,
    outraCategoria,
    disponibilidade,
    generos,
    equipamentos,
    categoriasDisponiveis: categoriasCadastro,
    statusPermitidos,
  });

  if (erro) {
    return renderizarPerfil(res, usuario, {
      status: 400,
      editando: true,
      erro,
      valores,
    });
  }

  const funcao = categorias
    .map(categoria =>
      categoria === "Outros" ? `Outros: ${outraCategoria}` : categoria
    )
    .join(" · ");
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(parte => parte[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("");

  try {
    const atualizado = atualizarPerfilCypher({
      id: usuario.id,
      name: nome,
      role: funcao,
      city: cidade,
      biography: biografia,
      contact: contato,
      availability: disponibilidade,
      genres: generos.itens,
      categories: categorias,
      otherCategory: categorias.includes("Outros") ? outraCategoria : "",
      equipment: equipamentos.itens,
      initials: iniciais,
      tipoConta: categorias.includes("Organizador de eventos")
        ? "organizador"
        : "profissional",
    });
    if (!atualizado) return res.sendStatus(404);
    return res.redirect(303, "/profile?salvo=1");
  } catch (erroAtualizacao) {
    console.error("Falha ao atualizar perfil Cypher:", erroAtualizacao);
    return renderizarPerfil(res, usuario, {
      status: 500,
      editando: true,
      erro: "Não foi possível salvar o perfil agora. Tente novamente.",
      valores,
    });
  }
}

export function atualizarPrivacidade(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao) return res.sendStatus(403);

  const atualizado = atualizarPrivacidadeCypher(usuario.id, {
    profilePublic: req.body.perfilPublico === "on",
    locationPublic: req.body.localizacaoPublica === "on",
    contactPublic: req.body.contatoPublico === "on",
  });
  if (!atualizado) return res.sendStatus(404);
  return res.redirect(303, "/settings?privacidade=salva");
}

export async function excluirConta(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  if (usuario.demonstracao || !usuario.email) return res.sendStatus(403);
  if (validarConfirmacaoExclusao(req.body.confirmacao)) {
    return res.redirect(303, "/settings?erro=confirmacao");
  }
  const senha = String(req.body.password ?? "");
  if (validarSenhaExclusao(senha)) {
    return res.redirect(303, "/settings?erro=senha");
  }

  try {
    const usuarioAutenticado = await autenticarUsuario(usuario.email, senha);
    if (usuarioAutenticado !== usuario.id) {
      return res.redirect(303, "/settings?erro=senha");
    }

    const resultado = excluirContaCypher(usuario.id);
    if (!resultado.excluida) {
      return res.redirect(
        303,
        resultado.obras || resultado.eventos || resultado.beats
          ? "/settings?erro=registros"
          : "/settings?erro=indisponivel"
      );
    }

    const token = tokenDaRequisicao(req);
    if (token) encerrarSessao(token);
    res.clearCookie(nomeCookieSessao, {
      path: "/",
      httpOnly: true,
      sameSite: req.secure ? "none" : "lax",
      secure: req.secure,
    });
    return res.redirect(303, "/login?conta=excluida");
  } catch (erro) {
    console.error("Falha ao encerrar conta Cypher:", erro);
    return res.redirect(303, "/settings?erro=indisponivel");
  }
}

export function paginaNotificacoes(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;

  return res.render("pages/notificacoes", {
    title: "Notificações",
    path: "/notificacoes",
    stylesheet: "notificacoes",
    authenticated: true,
    usuario: usuarioParaView(usuario),
    notificacoes: notificacoesParaView(usuario.id, 100),
    quantidadeNotificacoesNaoLidas: CypherModel.quantidadeNotificacoesNaoLidas(
      usuario.id
    ),
  });
}

function respostaAcaoNotificacao(
  req: Request,
  res: Response,
  sucesso: boolean
) {
  if (req.get("accept")?.includes("application/json")) {
    return res.json({ sucesso });
  }
  return res.redirect(303, "/notificacoes");
}

export function marcarNotificacaoLida(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  const id = String(req.params.id ?? "").trim();
  if (!id || id.length > 120) return respostaAcaoNotificacao(req, res, false);
  const sucesso = CypherModel.marcarNotificacaoLida(id, usuario.id);
  return respostaAcaoNotificacao(req, res, sucesso);
}

export function marcarTodasNotificacoesLidas(req: Request, res: Response) {
  const usuario = exigeAcesso(req, res);
  if (!usuario) return;
  CypherModel.marcarTodasNotificacoesLidas(usuario.id);
  return respostaAcaoNotificacao(req, res, true);
}

export type GrupoProfissional = {
  id: string;
  rotulo: string;
  profissoes: readonly ProfissaoCatalogo[];
};

export type ProfissaoCatalogo = {
  id: string;
  rotulo: string;
  grupoId: string;
};

/**
 * Catálogo-alvo da reestruturação profissional.
 *
 * Este catálogo é a fonte canônica de profissões e rótulos do produto.
 */
export const catalogoProfissional: readonly GrupoProfissional[] = [
  {
    id: "musica",
    rotulo: "Música",
    profissoes: [
      { id: "rapper", rotulo: "Rapper", grupoId: "musica" },
      { id: "mc", rotulo: "MC", grupoId: "musica" },
      { id: "compositor", rotulo: "Compositor(a)", grupoId: "musica" },
      { id: "letrista", rotulo: "Letrista", grupoId: "musica" },
      { id: "beatmaker", rotulo: "Beatmaker", grupoId: "musica" },
      { id: "produtor", rotulo: "Produtor(a)", grupoId: "musica" },
      { id: "dj", rotulo: "DJ", grupoId: "musica" },
      { id: "freestyler", rotulo: "Freestyler", grupoId: "musica" },
    ],
  },
  {
    id: "danca",
    rotulo: "Dança",
    profissoes: [
      { id: "b-boy-b-girl", rotulo: "B-boy / B-girl", grupoId: "danca" },
      { id: "dancarino", rotulo: "Dançarino(a)", grupoId: "danca" },
      { id: "coreografo", rotulo: "Coreógrafo(a)", grupoId: "danca" },
    ],
  },
  {
    id: "artes-visuais",
    rotulo: "Artes visuais",
    profissoes: [
      { id: "grafiteiro", rotulo: "Grafiteiro(a)", grupoId: "artes-visuais" },
      { id: "ilustrador", rotulo: "Ilustrador(a)", grupoId: "artes-visuais" },
      { id: "designer-grafico", rotulo: "Designer gráfico", grupoId: "artes-visuais" },
      { id: "muralista", rotulo: "Muralista", grupoId: "artes-visuais" },
      { id: "artista-digital", rotulo: "Artista digital", grupoId: "artes-visuais" }
    ],
  },
  { id: "audiovisual", rotulo: "Audiovisual", profissoes: 
    [
      { id: "fotografo", rotulo: "Fotógrafo(a)", grupoId: "audiovisual" },
      { id: "videomaker", rotulo: "Videomaker", grupoId: "audiovisual" },
      {
        id: "diretor-audiovisual",
        rotulo: "Diretor(a) audiovisual",
        grupoId: "audiovisual",
      },
      {
        id: "editor-video",
        rotulo: "Editor(a) de vídeo",
        grupoId: "audiovisual",
      },
    ],
  },
  {
    id: "producao-tecnica",
    rotulo: "Produção técnica",
    profissoes: [
      {
        id: "engenheiro-audio",
        rotulo: "Engenheiro(a) de áudio",
        grupoId: "producao-tecnica",
      },
      { id: "mixador", rotulo: "Mixador(a)", grupoId: "producao-tecnica" },
      {
        id: "masterizador",
        rotulo: "Masterizador(a)",
        grupoId: "producao-tecnica",
      },
    ],
  },
  {
    id: "gestao-producao",
    rotulo: "Gestão e produção",
    profissoes: [
      { id: "empresario", rotulo: "Empresário(a)", grupoId: "gestao-producao" },
      { id: "manager", rotulo: "Manager", grupoId: "gestao-producao" },
      {
        id: "produtor-cultural",
        rotulo: "Produtor(a) cultural",
        grupoId: "gestao-producao",
      },
      {
        id: "produtor-executivo",
        rotulo: "Produtor(a) executivo(a)",
        grupoId: "gestao-producao",
      },
      {
        id: "organizador-eventos",
        rotulo: "Organizador(a) de eventos",
        grupoId: "gestao-producao",
      },
    ],
  },
  {
    id: "comunicacao-cultura",
    rotulo: "Comunicação e cultura",
    profissoes: [
      {
        id: "criador-conteudo",
        rotulo: "Criador(a) de conteúdo",
        grupoId: "comunicacao-cultura",
      },
      {
        id: "jornalista-cultural",
        rotulo: "Jornalista cultural",
        grupoId: "comunicacao-cultura",
      },
      { id: "podcaster", rotulo: "Podcaster", grupoId: "comunicacao-cultura" },
      {
        id: "critico-musical",
        rotulo: "Crítico(a) musical",
        grupoId: "comunicacao-cultura",
      },
      {
        id: "social-media",
        rotulo: "Social media",
        grupoId: "comunicacao-cultura",
      },
      { id: "educador", rotulo: "Educador(a)", grupoId: "comunicacao-cultura" },
      {
        id: "pesquisador-cultural",
        rotulo: "Pesquisador(a) cultural",
        grupoId: "comunicacao-cultura",
      },
      {
        id: "articulador-cultural",
        rotulo: "Articulador(a) cultural",
        grupoId: "comunicacao-cultura",
      },
    ],
  },
];

export const profissoesCatalogo = catalogoProfissional.flatMap(
  grupo => grupo.profissoes
);

export function listarGruposProfissionais(): readonly GrupoProfissional[] {
  return catalogoProfissional;
}

export function listarProfissoesCatalogo(): readonly ProfissaoCatalogo[] {
  return profissoesCatalogo;
}

export function obterProfissaoCatalogo(
  id: string
): ProfissaoCatalogo | undefined {
  return profissoesCatalogo.find(profissao => profissao.id === id);
}

export type OpcaoStatusProfissional = {
  value: string;
  label: string;
  categorias: string[];
};

type StatusComCategorias = OpcaoStatusProfissional & {
  categorias: readonly string[];
};

export const categoriasGerais = [
  "Rapper",
  "MC",
  "Letrista",
  "Compositor(a)",
  "Beatmaker",
  "Produtor(a)",
  "DJ",
  "Freestyler",
  "B-boy / B-girl",
  "Dançarino(a)",
  "Coreógrafo(a)",
  "Grafiteiro(a)",
  "Ilustrador(a)",
  "Designer gráfico",
  "Muralista",
  "Artista digital",
  "Fotógrafo(a)",
  "Videomaker",
  "Diretor(a) audiovisual",
  "Editor(a) de vídeo",
  "Engenheiro(a) de áudio",
  "Mixador(a)",
  "Masterizador(a)",
  "Empresário(a)",
  "Manager",
  "Produtor(a) cultural",
  "Produtor(a) executivo(a)",
  "Organizador(a) de eventos",
  "Criador(a) de conteúdo",
  "Jornalista cultural",
  "Podcaster",
  "Crítico(a) musical",
  "Social media",
  "Educador(a)",
  "Pesquisador(a) cultural",
  "Articulador(a) cultural",
  "Compositor",
  "Empresário",
  "Organizador de eventos",
  "Outros",
];

export type CategoriaProfissional = (typeof categoriasGerais)[number];

export function temCategoria(
  categorias: readonly string[],
  categoria: CategoriaProfissional
): boolean {
  return categorias.includes(categoria);
}

export function podeCriarBeat(categorias: readonly string[]): boolean {
  return temCategoria(categorias, "Beatmaker");
}

export function podeCriarObra(categorias: readonly string[]): boolean {
  return ["Rapper", "MC", "Beatmaker", "Produtor(a)", "DJ"].some(categoria =>
    categorias.includes(categoria)
  );
}

export function podeCriarEvento(categorias: readonly string[]): boolean {
  return categorias.some(categoria =>
    ["Organizador(a) de eventos", "Organizador de eventos"].includes(categoria)
  );
}

const statusProfissionais: readonly StatusComCategorias[] = [
  {
    value: "buscando-feats",
    label: "Buscando feats e colaborações",
    categorias: ["Rapper", "MC"],
  },
  {
    value: "disponivel-apresentacoes",
    label: "Disponível para apresentações",
    categorias: ["Rapper", "MC", "DJ"],
  },
  {
    value: "buscando-producao",
    label: "Buscando beats ou produção musical",
    categorias: ["Rapper", "MC"],
  },
  {
    value: "disponivel-producao",
    label: "Disponível para produzir",
    categorias: ["Beatmaker", "Produtor(a)"],
  },
  {
    value: "buscando-artistas",
    label: "Buscando artistas para colaboração",
    categorias: ["Beatmaker", "Produtor(a)"],
  },
  {
    value: "disponivel-eventos",
    label: "Disponível para eventos",
    categorias: ["DJ"],
  },
  {
    value: "buscando-parcerias",
    label: "Buscando parcerias profissionais",
    categorias: ["Empresário"],
  },
  {
    value: "recebendo-inscricoes",
    label: "Recebendo inscrições para eventos",
    categorias: ["Organizador de eventos"],
  },
  {
    value: "buscando-profissionais-eventos",
    label: "Buscando profissionais para eventos",
    categorias: ["Organizador de eventos"],
  },
  {
    value: "disponivel-colaboracao",
    label: "Disponível para novos projetos",
    categorias: categoriasGerais,
  },
  {
    value: "indisponivel",
    label: "Indisponível no momento",
    categorias: categoriasGerais,
  },
];

export function opcoesStatusPorCategoria(
  categorias: readonly string[]
): OpcaoStatusProfissional[] {
  const selecionadas = new Set(categorias);
  const temCategoriaPersonalizada = categorias.some(
    categoria => !categoriasGerais.includes(categoria as CategoriaProfissional)
  );
  return statusProfissionais
    .filter(
      status =>
        status.categorias.some(categoria => selecionadas.has(categoria)) ||
        (temCategoriaPersonalizada &&
          ["disponivel-colaboracao", "indisponivel"].includes(status.value))
    )
    .map(({ value, label, categorias: categoriasStatus }) => ({
      value,
      label,
      categorias: [
        ...categoriasStatus,
        ...(temCategoriaPersonalizada &&
        ["disponivel-colaboracao", "indisponivel"].includes(value)
          ? categorias.filter(
              categoria =>
                !categoriasGerais.includes(categoria as CategoriaProfissional)
            )
          : []),
      ],
    }));
}

export function todasOpcoesStatus(): OpcaoStatusProfissional[] {
  return statusProfissionais.map(({ value, label, categorias }) => ({
    value,
    label,
    categorias: [...categorias],
  }));
}

export function rotuloStatusProfissional(
  status: string,
  categorias: readonly string[]
): string {
  return (
    opcoesStatusPorCategoria(categorias).find(opcao => opcao.value === status)
      ?.label ?? "Disponibilidade não informada"
  );
}

export type OpcaoStatusProfissional = {
  value: string;
  label: string;
  categorias: string[];
};

type StatusComCategorias = OpcaoStatusProfissional & {
  categorias: readonly string[];
};

const categoriasGerais = [
  "Rapper / MC",
  "Beatmaker",
  "Produtor musical",
  "DJ",
  "Empreendedor",
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

export function podeCriarEvento(categorias: readonly string[]): boolean {
  return temCategoria(categorias, "Organizador de eventos");
}

const statusProfissionais: readonly StatusComCategorias[] = [
  {
    value: "buscando-feats",
    label: "Buscando feats e colaborações",
    categorias: ["Rapper / MC"],
  },
  {
    value: "disponivel-apresentacoes",
    label: "Disponível para apresentações",
    categorias: ["Rapper / MC", "DJ"],
  },
  {
    value: "buscando-producao",
    label: "Buscando beats ou produção musical",
    categorias: ["Rapper / MC"],
  },
  {
    value: "disponivel-producao",
    label: "Disponível para produzir",
    categorias: ["Beatmaker", "Produtor musical"],
  },
  {
    value: "buscando-artistas",
    label: "Buscando artistas para colaboração",
    categorias: ["Beatmaker", "Produtor musical"],
  },
  {
    value: "disponivel-eventos",
    label: "Disponível para eventos",
    categorias: ["DJ"],
  },
  {
    value: "buscando-parcerias",
    label: "Buscando parcerias profissionais",
    categorias: ["Empreendedor"],
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
  return statusProfissionais
    .filter(status =>
      status.categorias.some(categoria => selecionadas.has(categoria))
    )
    .map(({ value, label, categorias: categoriasStatus }) => ({
      value,
      label,
      categorias: [...categoriasStatus],
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

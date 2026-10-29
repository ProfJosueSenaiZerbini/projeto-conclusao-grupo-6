export function listaDeLinhas(
  valor: unknown,
  limite: number,
  maximoPorItem: number
) {
  const texto = typeof valor === "string" ? valor : "";
  const itens = texto
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
  return {
    itens: [...new Set(itens)],
    valida:
      itens.length <= limite &&
      itens.every(item => item.length <= maximoPorItem),
  };
}

export type DadosPerfilValidacao = {
  nome: string;
  cidade: string;
  biografia: string;
  contato: string;
  categorias: string[];
  outraCategoria: string;
  disponibilidade: string;
  generos: { valida: boolean };
  equipamentos: { valida: boolean };
  categoriasDisponiveis: string[];
  statusPermitidos: Array<{ value: string }>;
};

export function validarPerfil(dados: DadosPerfilValidacao): string | null {
  if (dados.nome.length < 2 || dados.nome.length > 80)
    return "Informe um nome artístico entre 2 e 80 caracteres.";
  if (dados.cidade.length > 100)
    return "A cidade deve ter no máximo 100 caracteres.";
  if (dados.biografia.length > 500)
    return "A biografia deve ter no máximo 500 caracteres.";
  if (dados.contato.length > 200)
    return "O contato deve ter no máximo 200 caracteres.";
  if (
    dados.categorias.length === 0 ||
    dados.categorias.some(
      categoria => !dados.categoriasDisponiveis.includes(categoria)
    )
  )
    return "Selecione pelo menos uma categoria profissional válida.";
  if (!dados.generos.valida)
    return "Informe até 8 gêneros, com no máximo 40 caracteres cada.";
  if (!dados.equipamentos.valida)
    return "Informe até 12 equipamentos, com no máximo 80 caracteres cada.";
  if (
    dados.disponibilidade &&
    !dados.statusPermitidos.some(opcao => opcao.value === dados.disponibilidade)
  )
    return "Escolha um status compatível com suas categorias profissionais.";
  return null;
}

export const categoriasEvento = [
  "Batalha",
  "Cypher",
  "Workshop",
  "Show",
  "Outro",
] as const;

export const situacoesEvento = [
  "Inscrições abertas",
  "Acontece em breve",
  "Vagas limitadas",
  "Pré-inscrições abertas",
  "Encerrado",
] as const;

export const coresEvento = ["yellow", "green", "cream"] as const;

export type ValoresFormularioEvento = {
  titulo: string;
  categoria: string;
  data: string;
  horario: string;
  local: string;
  organizador: string;
  situacao: string;
  cor: string;
  descricao: string;
  formato: string;
  inscricao: string;
  premio: string;
  etiquetas: string;
};

export function validarCategoriaEvento(categoria: unknown): string | null {
  return typeof categoria !== "string" || !categoria.trim()
    ? "Descreva a categoria para solicitar uma análise."
    : null;
}

export function validarFormularioEvento(
  valores: ValoresFormularioEvento
): string | null {
  if (valores.titulo.length < 2 || valores.titulo.length > 120)
    return "Informe um título entre 2 e 120 caracteres.";
  if (
    !categoriasEvento.includes(
      valores.categoria as (typeof categoriasEvento)[number]
    )
  )
    return "Selecione uma categoria de evento válida.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valores.data))
    return "Informe uma data válida para o evento.";
  const data = new Date(`${valores.data}T00:00:00Z`);
  if (Number.isNaN(data.getTime()))
    return "Informe uma data válida para o evento.";
  if (valores.horario.length > 20)
    return "O horário deve ter no máximo 20 caracteres.";
  if (valores.local.length < 2 || valores.local.length > 160)
    return "Informe um local entre 2 e 160 caracteres.";
  if (valores.organizador.length < 2 || valores.organizador.length > 120)
    return "Informe um organizador entre 2 e 120 caracteres.";
  if (
    !situacoesEvento.includes(
      valores.situacao as (typeof situacoesEvento)[number]
    )
  )
    return "Selecione uma situação válida para o evento.";
  if (!coresEvento.includes(valores.cor as (typeof coresEvento)[number]))
    return "Selecione uma cor válida para o evento.";
  if (valores.descricao.length > 1000)
    return "A descrição deve ter no máximo 1.000 caracteres.";
  if (valores.formato.length < 2 || valores.formato.length > 120)
    return "Informe um formato entre 2 e 120 caracteres.";
  if (valores.inscricao.length > 240)
    return "As informações de inscrição devem ter no máximo 240 caracteres.";
  if (valores.premio.length > 240)
    return "O destaque ou prêmio deve ter no máximo 240 caracteres.";
  const etiquetas = valores.etiquetas
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  if (etiquetas.length > 8 || etiquetas.some(item => item.length > 30))
    return "Informe até 8 etiquetas, com no máximo 30 caracteres cada.";
  return null;
}

export function etiquetasDoFormulario(valor: string): string[] {
  return [
    ...new Set(
      valor
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

export function validarTextoLimitado(
  valor: string,
  limite: number,
  mensagem: string
): string | null {
  return valor.length > limite ? mensagem : null;
}

export function validarBpm(bpm: string): string | null {
  if (!bpm) return null;
  return /^\d+$/.test(bpm) && Number(bpm) >= 30 && Number(bpm) <= 300
    ? null
    : "O BPM deve ser um número inteiro entre 30 e 300.";
}

export function validarLinkEscuta(link: string): string | null {
  if (!link) return null;
  if (link.length > 500) return "O link deve ter no máximo 500 caracteres.";
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:"
      ? null
      : "Use um link HTTP ou HTTPS válido.";
  } catch {
    return "Informe um link de escuta válido.";
  }
}

export const licencasBeat = [
  "Uso gratuito",
  "Uso comercial",
  "Exclusivo",
  "Personalizado",
] as const;

export function validarLicencaBeat(licenca: string): string | null {
  return licencasBeat.includes(licenca as (typeof licencasBeat)[number])
    ? null
    : "Selecione uma licença válida para o beat.";
}

export function validarDuracaoBeat(duracao: string): string | null {
  if (!duracao) return null;
  return /^\d{1,2}:[0-5]\d$/.test(duracao)
    ? null
    : "Informe a duração no formato mm:ss.";
}

/** Atualiza apenas o trecho preenchido da faixa nos navegadores Blink/WebKit. */
export function atualizarFaixa(campo) {
  const min = campo.min === "" ? 0 : Number(campo.min);
  const max = campo.max === "" ? 100 : Number(campo.max);
  const valor = campo.valueAsNumber;
  const razao =
    max > min && Number.isFinite(valor)
      ? Math.max(0, Math.min(1, (valor - min) / (max - min)))
      : 0;
  const progresso = (razao * 100).toFixed(3) + "%";
  if (campo.style.getPropertyValue("--cy-range-progresso") !== progresso)
    campo.style.setProperty("--cy-range-progresso", progresso);
}

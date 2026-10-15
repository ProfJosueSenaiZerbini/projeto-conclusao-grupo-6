/* Módulo ES do frontend Cypher. */
(() => {
  const atualizarInteresse = interessado => {
    document.querySelectorAll("[data-interest-button]").forEach(botao => {
      botao.setAttribute("aria-pressed", String(interessado));
      const rotulo = botao.querySelector("[data-interest-label]");
      if (rotulo)
        rotulo.textContent = interessado
          ? "Interesse demonstrado"
          : "Demonstrar interesse";
      botao.classList.toggle("is-interested", interessado);
    });
    document.querySelectorAll("[data-interest-notice]").forEach(aviso => {
      aviso.hidden = !interessado;
    });
  };
  document.querySelectorAll("[data-interest-button]").forEach(botao => {
    botao.addEventListener("click", () => {
      const novoEstado = botao.getAttribute("aria-pressed") !== "true";
      atualizarInteresse(novoEstado);
    });
  });

  document.querySelectorAll("[data-event-filter]").forEach(botao => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.eventFilter;
      document.querySelectorAll("[data-event-filter]").forEach(outro => {
        const ativo = outro === botao;
        outro.classList.toggle("active", ativo);
        outro.setAttribute("aria-pressed", String(ativo));
      });
      document.querySelectorAll("[data-event-card]").forEach(cartao => {
        cartao.hidden =
          filtro !== "Todos" && cartao.dataset.eventCategory !== filtro;
      });
    });
  });
})();

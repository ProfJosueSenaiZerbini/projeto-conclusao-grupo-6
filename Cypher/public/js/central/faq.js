/* Módulo ES do frontend Cypher. */
(() => {
  document
    .querySelector("[data-central-search]")
    ?.addEventListener("submit", evento => {
      evento.preventDefault();
      const campo = evento.currentTarget.querySelector("input");
      const consulta = campo.value.trim().toLocaleLowerCase("pt-BR");
      document.querySelectorAll("[data-faq-item]").forEach(item => {
        item.hidden = !item.textContent
          .toLocaleLowerCase("pt-BR")
          .includes(consulta);
      });
    });
})();

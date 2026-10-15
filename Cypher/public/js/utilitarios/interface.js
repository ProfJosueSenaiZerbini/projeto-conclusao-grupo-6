/* Módulo ES do frontend Cypher. */
(() => {
  const criarAviso = mensagem => {
    const aviso = document.createElement("div");
    aviso.className = "mvc-toast";
    aviso.setAttribute("role", "status");
    aviso.textContent = mensagem;
    document.body.appendChild(aviso);
    window.setTimeout(() => aviso.remove(), 2800);
  };

  document.addEventListener("click", evento => {
    const botaoAviso = evento.target.closest("[data-toast]");
    if (botaoAviso) {
      evento.preventDefault();
      criarAviso(botaoAviso.dataset.toast);
    }
  });

  document.querySelectorAll("[data-filter]").forEach(campo => {
    campo.addEventListener("input", () => {
      const consulta = campo.value.trim().toLocaleLowerCase("pt-BR");
      document.querySelectorAll("[data-search-item]").forEach(item => {
        item.hidden = !item.textContent
          .toLocaleLowerCase("pt-BR")
          .includes(consulta);
      });
    });
  });

  document.querySelectorAll("[data-faq]").forEach(botao => {
    botao.addEventListener("click", () => {
      const item = botao.closest(".faq-item");
      const aberto = item.classList.toggle("open");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });
})();

/* Módulo ES do frontend Cypher. */
(() => {
  const linksConfiguracao = [
    ...document.querySelectorAll("[data-settings-link]"),
  ];
  const atualizarSecaoConfiguracao = linkAtivo => {
    linksConfiguracao.forEach(link => {
      const ativo = link === linkAtivo;
      link.classList.toggle("active", ativo);
      if (ativo) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  linksConfiguracao.forEach(link => {
    link.addEventListener("click", () => atualizarSecaoConfiguracao(link));
  });
  const sincronizarSecaoConfiguracao = () => {
    const link = linksConfiguracao.find(
      item => item.getAttribute("href") === window.location.hash
    );
    if (link) atualizarSecaoConfiguracao(link);
  };
  window.addEventListener("hashchange", sincronizarSecaoConfiguracao);
  sincronizarSecaoConfiguracao();

  const aplicarTema = tema => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    document.querySelectorAll("[data-theme-mode]").forEach(botao => {
      botao.setAttribute(
        "aria-pressed",
        String(botao.dataset.themeMode === tema)
      );
    });
    try {
      window.localStorage.setItem("cypher-tema", tema);
    } catch {
      /* armazenamento pode estar bloqueado */
    }
  };
  let temaSalvo = "light";
  try {
    temaSalvo =
      window.localStorage.getItem("cypher-tema") === "dark" ? "dark" : "light";
  } catch {
    /* usa o tema claro padrão */
  }
  aplicarTema(temaSalvo);
  document.querySelectorAll("[data-theme-mode]").forEach(botao => {
    botao.addEventListener("click", () => aplicarTema(botao.dataset.themeMode));
  });
})();

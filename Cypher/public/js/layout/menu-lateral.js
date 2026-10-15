/* Módulo ES do frontend Cypher. */
(() => {
  const barraLateral = document.querySelector(".sidebar");
  const camadaMenu = document.querySelector(
    "[data-sidebar-close].mobile-overlay"
  );
  const fecharMenu = () => {
    barraLateral?.classList.remove("sidebar-open");
    document.body.classList.remove("sidebar-visible");
    if (camadaMenu) camadaMenu.hidden = true;
  };
  document.querySelectorAll("[data-sidebar-open]").forEach(botao => {
    botao.addEventListener("click", () => {
      barraLateral?.classList.add("sidebar-open");
      document.body.classList.add("sidebar-visible");
      if (camadaMenu) camadaMenu.hidden = false;
      barraLateral?.querySelector(".mobile-close")?.focus();
    });
  });
  document.querySelectorAll("[data-sidebar-close]").forEach(botao => {
    botao.addEventListener("click", fecharMenu);
  });
  barraLateral?.querySelectorAll("a.side-link").forEach(link => {
    link.addEventListener("click", fecharMenu);
  });
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharMenu();
  });
})();

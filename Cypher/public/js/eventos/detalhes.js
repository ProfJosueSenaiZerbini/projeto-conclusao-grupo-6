/* Módulo ES do frontend Cypher. */
import { abrirDialogo, definirTexto } from "../utilitarios/dialogos.js";

(() => {
  document.querySelectorAll("[data-event-card]").forEach(cartao => {
    cartao.addEventListener("click", () => {
      const dialogo = document.getElementById("detalhe-oportunidade");
      if (!dialogo) return;
      const dados = cartao.dataset;
      definirTexto(dialogo, "[data-event-title-detail]", dados.detailTitle);
      definirTexto(
        dialogo,
        "[data-event-category-detail]",
        dados.detailCategory
      );
      definirTexto(dialogo, "[data-event-date-detail]", dados.detailDate);
      definirTexto(dialogo, "[data-event-time-detail]", dados.detailTime);
      definirTexto(
        dialogo,
        "[data-event-location-detail]",
        dados.detailLocation
      );
      definirTexto(dialogo, "[data-event-org-detail]", dados.detailOrg);
      definirTexto(
        dialogo,
        "[data-event-description-detail]",
        dados.detailDescription
      );
      definirTexto(dialogo, "[data-event-format-detail]", dados.detailFormat);
      definirTexto(
        dialogo,
        "[data-event-registration-detail]",
        dados.detailRegistration
      );
      definirTexto(dialogo, "[data-event-prize-detail]", dados.detailPrize);
      const listaTags = dialogo.querySelector("[data-event-tags-detail]");
      if (listaTags) {
        listaTags.replaceChildren();
        (dados.detailTags ?? "")
          .split("|")
          .filter(Boolean)
          .forEach(tag => {
            const elemento = document.createElement("span");
            elemento.textContent = tag;
            listaTags.appendChild(elemento);
          });
      }
      abrirDialogo(dialogo, cartao);
    });
  });
})();

/* Módulo ES do frontend Cypher. */
import { abrirDialogo, definirTexto } from "../utilitarios/dialogos.js";

(() => {
  document.querySelectorAll("[data-beat-detail]").forEach(botao => {
    botao.addEventListener("click", () => {
      const dialogo = document.getElementById("detalhe-beat");
      if (!dialogo) return;
      const dados = botao.dataset;
      const campos = {
        "[data-beat-title-detail]": "beatTitle",
        "[data-beat-producer-detail]": "beatProducer",
        "[data-beat-bpm-detail]": "beatBpm",
        "[data-beat-key-detail]": "beatKey",
        "[data-beat-genre-detail]": "beatGenre",
        "[data-beat-license-detail]": "beatLicense",
        "[data-beat-duration-detail]": "beatDuration",
        "[data-beat-description-detail]": "beatDescription",
        "[data-beat-usage-detail]": "beatUsage",
      };
      Object.entries(campos).forEach(([seletor, chave]) =>
        definirTexto(dialogo, seletor, dados[chave])
      );
      const exclusivo = dialogo.querySelector("[data-beat-exclusive-detail]");
      if (exclusivo instanceof HTMLElement) {
        exclusivo.hidden = dados.beatExclusive !== "true";
      }
      const ofertas = dialogo.querySelector("[data-beat-ofertas-detail]");
      if (ofertas) {
        ofertas.replaceChildren();
        let lista = [];
        try {
          lista = JSON.parse(decodeURIComponent(dados.beatOfertas ?? ""));
        } catch {
          lista = [];
        }
        if (lista.length === 0) {
          const vazio = document.createElement("p");
          vazio.textContent = "Nenhuma oferta cadastrada.";
          ofertas.append(vazio);
        } else {
          lista.forEach(oferta => {
            const item = document.createElement("div");
            item.className = "beat-offer-detail";
            const titulo = document.createElement("strong");
            titulo.textContent = oferta.tipo;
            const preco = document.createElement("span");
            preco.textContent =
              oferta.precoCentavos === null
                ? "Preço sob consulta"
                : `R$ ${(oferta.precoCentavos / 100).toFixed(2).replace(".", ",")}`;
            const descricao = document.createElement("small");
            descricao.textContent =
              oferta.descricao || "Sem descrição adicional.";
            item.append(titulo, preco, descricao);
            ofertas.append(item);
          });
        }
      }
      abrirDialogo(dialogo, botao);
    });
  });
})();

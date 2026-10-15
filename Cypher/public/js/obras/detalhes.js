/* Módulo ES do frontend Cypher. */
import { abrirDialogo, definirTexto } from "../utilitarios/dialogos.js";

(() => {
  document.querySelectorAll("[data-work-card]").forEach(cartao => {
    cartao.addEventListener("click", () => {
      const dialogo = document.getElementById("detalhe-obra");
      if (!dialogo) return;
      const dados = cartao.dataset;
      const campos = {
        "[data-work-title-detail]": "workTitle",
        "[data-work-type-detail]": "workType",
        "[data-work-status-detail]": "workStatus",
        "[data-work-meta-detail]": "workMeta",
        "[data-work-role-detail]": "workRole",
        "[data-work-credits-detail]": "workCredits",
        "[data-work-description-detail]": "workDescription",
        "[data-work-bpm-detail]": "workBpm",
        "[data-work-isrc-detail]": "workIsrc",
        "[data-work-iswc-detail]": "workIswc",
      };
      Object.entries(campos).forEach(([seletor, chave]) =>
        definirTexto(dialogo, seletor, dados[chave])
      );
      const listaCreditos = dialogo.querySelector("[data-work-credit-list]");
      if (listaCreditos) {
        listaCreditos.replaceChildren();
        let creditos = [];
        try {
          creditos = JSON.parse(
            decodeURIComponent(dados.workCreditDetails || "")
          );
        } catch {
          creditos = [];
        }
        if (creditos.length === 0) {
          const vazio = document.createElement("p");
          vazio.textContent = "Nenhum crédito associado.";
          listaCreditos.appendChild(vazio);
        } else {
          creditos.forEach(credito => {
            const linha = document.createElement("div");
            linha.className = "work-credit-detail";
            const pessoa = document.createElement("strong");
            pessoa.textContent = credito.name;
            const funcao = document.createElement("span");
            funcao.textContent = credito.role;
            const participacao = document.createElement("small");
            const estado = credito.verified
              ? "Confirmado"
              : credito.userId
                ? "Crédito não confirmado"
                : "Menção sem perfil vinculado";
            participacao.textContent = [credito.participation, estado]
              .filter(Boolean)
              .join(" · ");
            linha.append(pessoa, funcao, participacao);
            listaCreditos.appendChild(linha);
          });
        }
      }

      const linkEscuta = dialogo.querySelector("[data-work-listen-link]");
      if (linkEscuta) {
        linkEscuta.hidden = true;
        linkEscuta.removeAttribute("href");
        if (dados.workLink) {
          try {
            const url = new URL(dados.workLink);
            if (url.protocol === "http:" || url.protocol === "https:") {
              linkEscuta.href = url.href;
              linkEscuta.hidden = false;
            }
          } catch {
            // Links inválidos não são exibidos.
          }
        }
      }

      const id = encodeURIComponent(dados.workId || "");
      const obraDoUsuario = dados.workOwned === "true";
      const editar = dialogo.querySelector("[data-work-edit]");
      if (editar) {
        editar.href = `/works/${id}/edit`;
        editar.hidden = !obraDoUsuario;
      }
      const excluir = dialogo.querySelector("[data-work-delete]");
      if (excluir) {
        excluir.action = `/works/${id}/delete`;
        excluir.hidden = !obraDoUsuario;
        excluir.onsubmit = evento => {
          if (!window.confirm("Excluir esta obra e os créditos associados?")) {
            evento.preventDefault();
          }
        };
      }
      abrirDialogo(dialogo, cartao);
    });
  });
})();

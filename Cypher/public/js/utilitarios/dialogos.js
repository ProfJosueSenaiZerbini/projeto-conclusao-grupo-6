/* Utilitários compartilhados pelos dialogs do frontend Cypher. */

const dialogos = new Map();

const definirTexto = (dialogo, seletor, valor) => {
  dialogo.querySelectorAll(seletor).forEach(elemento => {
    elemento.textContent = valor ?? "";
  });
};

const abrirDialogo = (dialogo, acionador) => {
  if (!dialogo) return;
  dialogos.set(dialogo, acionador);
  if (typeof dialogo.showModal === "function") dialogo.showModal();
  else dialogo.setAttribute("open", "");
  dialogo.querySelector("[data-dialog-close]")?.focus();
};

const inicializarFechamentoDialogos = () => {
  document.querySelectorAll("[data-dialog-close]").forEach(botao => {
    botao.addEventListener("click", () => botao.closest("dialog")?.close());
  });
  document.querySelectorAll("dialog.detail-dialog").forEach(dialogo => {
    dialogo.addEventListener("click", evento => {
      if (evento.target === dialogo) dialogo.close();
    });
    dialogo.addEventListener("close", () => dialogos.get(dialogo)?.focus());
  });
};

export { abrirDialogo, definirTexto, inicializarFechamentoDialogos };

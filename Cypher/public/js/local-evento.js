const form = document.querySelector("[data-local-evento]")?.closest("form");
if (form) {
  const { elements } = form;
  const panel = form.querySelector("[data-endereco-evento]");
  const status = form.querySelector("[data-local-status]");
  const preview = form.querySelector("[data-local-preview]");
  const frame = preview.querySelector("iframe");
  const confirm = preview.querySelector("button");
  const consulta = [...panel.querySelectorAll("[data-local-consulta]")];
  let pedido, candidato;
  const valores = () =>
    Object.fromEntries(
      ["cep", "rua", "numero", "bairro", "cidade", "uf"].map(nome => [
        nome,
        elements[nome].value,
      ])
    );
  const limpar = () => {
    pedido?.abort();
    pedido = undefined;
    consulta.forEach(b => (b.disabled = false));
    candidato = undefined;
    elements.provaLocal.value = "";
    preview.hidden = true;
    frame.removeAttribute("src");
    status.textContent = "";
  };
  const mostrarModo = () => {
    const endereco = elements.modoLocal.value === "endereco";
    panel.hidden = !endereco;
    panel.disabled = !endereco;
    const texto = elements.local.closest("label");
    texto.hidden = endereco;
    elements.local.disabled = endereco;
    elements.local.required = !endereco;
    for (const nome of ["rua", "cidade", "uf"])
      elements[nome].required = endereco;
  };
  mostrarModo();
  elements.modoLocal.addEventListener("change", () => {
    limpar();
    mostrarModo();
  });
  panel.addEventListener("input", event => {
    if (
      event.target.matches("input, select") &&
      event.target !== elements.provaLocal
    ) {
      const tinhaPonto =
        elements.provaLocal.value || panel.dataset.confirmado === "true";
      limpar();
      if (tinhaPonto)
        status.textContent =
          "Se mudar o endereço, confira o novo ponto antes de publicar.";
    }
  });
  for (const botao of consulta) {
    botao.addEventListener("click", async () => {
      limpar();
      const atual = new AbortController();
      pedido = atual;
      const acao = botao.dataset.localConsulta;
      consulta.forEach(b => (b.disabled = true));
      status.textContent =
        acao === "cep" ? "Buscando o CEP…" : "Localizando o endereço…";
      try {
        const resposta = await fetch("/eventos/localizacao", {
          method: "POST",
          signal: atual.signal,
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": elements._csrf.value,
          },
          body: JSON.stringify({ acao, ...valores() }),
        });
        const d = await resposta.json();
        if (pedido !== atual) return;
        if (!resposta.ok) {
          status.textContent =
            d.mensagem || "Não foi possível buscar o endereço.";
          return;
        }
        if (acao === "cep") {
          const mudouRua =
            elements.rua.value && elements.rua.value !== d.endereco.rua;
          if (mudouRua) elements.numero.value = "";
          for (const nome of ["rua", "bairro", "cidade", "uf"])
            elements[nome].value = d.endereco[nome];
          status.textContent = d.endereco.rua
            ? "Endereço preenchido. Complete o número e confira os dados."
            : "Este CEP não informou a rua. Complete os campos manualmente.";
          (d.endereco.rua ? elements.numero : elements.rua).focus();
        } else {
          candidato = d.prova;
          frame.src = d.mapa;
          preview.hidden = false;
          status.textContent =
            "Confira se o pino marca o local certo. Só confirme se estiver correto.";
        }
      } catch (erro) {
        if (pedido === atual && erro.name !== "AbortError")
          status.textContent =
            "A consulta falhou. Tente novamente ou preencha manualmente.";
      } finally {
        if (pedido === atual) {
          pedido = undefined;
          consulta.forEach(b => (b.disabled = false));
        }
      }
    });
  }
  confirm.addEventListener("click", () => {
    if (!candidato) return;
    elements.provaLocal.value = candidato;
    preview.hidden = true;
    status.textContent =
      "Ponto confirmado. Ele será salvo ao publicar o evento.";
    status.focus();
  });
}

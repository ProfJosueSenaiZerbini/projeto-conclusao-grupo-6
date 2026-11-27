const endpoint = "/perfil/completar/dados";
for (const raiz of document.querySelectorAll("[data-completar-perfil]")) {
  const $ = s => raiz.querySelector(s);
  const abrir = $("[data-cp-abrir]"),
    dialogo = $("dialog.cp-dialog");
  const form = $("[data-cp-form]"),
    campo = $("[data-cp-campo]"),
    foto = $("[data-cp-foto]");
  const titulo = $("[data-cp-pergunta]"),
    estado = $("[data-cp-estado]");
  const salvar = $("[data-cp-salvar]"),
    pular = $("[data-cp-pular]"),
    concluir = $("[data-cp-concluir]");
  let sessao,
    atual,
    pendencias = [],
    dados,
    ocupada = false,
    total = 0,
    avancos = 0;
  const puladas = new Set();
  const criar = (tipo, texto = "") => {
    const el = document.createElement(tipo);
    el.textContent = texto;
    return el;
  };

  function montarEscolhas(opcoes, nome, tipo, selectTempo) {
    const grupo = criar("div");
    grupo.className = "cp-escolhas";
    const listaTempo = criar("div");
    for (const opcao of opcoes) {
      const rotulo = criar("label", opcao.rotulo);
      const input = criar("input");
      input.type = tipo;
      input.name = nome;
      input.value = opcao.valor;
      rotulo.prepend(input);
      grupo.append(rotulo);
      if (!selectTempo || !opcao.tempo?.length) continue;
      const tempo = criar("label", "Tempo em " + opcao.rotulo);
      const seletor = criarSelect(opcao.tempo);
      seletor.name = "tempo";
      seletor.dataset.categoria = opcao.valor;
      seletor.required = true;
      seletor.disabled = tempo.hidden = true;
      tempo.append(seletor);
      listaTempo.append(tempo);
      input.addEventListener("change", () => {
        seletor.disabled = tempo.hidden = !input.checked;
      });
    }
    campo.append(grupo);
    if (selectTempo) campo.append(listaTempo);
  }

  function criarSelect(opcoes) {
    const select = criar("select");
    select.name = "valor";
    select.required = true;
    const guia = criar("option", "Selecione uma opção");
    guia.value = "";
    select.append(guia);
    for (const elem of opcoes) {
      const opcao = criar("option", elem.rotulo);
      opcao.value = elem.valor;
      select.append(opcao);
    }
    return select;
  }

  function mostrar() {
    campo.replaceChildren();
    estado.textContent = "";
    atual = pendencias.find(item => !puladas.has(item.id));
    foto.hidden = atual?.tipo !== "foto";
    salvar.hidden = !atual || atual.tipo === "foto";
    pular.hidden = !atual;
    concluir.hidden = Boolean(atual);
    $("[data-cp-etapa]").textContent = atual
      ? "Etapa " + (avancos + 1) + " de " + Math.max(total, avancos + 1)
      : dados.percentual + "% completo";
    if (!atual) {
      titulo.textContent = pendencias.length
        ? "Você pode continuar depois"
        : "Perfil completo";
      estado.textContent = pendencias.length
        ? "O que você salvou foi mantido. As demais informações continuam pendentes."
        : "Todas as informações essenciais foram preenchidas.";
      titulo.focus();
      return;
    }
    titulo.textContent = atual.rotulo;
    if (atual.tipo === "tempo") {
      const select = criarSelect(atual.opcoes);
      select.setAttribute("aria-label", atual.rotulo);
      campo.append(select);
    } else if (atual.tipo === "profissoes" || atual.tipo === "estilos") {
      montarEscolhas(
        atual.opcoes,
        "valor",
        "checkbox",
        atual.tipo === "profissoes"
      );
    } else if (atual.tipo !== "foto") {
      const rotulos = {
        cidade: ["Cidade e estado", "Ex.: Campinas, SP", 100],
        biografia: ["Biografia", "Conte um pouco sobre sua trajetória.", 500],
        competencias: [
          "Competências",
          "Uma competência por linha, até 12.",
          1000,
        ],
        contato: [
          "Contato profissional",
          "E-mail profissional, Instagram ou outro canal",
          200,
        ],
      }[atual.tipo];
      const label = criar("label", rotulos[0]);
      const input = criar(
        ["biografia", "competencias"].includes(atual.tipo)
          ? "textarea"
          : "input"
      );
      if (input.tagName === "TEXTAREA") input.rows = 4;
      input.name = "valor";
      input.value = atual.valor || "";
      input.placeholder = rotulos[1];
      input.maxLength = rotulos[2];
      input.required = true;
      label.append(input);
      campo.append(label);
    }
    titulo.focus();
  }

  function ocupado(v) {
    ocupada = v;
    salvar.disabled = pular.disabled = v;
  }

  async function sincronizar() {
    const r = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok || r.redirected)
      throw Error("Não foi possível consultar as pendências. Tente novamente.");
    dados = await r.json();
    pendencias = dados.etapas;
    $("progress").value = dados.percentual;
    $("[data-cp-percentual]").textContent = dados.percentual + "% completo";
    abrir.hidden = !pendencias.length;
  }

  abrir.addEventListener("click", async e => {
    if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (ocupada || dialogo.open) return;
    sessao = Symbol();
    const token = sessao;
    puladas.clear();
    avancos = 0;
    dialogo.showModal();
    titulo.textContent = "Carregando pendências…";
    campo.replaceChildren();
    foto.hidden = pular.hidden = salvar.hidden = concluir.hidden = true;
    estado.textContent = "";
    ocupado(true);
    try {
      await sincronizar();
      if (sessao !== token || !dialogo.open) return;
      total = pendencias.length;
      mostrar();
    } catch (erro) {
      if (dialogo.open) estado.textContent = erro.message;
    } finally {
      ocupado(false);
    }
  });
  $("[data-cp-fechar]").addEventListener("click", () => dialogo.close());
  concluir.addEventListener("click", () => dialogo.close());
  dialogo.addEventListener("close", () => {
    sessao = null;
    if (dados && !pendencias.length) raiz.hidden = true;
    else abrir.focus();
  });
  pular.addEventListener("click", () => {
    if (!atual || ocupada) return;
    puladas.add(atual.id);
    avancos++;
    mostrar();
  });
  async function avancar() {
    await sincronizar();
    avancos++;
    total = avancos + pendencias.filter(item => !puladas.has(item.id)).length;
    if (dialogo.open) mostrar();
    else if (!pendencias.length) raiz.hidden = true;
  }
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!atual || ocupada || atual.tipo === "foto") return;
    const campos = new FormData(form);
    const lista = ["profissoes", "estilos"].includes(atual.tipo);
    const valor = lista ? campos.getAll("valor") : campos.get("valor");
    if (lista && !valor.length) {
      estado.textContent = "Escolha pelo menos uma opção ou pule esta etapa.";
      return;
    }
    const tempos = Object.fromEntries(
      [...campo.querySelectorAll("select[data-categoria]:not(:disabled)")].map(
        el => [el.dataset.categoria, el.value]
      )
    );
    ocupado(true);
    estado.textContent = "Salvando…";
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-Token": raiz.dataset.csrf,
        },
        body: JSON.stringify({ id: atual.id, valor, tempos }),
      });
      if (!r.ok || r.redirected)
        throw Error(
          (await r.json().catch(() => null))?.erro ||
            "Não foi possível salvar. Tente novamente."
        );
      await avancar();
    } catch (erro) {
      estado.textContent = erro.message;
    } finally {
      ocupado(false);
    }
  });
  raiz.addEventListener("perfil-imagem-salva", async e => {
    if (e.detail.finalidade !== "imagem") return;
    ocupado(true);
    try {
      await avancar();
    } catch (erro) {
      estado.textContent =
        "A foto foi salva. Reabra o assistente para continuar.";
    } finally {
      ocupado(false);
    }
  });
}

(() => {
  for (const [formIndex, form] of [...document.querySelectorAll("[data-cy-wizard]")].entries()) {
    const passos = [...form.querySelectorAll(":scope > [data-cy-step]")];
    if (passos.length < 2) continue;
    const final = form.querySelector(":scope > [data-cy-finish]");
    const extras = [...form.parentElement.querySelectorAll(":scope > [data-cy-show-with]")];
    const nav = document.createElement("nav");
    nav.className = "cy-steps";
    nav.setAttribute("aria-label", "Etapas do formulário");
    const cabecalho = document.createElement("div");
    cabecalho.className = "cy-steps-header";
    const progresso = document.createElement("p");
    const modo = botao("Ver tudo", "data-cy-step-mode");
    cabecalho.append(progresso, modo);
    const lista = document.createElement("ul");
    const aviso = document.createElement("p");
    aviso.className = "cy-steps-error";
    aviso.setAttribute("role", "alert");
    aviso.hidden = true;
    nav.append(cabecalho, lista, aviso);

    function botao(texto, atributo) {
      const elemento = document.createElement("button");
      elemento.type = "button";
      elemento.textContent = texto;
      if (atributo) elemento.setAttribute(atributo, "");
      return elemento;
    }

    const botoes = passos.map((passo, i) => {
      if (!passo.id) passo.id = "cy-etapa-" + (formIndex + 1) + "-" + (i + 1);
      const item = document.createElement("li");
      const ir = botao("");
      const numero = document.createElement("span");
      numero.textContent = String(i + 1).padStart(2, "0");
      numero.setAttribute("aria-hidden", "true");
      ir.append(numero, document.createTextNode(passo.dataset.cyStep));
      ir.setAttribute("aria-controls", passo.id);
      ir.addEventListener("click", () => mostrar(i, true));
      lista.append(item);
      item.append(ir);
      return ir;
    });

    modo.setAttribute("aria-controls", passos.map(passo => passo.id).join(" "));
    const acoes = document.createElement("div");
    acoes.className = "cy-steps-actions";
    const voltar = botao("Voltar", "data-cy-back");
    const continuar = botao("Continuar", "data-cy-next");
    acoes.append(voltar, continuar);
    form.prepend(nav);
    if (final) form.insertBefore(acoes, final);
    else form.append(acoes);

    let atual;
    let modoCompleto = false;
    function mostrar(i, focar = false) {
      if (i < 0 || i >= passos.length) return;
      atual = i;
      aviso.hidden = true;
      passos.forEach((passo, n) => {
        passo.hidden = !modoCompleto && n !== i;
        if (!modoCompleto && n === i) botoes[n].setAttribute("aria-current", "step");
        else botoes[n].removeAttribute("aria-current");
      });
      lista.hidden = modoCompleto;
      acoes.hidden = modoCompleto;
      modo.textContent = modoCompleto ? "Ver em etapas" : "Ver tudo";
      modo.setAttribute("aria-expanded", String(modoCompleto));
      voltar.hidden = i === 0;
      continuar.hidden = i === passos.length - 1;
      if (final) final.hidden = !modoCompleto && !continuar.hidden;
      progresso.textContent = modoCompleto ? "Formulário completo" : "Etapa " + (i + 1) + " de " + passos.length;
      const painel = passos[i];
      extras.forEach(extra => { extra.hidden = !modoCompleto && extra.dataset.cyShowWith !== painel.id; });
      for (const visivel of modoCompleto ? passos : [painel]) {
        form.dispatchEvent(new CustomEvent("cypher:etapa", { detail: { painel: visivel } }));
      }
      if (focar) {
        const titulo = painel.querySelector("h2, h3, legend") || painel;
        titulo.tabIndex = -1;
        titulo.focus({ preventScroll: true });
        nav.scrollIntoView({ block: "nearest" });
      }
    }
    function passoDo(campo) {
      return passos.indexOf(campo.closest?.("[data-cy-step]"));
    }

    modo.addEventListener("click", () => {
      modoCompleto = !modoCompleto;
      mostrar(atual);
    });
    voltar.addEventListener("click", () => mostrar(atual - 1, true));
    continuar.addEventListener("click", () => mostrar(atual + 1, true));
    form.addEventListener("cypher:mostrar-campo", e => {
      mostrar(passoDo(e.target));
      if (e.detail?.mensagem) {
        aviso.textContent = e.detail.mensagem;
        aviso.hidden = false;
      }
    });
    let validando = false;
    form.addEventListener("invalid", e => {
      if (validando) {
        e.preventDefault();
        return;
      }
      validando = true;
      mostrar(passoDo(e.target));
      const grupo = e.target.closest("details");
      if (grupo) grupo.open = true;
      setTimeout(() => { validando = false; }, 0);
    }, true);
    form.addEventListener("keydown", e => {
      if (e.key !== "Enter" || e.isComposing || e.defaultPrevented ||
          modoCompleto || atual >= passos.length - 1 ||
          !e.target.matches('input:not([type]), input:is([type="text"], [type="number"], [type="url"], [type="email"], [type="date"], [type="time"])') ||
          passoDo(e.target) !== atual) return;
      e.preventDefault();
      mostrar(atual + 1, true);
    });

    const comErro = passos.findIndex(p => p.querySelector('[aria-invalid="true"], .op-field-error'));
    const hash = passos.findIndex(p => "#" + p.id === location.hash);
    form.classList.add("cy-wizard-ready");
    mostrar(comErro >= 0 ? comErro : Math.max(0, hash));
    window.addEventListener("hashchange", () => {
      const alvo = passos.findIndex(p => "#" + p.id === location.hash);
      if (alvo >= 0) mostrar(alvo, true);
    });
  }
})();

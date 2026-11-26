(() => {
  const nav = document.querySelector(".pf-nav");
  const atual = nav?.querySelector("[aria-current]");
  if (atual && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft =
      atual.getBoundingClientRect().left -
      nav.getBoundingClientRect().left -
      (nav.clientWidth - atual.offsetWidth) / 2;
  }
  const contexto = document.querySelector("[data-profile-context]");
  if (contexto) {
    contexto.classList.add("is-enhanced");
    contexto.elements.atuacao.addEventListener("change", () =>
      contexto.requestSubmit()
    );
  }
  const editor = document.querySelector("[data-seal-editor]");
  if (editor) {
    const glifos = { pulso: "⌁", estrela: "✦", raio: "ϟ", alvo: "◎", onda: "≈", flor: "✳" };
    const formas = { disco: "Disco", placa: "Placa", quadro: "Quadro", orbita: "Órbita", onda: "Frequência", prisma: "Prisma" };
    const atualizarSelo = () => {
      const letras = editor.elements.letras.value.trim().toLocaleUpperCase("pt-BR").slice(0, 3);
      const forma = editor.querySelector('[name="forma"]:checked')?.value || "disco";
      const cor = editor.querySelector('[name="cor"]:checked')?.value || "oliva";
      const simbolo = editor.querySelector('[name="simbolo"]:checked')?.value || "pulso";
      editor.querySelectorAll("[data-seal-preview]").forEach(previa => {
        previa.dataset.forma = forma;
        previa.dataset.cor = cor;
        previa.dataset.simbolo = simbolo;
        previa.querySelector(".pf-seal-letters").textContent = letras || "·";
        previa.querySelector(".pf-seal-symbol").textContent = glifos[simbolo];
      });
      editor.querySelector("[data-seal-forma-label]").textContent = formas[forma];
    };
    editor.addEventListener("input", atualizarSelo);
    editor.addEventListener("change", atualizarSelo);
    editor.querySelector("[data-seal-surprise]")?.addEventListener("click", () => {
      for (const nome of ["forma", "simbolo", "cor"]) {
        const opcoes = [...editor.querySelectorAll(`input[name="${nome}"]`)];
        const atuais = opcoes.filter(opcao => !opcao.checked);
        (atuais[Math.floor(Math.random() * atuais.length)] || opcoes[0]).checked = true;
      }
      atualizarSelo();
    });
  }
  const menu = document.querySelector(".pf-menu");
  if (menu) {
    document.addEventListener("click", event => {
      if (!menu.contains(event.target)) menu.open = false;
    });
    menu.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
  }
  const compartilhar = document.querySelector("[data-share-profile]");
  compartilhar?.addEventListener("click", async event => {
    event.preventDefault();
    const url = compartilhar.href;
    const status = document.querySelector(".pf-share-status");
    try {
      if (navigator.share)
        await navigator.share({ title: document.title, url });
      else {
        await navigator.clipboard.writeText(url);
        status.textContent = "Link copiado.";
      }
      menu.open = false;
      menu.querySelector("summary").focus();
    } catch (erro) {
      if (erro.name !== "AbortError")
        window.prompt("Copie o endereço deste perfil", url);
    }
  });
  document.querySelector("[data-copy-profile]")?.addEventListener("click", async event => {
    event.preventDefault();
    const status = document.querySelector(".pf-share-status");
    try {
      await navigator.clipboard.writeText(event.currentTarget.href);
      status.textContent = "Link copiado.";
      if (menu) menu.open = false;
    } catch {
      window.prompt("Copie o endereço deste perfil", event.currentTarget.href);
    }
  });

  // Favoritos e links de catálogos anteriores usavam apenas o fragmento da obra.
  function abrirFichaAntiga() {
    const url = new URL(location.href);
    if (!url.pathname.startsWith("/p/") || !url.hash.startsWith("#obra-"))
      return;
    let id;
    try {
      id = decodeURIComponent(url.hash.slice(6));
    } catch {
      return;
    }
    if (!id || url.searchParams.get("obra") === id) return;
    url.search = new URLSearchParams({ obra: id }).toString();
    location.replace(url.href);
  }
  abrirFichaAntiga();
  window.addEventListener("hashchange", abrirFichaAntiga);
})();

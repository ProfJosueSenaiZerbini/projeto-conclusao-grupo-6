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
    const opcao = nome => editor.querySelector('input[name="' + nome + '"]:checked');
    const atualizarSelo = () => {
      const letras = Array.from(editor.elements.letras.value.trim().toLocaleUpperCase("pt-BR").normalize("NFC"))
        .slice(0, 3).join("");
      const forma = opcao("forma"), cor = opcao("cor"), simbolo = opcao("simbolo");
      if (!forma || !cor || !simbolo) return;
      editor.querySelectorAll("[data-seal-preview]").forEach(previa => {
        previa.dataset.forma = forma.value;
        previa.dataset.cor = cor.value;
        previa.dataset.simbolo = simbolo.value;
        previa.querySelector(".pf-seal-letters").textContent = letras || "·";
        const vetor = simbolo.closest("label")?.querySelector("svg");
        previa.querySelector(".pf-seal-symbol").replaceChildren(...(vetor ? [vetor.cloneNode(true)] : []));
        previa.setAttribute("aria-label", "Prévia do selo: " + (letras || "sem iniciais"));
      });
      editor.querySelector("[data-seal-forma-label]").textContent = forma.dataset.label;
    };
    editor.addEventListener("input", atualizarSelo);
    editor.addEventListener("change", atualizarSelo);
    editor.addEventListener("reset", () => setTimeout(atualizarSelo, 0));
    const sortear = editor.querySelector("[data-seal-surprise]");
    sortear.hidden = false;
    editor.querySelector("[data-seal-reset]").hidden = false;
    sortear.addEventListener("click", () => {
      for (const nome of ["forma", "simbolo", "cor"]) {
        const opcoes = [...editor.querySelectorAll('input[name="' + nome + '"]:not(:checked)')];
        const escolha = opcoes[Math.floor(Math.random() * opcoes.length)];
        if (escolha) escolha.checked = true;
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
  const shareStatus = document.querySelector("[data-share-status]");
  const shareDialog = document.querySelector("[data-share-dialog]");
  const shareLabel = compartilhar?.querySelector("[data-share-label]");
  let compartilhando = false, tempoShare;
  function retornoShare(rotulo, mensagem) {
    clearTimeout(tempoShare);
    shareLabel.textContent = rotulo;
    shareStatus.textContent = mensagem;
    compartilhar.dataset.shareState = "ok";
    tempoShare = setTimeout(() => {
      shareLabel.textContent = "Compartilhar perfil";
      shareStatus.textContent = "";
      delete compartilhar.dataset.shareState;
    }, 2200);
  }
  compartilhar?.addEventListener("click", async () => {
    if (compartilhando) return;
    compartilhando = true;
    const url = new URL(compartilhar.dataset.shareProfile, location.origin).href;
    const nome = document.querySelector("#artista-nome")?.textContent.trim();
    compartilhar.setAttribute("aria-busy", "true");
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: nome ? nome + " na Cypher" : document.title, url });
          retornoShare("Compartilhado", "Compartilhamento concluído.");
          return;
        } catch (erro) {
          if (erro.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        retornoShare("Link copiado", "Link do perfil copiado.");
      } catch {
        const campo = shareDialog.querySelector("[data-share-url]");
        campo.value = url;
        shareDialog.showModal();
        campo.focus();
        campo.select();
      }
    } finally {
      compartilhando = false;
      compartilhar.removeAttribute("aria-busy");
    }
  });
  shareDialog?.addEventListener("close", () => compartilhar.focus());

  // Favoritos e links de catálogos anteriores usavam apenas o fragmento da obra.
  function abrirFichaAntiga() {
    const url = new URL(location.href);
    if (!url.pathname.startsWith("/artistas/") || !url.hash.startsWith("#obra-"))
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

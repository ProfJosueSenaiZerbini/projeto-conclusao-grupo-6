/* Módulo ES do frontend Cypher. */
(() => {
  const categoriaOutros = document.querySelector("[data-category-other]");
  const blocoOutraCategoria = document.querySelector(
    "[data-other-category-field]"
  );
  const entradaCategoria = document.getElementById("categoria-personalizada");
  const atualizarCategorias = () => {
    document.querySelectorAll(".category-option").forEach(opcao => {
      const campo = opcao.querySelector("input[type=checkbox]");
      opcao.classList.toggle("selected", Boolean(campo?.checked));
    });
    const exibir = Boolean(categoriaOutros?.checked);
    if (blocoOutraCategoria) blocoOutraCategoria.hidden = !exibir;
    if (entradaCategoria) entradaCategoria.required = exibir;
  };
  document
    .querySelectorAll(".category-option input[type=checkbox]")
    .forEach(campo => {
      campo.addEventListener("change", atualizarCategorias);
    });
  atualizarCategorias();

  const seletorStatusPerfil = document.querySelector("[data-profile-status]");
  const atualizarStatusPerfil = () => {
    if (!seletorStatusPerfil) return;
    const categoriasSelecionadas = new Set(
      [
        ...document.querySelectorAll(".profile-category-option input:checked"),
      ].map(campo => campo.value)
    );
    const opcaoAtual = seletorStatusPerfil.selectedOptions[0];
    seletorStatusPerfil
      .querySelectorAll("option[data-categorias]")
      .forEach(opcao => {
        const compativel = opcao.dataset.categorias
          .split("|")
          .some(categoria => categoriasSelecionadas.has(categoria));
        opcao.hidden = !compativel;
        opcao.disabled = !compativel;
      });
    if (opcaoAtual?.disabled) seletorStatusPerfil.value = "";
  };
  document
    .querySelectorAll(".profile-category-option input[type=checkbox]")
    .forEach(campo => {
      campo.addEventListener("change", atualizarStatusPerfil);
    });
  atualizarStatusPerfil();

  document
    .querySelector("[data-register-form]")
    ?.addEventListener("submit", evento => {
      const selecionadas = [
        ...document.querySelectorAll('.category-option input[type="checkbox"]'),
      ].some(campo => campo.checked);
      const aviso = document.querySelector("[data-category-validation]");
      if (aviso) aviso.hidden = selecionadas;
      if (!selecionadas) {
        evento.preventDefault();
        document
          .querySelector(".category-fieldset")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document
          .querySelector('.category-option input[type="checkbox"]')
          ?.focus();
      }
    });

  document
    .querySelector("[data-analyze-category]")
    ?.addEventListener("click", async evento => {
      const botao = evento.currentTarget;
      const resultado = document.querySelector("[data-category-result]");
      const categoria = entradaCategoria?.value.trim();
      if (!categoria || !resultado) {
        entradaCategoria?.focus();
        return;
      }
      botao.disabled = true;
      botao.textContent = "Analisando…";
      resultado.hidden = false;
      resultado.textContent = "Solicitando pré-análise demonstrativa…";
      try {
        const resposta = await fetch("/categories/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoria }),
        });
        const dados = await resposta.json();
        resultado.textContent =
          dados.mensagem ?? "Não foi possível concluir a pré-análise.";
        resultado.classList.toggle("is-error", !resposta.ok);
      } catch {
        resultado.textContent =
          "Não foi possível solicitar a análise. Tente novamente.";
        resultado.classList.add("is-error");
      } finally {
        botao.disabled = false;
        botao.textContent = "Solicitar análise";
      }
    });
})();

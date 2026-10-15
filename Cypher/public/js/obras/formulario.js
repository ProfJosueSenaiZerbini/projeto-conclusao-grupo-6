/* Módulo ES do frontend Cypher. */
(() => {
  const formularioObra = document.querySelector("[data-work-form]");
  const escolhasTipoObra = [
    ...document.querySelectorAll("[data-work-type-choice]"),
  ];
  const valorTipoObra = formularioObra?.querySelector("[data-work-type-value]");
  const contextoTipoObra = formularioObra?.querySelector(
    "[data-work-type-context]"
  );
  const sugestaoTipoObra = formularioObra?.querySelector(
    "[data-work-type-suggestion]"
  );

  const contextoPorTipo = {
    Música: {
      contexto: "Faixa musical",
      sugestao:
        "Priorize o título, gênero, letra, BPM e os créditos de quem participou.",
      campos: [
        "bpm",
        "lyrics",
        "description",
        "codes",
        "release-date",
        "listen-link",
      ],
      creditos: "Créditos da faixa",
      lancamento: "Identificação e lançamento da faixa",
    },
    Single: {
      contexto: "Lançamento individual",
      sugestao:
        "Use este formato para uma música lançada ou planejada como registro individual.",
      campos: [
        "bpm",
        "lyrics",
        "description",
        "codes",
        "release-date",
        "listen-link",
      ],
      creditos: "Créditos do single",
      lancamento: "Identificação e lançamento do single",
    },
    EP: {
      contexto: "Lançamento curto",
      sugestao:
        "Registre os dados gerais agora; a organização das faixas poderá ser adicionada posteriormente.",
      campos: ["bpm", "description", "codes", "release-date", "listen-link"],
      creditos: "Créditos gerais do EP",
      lancamento: "Dados do lançamento",
    },
    Álbum: {
      contexto: "Lançamento completo",
      sugestao:
        "Registre os dados gerais agora; a tracklist e a ordem das faixas serão organizadas posteriormente.",
      campos: ["description", "codes", "release-date", "listen-link"],
      creditos: "Créditos gerais do álbum",
      lancamento: "Dados do lançamento",
    },
    Beat: {
      contexto: "Instrumental",
      sugestao:
        "Para beats, informe BPM e link de escuta. Licenciamento detalhado será adicionado em uma próxima etapa.",
      campos: ["bpm", "description", "release-date", "listen-link"],
      creditos: "Beatmaker e créditos",
      lancamento: "Identificação e disponibilidade do beat",
    },
    Outro: {
      contexto: "Projeto flexível",
      sugestao:
        "Use a descrição, o gênero e o link para explicar o material enquanto novos tipos são adicionados ao Cypher.",
      campos: ["description", "listen-link"],
      creditos: "Colaboradores do projeto",
      lancamento: "Identificação do projeto",
    },
    Obra: {
      contexto: "Obra musical",
      sugestao:
        "Use o formato geral para registrar uma obra que ainda não se encaixa em um lançamento específico.",
      campos: [
        "bpm",
        "lyrics",
        "description",
        "codes",
        "release-date",
        "listen-link",
      ],
      creditos: "Créditos da obra",
      lancamento: "Identificação e lançamento",
    },
    Mixtape: {
      contexto: "Projeto de mixtape",
      sugestao:
        "Registre os dados gerais e use os créditos para organizar as participações do projeto.",
      campos: ["description", "codes", "release-date", "listen-link"],
      creditos: "Créditos gerais da mixtape",
      lancamento: "Dados do lançamento",
    },
  };

  const atualizarContextoObra = tipo => {
    if (!formularioObra || !valorTipoObra) return;
    const configuracao = contextoPorTipo[tipo] ?? null;
    valorTipoObra.value = tipo;
    escolhasTipoObra.forEach(escolha => {
      const selecionada = escolha.value === tipo;
      escolha.checked = selecionada;
      escolha
        .closest("[data-work-type-option]")
        ?.classList.toggle("selected", selecionada);
    });
    if (contextoTipoObra)
      contextoTipoObra.textContent =
        configuracao?.contexto ?? "Escolha um formato";
    if (sugestaoTipoObra) {
      sugestaoTipoObra.textContent = configuracao?.sugestao ?? "";
      sugestaoTipoObra.hidden = !configuracao;
    }
    formularioObra.querySelectorAll("[data-work-field]").forEach(campo => {
      campo.hidden =
        Boolean(configuracao) &&
        !configuracao.campos.includes(campo.dataset.workField);
    });
    const creditos = formularioObra.querySelector(
      "[data-work-section=credits] h2"
    );
    const lancamento = formularioObra.querySelector(
      "[data-work-section=release] h2"
    );
    if (creditos)
      creditos.textContent =
        configuracao?.creditos ?? "Créditos e participações";
    if (lancamento)
      lancamento.textContent =
        configuracao?.lancamento ?? "Identificação e lançamento";
  };

  escolhasTipoObra.forEach(escolha =>
    escolha.addEventListener("change", () =>
      atualizarContextoObra(escolha.value)
    )
  );
  if (formularioObra) {
    const tipoInicial = valorTipoObra?.value || "";
    atualizarContextoObra(tipoInicial);
    formularioObra.addEventListener("submit", evento => {
      if (valorTipoObra?.value) return;
      evento.preventDefault();
      if (sugestaoTipoObra) {
        sugestaoTipoObra.hidden = false;
        sugestaoTipoObra.textContent = "Escolha um formato antes de continuar.";
      }
      escolhasTipoObra[0]?.focus();
    });
  }
})();

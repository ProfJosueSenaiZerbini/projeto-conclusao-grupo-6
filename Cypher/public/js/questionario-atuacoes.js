(() => {
  "use strict";

  const form = document.querySelector(
    "form[data-register-form][data-atuacao-form]"
  );

  const stages = form
    ? [...form.querySelectorAll("[data-register-stage]")]
    : [];
  const indicators = form
    ? [...form.querySelectorAll("[data-step-indicator]")]
    : [];
  const title = document.querySelector("[data-register-title]");
  const description = document.querySelector("[data-register-description]");
  const accountNext = form?.querySelector("[data-account-next]");
  const categoriesNext = form?.querySelector("[data-categories-next]");
  const questionNext = form?.querySelector("[data-question-next]");
  const questionPrevious = form?.querySelector("[data-question-previous]");
  const finishButton = form?.querySelector("[data-register-submit]");
  const ctagNote = form?.querySelector("[data-register-ctag]");
  const categoryValidation = form?.querySelector("[data-category-validation]");
  const otherCategory = form?.querySelector("[data-category-other]");
  const otherField = form?.querySelector("[data-other-category-field]");
  const otherInput = form?.querySelector("#categoria-personalizada");
  const questionCurrent = form?.querySelector("[data-question-current]");
  const questionAnswered = form?.querySelector("[data-question-answered]");
  const progress = form?.querySelector('[role="progressbar"]');
  const progressBar = form?.querySelector("[data-question-progress-bar]");
  const progressPercent = form?.querySelector("[data-question-percent]");
  const categoryContext = form?.querySelector("[data-question-category]");
  let stage = "conta";
  let questionIndex = 0;
  let questions = [];
  let pendingQuestion = null;
  const pageByStage = {
    conta: [
      "Crie seu espaço.",
      "Vamos começar pelos dados essenciais da sua conta.",
    ],
    categorias: [
      "Sua atuação, do seu jeito.",
      "Selecione as categorias que representam sua participação na cena.",
    ],
    questionarios: [
      "Conte sua trajetória.",
      "Perguntas objetivas, uma de cada vez — suas respostas ficam organizadas por categoria.",
    ],
  };

  const selectedCategories = (targetForm = form) =>
    new Set(
      [...targetForm.querySelectorAll('[name="categorias"]:checked')].map(
        input => input.value
      )
    );

  function showError(message, stageName = stage) {
    const container = form.querySelector(
      `[data-register-stage="${stageName}"] [data-stage-error]`
    );
    if (!container) return;
    container.textContent = message;
    container.hidden = !message;
  }

  function clearErrors() {
    form.querySelectorAll("[data-stage-error]").forEach(error => {
      error.hidden = true;
      error.textContent = "";
    });
  }

  function showStage(nextStage) {
    if (stage === "questionarios" && nextStage === "categorias") {
      pendingQuestion = questions[questionIndex] ?? null;
    }
    stage = nextStage;
    clearErrors();
    stages.forEach(section => {
      section.hidden = section.dataset.registerStage !== stage;
    });
    indicators.forEach(item => {
      const active = item.dataset.stepIndicator === stage;
      const current = indicators.findIndex(
        indicator => indicator.dataset.stepIndicator === stage
      );
      const own = indicators.indexOf(item);
      if (active) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
      item.classList.toggle("is-complete", own < current);
    });
    if (title && description) {
      [title.textContent, description.textContent] = pageByStage[stage];
    }
    if (ctagNote) ctagNote.hidden = stage !== "questionarios";
    if (stage === "questionarios") {
      rebuildQuestions();
      if (pendingQuestion) {
        const restoredIndex = questions.findIndex(
          item => item.fieldset === pendingQuestion.fieldset
        );
        questionIndex = restoredIndex >= 0 ? restoredIndex : 0;
        pendingQuestion = null;
      }
      showQuestion();
    }
    const focusTarget =
      stage === "conta"
        ? form.querySelector("#register-name")
        : stage === "categorias"
          ? form.querySelector('[name="categorias"]')
          : form.querySelector("[data-resposta-atuacao]:not(:disabled)");
    window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), 0);
  }

  function isAnswered(fieldset) {
    const controls = [
      ...fieldset.querySelectorAll("[data-resposta-atuacao]:not(:disabled)"),
    ];
    if (!controls.length) return false;
    const first = controls[0];
    if (first.type === "checkbox")
      return controls.some(control => control.checked);
    if (first.type === "radio")
      return controls.some(control => control.checked);
    return controls.some(control => String(control.value).trim() !== "");
  }

  function updateDependencies(panel) {
    panel.querySelectorAll("[data-depende-campo]").forEach(field => {
      const parentName = field.getAttribute("data-depende-campo");
      const parentValue = field.getAttribute("data-depende-valor");
      const parents = [
        ...panel.querySelectorAll("[data-resposta-atuacao]"),
      ].filter(
        control => control.getAttribute("data-resposta-atuacao") === parentName
      );
      const active = parents.some(
        control => control.checked && control.value === parentValue
      );
      field.dataset.dependencyInactive = String(!active);
      field.hidden = !active;
      field.querySelectorAll("input, select, textarea").forEach(control => {
        control.disabled = !active;
        control.required = false;
        if (!active) {
          if (control.type === "checkbox" || control.type === "radio")
            control.checked = false;
          else control.value = "";
        }
      });
    });
  }

  function activeFieldsets() {
    const selected = selectedCategories();
    const result = [];
    form
      .querySelectorAll("[data-atuacao-questionario][data-categoria]")
      .forEach(panel => {
        updateDependencies(panel);
        if (!selected.has(panel.dataset.categoria)) return;
        panel
          .querySelectorAll(".professional-questionnaire__field")
          .forEach(fieldset => {
            if (fieldset.dataset.dependencyInactive === "true") return;
            result.push({ panel, fieldset, category: panel.dataset.categoria });
          });
      });
    return result;
  }

  function rebuildQuestions() {
    questions = activeFieldsets();
    questionIndex = Math.min(questionIndex, Math.max(0, questions.length - 1));
    refreshProgress();
  }

  function refreshProgress() {
    const answered = questions.filter(item => isAnswered(item.fieldset)).length;
    const total = questions.length;
    const current = Math.min(questionIndex + 1, Math.max(total, 1));
    const percent = total ? Math.round((answered / total) * 100) : 100;
    if (questionCurrent)
      questionCurrent.textContent = `Pergunta ${current} de ${total}`;
    if (questionAnswered)
      questionAnswered.textContent = `${answered} respondidas · faltam ${Math.max(0, total - answered)}`;
    if (progress) progress.setAttribute("aria-valuenow", String(percent));
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (questionNext) questionNext.hidden = questionIndex >= total - 1;
    if (questionPrevious) questionPrevious.hidden = questionIndex <= 0;
    if (finishButton)
      finishButton.hidden = total === 0 || questionIndex < total - 1;
  }

  function showQuestion() {
    const active = questions[questionIndex];
    form
      .querySelectorAll("[data-atuacao-questionario][data-categoria]")
      .forEach(panel => {
        panel.hidden = !active || panel !== active.panel;
      });
    form
      .querySelectorAll(".professional-questionnaire__field")
      .forEach(fieldset => {
        fieldset.hidden = true;
      });
    if (!active) {
      if (categoryContext)
        categoryContext.textContent = "Nenhuma categoria selecionada.";
      refreshProgress();
      return;
    }
    active.fieldset.hidden = false;
    if (categoryContext) {
      const categorias = [...new Set(questions.map(item => item.category))];
      const categoriaAtual = categorias.indexOf(active.category) + 1;
      categoryContext.textContent = `${active.category.toLocaleUpperCase("pt-BR")} · CATEGORIA ${categoriaAtual} DE ${categorias.length} → ${active.fieldset.querySelector("legend")?.textContent.trim() ?? "PERGUNTA"}`;
    }
    refreshProgress();
  }

  function updateCategoryCards(targetForm = form) {
    targetForm.querySelectorAll(".category-option").forEach(card => {
      const input = card.querySelector('[name="categorias"]');
      card.classList.toggle("selected", Boolean(input?.checked));
    });
    if (otherField && otherInput && otherCategory) {
      otherField.hidden = !otherCategory.checked;
      otherInput.disabled = !otherCategory.checked;
      otherInput.required = otherCategory.checked;
      if (!otherCategory.checked) otherInput.setCustomValidity("");
    }
  }

  function serialize(targetForm = form) {
    const responses = {};
    const visibilities = {};
    const selected = selectedCategories(targetForm);
    targetForm
      .querySelectorAll("[data-atuacao-questionario][data-categoria]")
      .forEach(panel => {
        const category = panel.dataset.categoria;
        if (!selected.has(category)) return;
        const categoryResponses = {};
        const categoryVisibilities = {};
        panel.querySelectorAll("[data-resposta-atuacao]").forEach(control => {
          if (control.disabled) return;
          const key = control.dataset.respostaAtuacao;
          if (
            !key ||
            Object.prototype.hasOwnProperty.call(categoryResponses, key)
          )
            return;
          const peers = [
            ...panel.querySelectorAll(
              `[data-resposta-atuacao="${CSS.escape(key)}"]:not(:disabled)`
            ),
          ];
          if (!peers.length) return;
          const first = peers[0];
          if (first.type === "radio") {
            const chosen = peers.find(peer => peer.checked);
            if (chosen)
              categoryResponses[key] =
                chosen.dataset.tipoRespostaAtuacao === "booleano"
                  ? chosen.value === "true"
                  : chosen.value;
          } else if (first.type === "checkbox") {
            const chosen = peers
              .filter(peer => peer.checked)
              .map(peer => peer.value);
            if (chosen.length) categoryResponses[key] = chosen;
          } else if (String(first.value).trim()) {
            categoryResponses[key] = first.value;
          }
        });
        panel
          .querySelectorAll("[data-visibilidade-atuacao]")
          .forEach(control => {
            if (!control.disabled && control.value)
              categoryVisibilities[control.dataset.visibilidadeAtuacao] =
                control.value;
          });
        const categoryVisibility = panel.querySelector(
          "[data-visibilidade-categoria]"
        );
        if (categoryVisibility)
          categoryVisibilities.__categoria__ = categoryVisibility.value;
        responses[category] = categoryResponses;
        visibilities[category] = categoryVisibilities;
      });
    const responsesInput = targetForm.querySelector(
      "[data-respostas-atuacoes-json]"
    );
    const visibilitiesInput = targetForm.querySelector(
      "[data-visibilidades-atuacoes-json]"
    );
    if (responsesInput) responsesInput.value = JSON.stringify(responses);
    if (visibilitiesInput)
      visibilitiesInput.value = JSON.stringify(visibilities);
  }

  if (!form) {
    document
      .querySelectorAll("form[data-atuacao-form]:not([data-register-form])")
      .forEach(formulario => {
        const atualizarQuestionariosSelecionados = () => {
          const selecionadas = selectedCategories(formulario);
          formulario
            .querySelectorAll("[data-atuacao-questionario][data-categoria]")
            .forEach(painel => {
              updateDependencies(painel);
              const grupo = painel.closest("[data-profile-category-group]");
              const visivel = selecionadas.has(painel.dataset.categoria);
              if (grupo) grupo.hidden = !visivel;
              else painel.hidden = !visivel;
              if (visivel) painel.hidden = false;
              if (visivel && grupo?.tagName === "DETAILS") grupo.open = true;
            });
        };

        const limparMensagensValidacao = () => {
          formulario
            .querySelectorAll(
              "[data-category-validation], [data-profile-question-validation]"
            )
            .forEach(mensagem => {
              mensagem.hidden = true;
              mensagem.textContent = mensagem.dataset.defaultMessage || "";
            });
        };

        const validarFormulario = evento => {
          const selecionadas = selectedCategories(formulario);
          const erroCategorias = formulario.querySelector(
            "[data-category-validation]"
          );
          if (erroCategorias) {
            erroCategorias.hidden = selecionadas.size > 0;
            if (!selecionadas.size) {
              evento.preventDefault();
              formulario
                .querySelector('[name="categorias"]:not(:disabled)')
                ?.focus();
              return;
            }
          }

          for (const grupo of formulario.querySelectorAll(
            "[data-profile-category-group]"
          )) {
            if (
              !selecionadas.has(grupo.dataset.categoria) ||
              grupo.dataset.categoriaAtual === "true"
            )
              continue;
            const painel = grupo.querySelector(
              "[data-atuacao-questionario][data-categoria]"
            );
            if (!painel) continue;
            updateDependencies(painel);
            for (const pergunta of painel.querySelectorAll(
              '.professional-questionnaire__field[data-obrigatoria="true"]'
            )) {
              if (
                pergunta.hidden ||
                pergunta.dataset.dependencyInactive === "true" ||
                isAnswered(pergunta)
              )
                continue;
              const mensagem = grupo.querySelector(
                "[data-profile-question-validation]"
              );
              if (mensagem) {
                mensagem.textContent =
                  "Responda às perguntas obrigatórias desta nova categoria antes de salvar.";
                mensagem.hidden = false;
              }
              evento.preventDefault();
              pergunta
                .querySelector("[data-resposta-atuacao]:not(:disabled)")
                ?.focus();
              return;
            }
          }
        };

        formulario.addEventListener("change", evento => {
          const alvo = evento.target;
          if (alvo.matches('[name="categorias"]')) {
            updateCategoryCards(formulario);
            atualizarQuestionariosSelecionados();
            limparMensagensValidacao();
          } else if (alvo.matches("[data-resposta-atuacao]")) {
            const painel = alvo.closest("[data-atuacao-questionario]");
            if (painel) updateDependencies(painel);
            const mensagem = alvo
              .closest("[data-profile-category-group]")
              ?.querySelector("[data-profile-question-validation]");
            if (mensagem) mensagem.hidden = true;
          }
        });
        formulario.addEventListener("submit", evento => {
          serialize(formulario);
          validarFormulario(evento);
        });
        updateCategoryCards(formulario);
        atualizarQuestionariosSelecionados();
      });
    return;
  }

  async function validateAccount() {
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    for (const input of [name, email, password]) {
      input.setCustomValidity("");
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    accountNext.disabled = true;
    accountNext.setAttribute("aria-busy", "true");
    const originalText = accountNext.innerHTML;
    accountNext.textContent = "Verificando…";
    try {
      const response = await fetch("/register/validate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        showError(
          result.message || "Confira os dados e tente novamente.",
          "conta"
        );
        const invalid =
          result.field === "email"
            ? email
            : result.field === "password"
              ? password
              : name;
        invalid.focus();
        return false;
      }
      return true;
    } catch {
      showError(
        "Não foi possível verificar os dados agora. Confira sua conexão e tente novamente.",
        "conta"
      );
      return false;
    } finally {
      accountNext.disabled = false;
      accountNext.removeAttribute("aria-busy");
      accountNext.innerHTML = originalText;
    }
  }

  async function nextFromAccount() {
    if (await validateAccount()) showStage("categorias");
  }

  function nextFromCategories() {
    updateCategoryCards();
    const selected = selectedCategories();
    if (!selected.size) {
      categoryValidation.hidden = false;
      form.querySelector('[name="categorias"]')?.focus();
      return;
    }
    categoryValidation.hidden = true;
    if (otherCategory?.checked && !otherInput.checkValidity()) {
      otherInput.reportValidity();
      otherInput.focus();
      return;
    }
    questionIndex = 0;
    showStage("questionarios");
  }

  function currentQuestionValid() {
    const item = questions[questionIndex];
    if (!item || item.fieldset.dataset.obrigatoria !== "true") return true;
    if (isAnswered(item.fieldset)) return true;
    showError(
      "Esta pergunta é obrigatória. Selecione ou informe uma resposta para continuar."
    );
    item.fieldset
      .querySelector("[data-resposta-atuacao]:not(:disabled)")
      ?.focus();
    return false;
  }

  function moveQuestion(direction) {
    if (direction > 0 && !currentQuestionValid()) return;
    clearErrors();
    rebuildQuestions();
    questionIndex = Math.min(
      Math.max(questionIndex + direction, 0),
      Math.max(questions.length - 1, 0)
    );
    showQuestion();
  }

  form.addEventListener("change", event => {
    if (event.target.matches('[name="categorias"]')) {
      updateCategoryCards();
      categoryValidation.hidden = true;
      if (stage === "questionarios") {
        rebuildQuestions();
        showQuestion();
      }
      return;
    }
    if (event.target.matches("[data-resposta-atuacao]")) {
      const panel = event.target.closest("[data-atuacao-questionario]");
      if (panel) updateDependencies(panel);
      if (stage === "questionarios") {
        const activeFieldset = questions[questionIndex]?.fieldset;
        rebuildQuestions();
        const updatedIndex = questions.findIndex(
          item => item.fieldset === activeFieldset
        );
        if (updatedIndex >= 0) questionIndex = updatedIndex;
        else
          questionIndex = Math.min(
            questionIndex,
            Math.max(questions.length - 1, 0)
          );
        showQuestion();
      }
    }
    if (stage === "questionarios") refreshProgress();
  });

  form.querySelectorAll("[data-register-back]").forEach(button => {
    button.addEventListener("click", () => {
      if (stage === "questionarios") showStage("categorias");
      else if (stage === "categorias") showStage("conta");
    });
  });
  accountNext?.addEventListener("click", nextFromAccount);
  categoriesNext?.addEventListener("click", nextFromCategories);
  questionNext?.addEventListener("click", () => moveQuestion(1));
  questionPrevious?.addEventListener("click", () => moveQuestion(-1));

  form.addEventListener("submit", event => {
    if (stage !== "questionarios") {
      event.preventDefault();
      return;
    }
    if (!currentQuestionValid()) {
      event.preventDefault();
      return;
    }
    serialize();
    if (finishButton) {
      finishButton.disabled = true;
      finishButton.setAttribute("aria-busy", "true");
      finishButton.textContent = "Finalizando…";
    }
  });

  form.addEventListener("input", event => {
    if (
      event.target.matches("[data-resposta-atuacao]") &&
      stage === "questionarios"
    )
      refreshProgress();
  });

  updateCategoryCards();
  form
    .querySelectorAll("[data-atuacao-questionario]")
    .forEach(panel => updateDependencies(panel));
  const initialStage = ["conta", "categorias", "questionarios"].includes(
    form.dataset.startStage
  )
    ? form.dataset.startStage
    : "conta";
  showStage(initialStage);
})();

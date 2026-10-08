(() => {
  const criarAviso = mensagem => {
    const aviso = document.createElement("div");
    aviso.className = "mvc-toast";
    aviso.setAttribute("role", "status");
    aviso.textContent = mensagem;
    document.body.appendChild(aviso);
    window.setTimeout(() => aviso.remove(), 2800);
  };

  document.addEventListener("click", evento => {
    const botaoAviso = evento.target.closest("[data-toast]");
    if (botaoAviso) {
      evento.preventDefault();
      criarAviso(botaoAviso.dataset.toast);
    }
  });

  document.querySelectorAll("[data-filter]").forEach(campo => {
    campo.addEventListener("input", () => {
      const consulta = campo.value.trim().toLocaleLowerCase("pt-BR");
      document.querySelectorAll("[data-search-item]").forEach(item => {
        item.hidden = !item.textContent.toLocaleLowerCase("pt-BR").includes(consulta);
      });
    });
  });

  document.querySelectorAll("[data-faq]").forEach(botao => {
    botao.addEventListener("click", () => {
      const item = botao.closest(".faq-item");
      const aberto = item.classList.toggle("open");
      botao.setAttribute("aria-expanded", String(aberto));
    });
  });

  document.querySelectorAll("[data-menu-toggle]").forEach(botao => {
    botao.addEventListener("click", () => {
      const menu = document.getElementById(botao.dataset.menuToggle);
      if (!menu) return;
      const aberto = botao.getAttribute("aria-expanded") !== "true";
      botao.setAttribute("aria-expanded", String(aberto));
      menu.hidden = !aberto;
    });
  });

  const barraLateral = document.querySelector(".sidebar");
  const camadaMenu = document.querySelector("[data-sidebar-close].mobile-overlay");
  const fecharMenu = () => {
    barraLateral?.classList.remove("sidebar-open");
    document.body.classList.remove("sidebar-visible");
    if (camadaMenu) camadaMenu.hidden = true;
  };
  document.querySelectorAll("[data-sidebar-open]").forEach(botao => {
    botao.addEventListener("click", () => {
      barraLateral?.classList.add("sidebar-open");
      document.body.classList.add("sidebar-visible");
      if (camadaMenu) camadaMenu.hidden = false;
      barraLateral?.querySelector(".mobile-close")?.focus();
    });
  });
  document.querySelectorAll("[data-sidebar-close]").forEach(botao => {
    botao.addEventListener("click", fecharMenu);
  });
  barraLateral?.querySelectorAll("a.side-link").forEach(link => {
    link.addEventListener("click", fecharMenu);
  });
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharMenu();
  });

  const atualizarInteresse = interessado => {
    document.querySelectorAll("[data-interest-button]").forEach(botao => {
      botao.setAttribute("aria-pressed", String(interessado));
      const rotulo = botao.querySelector("[data-interest-label]");
      if (rotulo) rotulo.textContent = interessado ? "Interesse demonstrado" : "Demonstrar interesse";
      botao.classList.toggle("is-interested", interessado);
    });
    document.querySelectorAll("[data-interest-notice]").forEach(aviso => {
      aviso.hidden = !interessado;
    });
  };
  document.querySelectorAll("[data-interest-button]").forEach(botao => {
    botao.addEventListener("click", () => {
      const novoEstado = botao.getAttribute("aria-pressed") !== "true";
      atualizarInteresse(novoEstado);
    });
  });

  document.querySelectorAll("[data-event-filter]").forEach(botao => {
    botao.addEventListener("click", () => {
      const filtro = botao.dataset.eventFilter;
      document.querySelectorAll("[data-event-filter]").forEach(outro => {
        const ativo = outro === botao;
        outro.classList.toggle("active", ativo);
        outro.setAttribute("aria-pressed", String(ativo));
      });
      document.querySelectorAll("[data-event-card]").forEach(cartao => {
        cartao.hidden = filtro !== "Todos" && cartao.dataset.eventCategory !== filtro;
      });
    });
  });

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
  document.querySelectorAll("[data-event-card]").forEach(cartao => {
    cartao.addEventListener("click", () => {
      const dialogo = document.getElementById("detalhe-oportunidade");
      if (!dialogo) return;
      const dados = cartao.dataset;
      definirTexto(dialogo, "[data-event-title-detail]", dados.detailTitle);
      definirTexto(dialogo, "[data-event-category-detail]", dados.detailCategory);
      definirTexto(dialogo, "[data-event-date-detail]", dados.detailDate);
      definirTexto(dialogo, "[data-event-time-detail]", dados.detailTime);
      definirTexto(dialogo, "[data-event-location-detail]", dados.detailLocation);
      definirTexto(dialogo, "[data-event-org-detail]", dados.detailOrg);
      definirTexto(dialogo, "[data-event-description-detail]", dados.detailDescription);
      definirTexto(dialogo, "[data-event-format-detail]", dados.detailFormat);
      definirTexto(dialogo, "[data-event-registration-detail]", dados.detailRegistration);
      definirTexto(dialogo, "[data-event-prize-detail]", dados.detailPrize);
      const listaTags = dialogo.querySelector("[data-event-tags-detail]");
      if (listaTags) {
        listaTags.replaceChildren();
        (dados.detailTags ?? "").split("|").filter(Boolean).forEach(tag => {
          const elemento = document.createElement("span");
          elemento.textContent = tag;
          listaTags.appendChild(elemento);
        });
      }
      abrirDialogo(dialogo, cartao);
    });
  });

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
      Object.entries(campos).forEach(([seletor, chave]) => definirTexto(dialogo, seletor, dados[chave]));
      abrirDialogo(dialogo, cartao);
    });
  });

  document.querySelectorAll("[data-beat-detail]").forEach(botao => {
    botao.addEventListener("click", () => {
      const dialogo = document.getElementById("detalhe-beat");
      if (!dialogo) return;
      const dados = botao.dataset;
      const campos = {
        "[data-beat-title-detail]": "beatTitle",
        "[data-beat-producer-detail]": "beatProducer",
        "[data-beat-bpm-detail]": "beatBpm",
        "[data-beat-key-detail]": "beatKey",
        "[data-beat-genre-detail]": "beatGenre",
        "[data-beat-license-detail]": "beatLicense",
        "[data-beat-duration-detail]": "beatDuration",
        "[data-beat-description-detail]": "beatDescription",
        "[data-beat-usage-detail]": "beatUsage",
      };
      Object.entries(campos).forEach(([seletor, chave]) => definirTexto(dialogo, seletor, dados[chave]));
      abrirDialogo(dialogo, botao);
    });
  });

  document.querySelectorAll("[data-dialog-close]").forEach(botao => {
    botao.addEventListener("click", () => botao.closest("dialog")?.close());
  });
  document.querySelectorAll("dialog.detail-dialog").forEach(dialogo => {
    dialogo.addEventListener("click", evento => {
      if (evento.target === dialogo) dialogo.close();
    });
    dialogo.addEventListener("close", () => dialogos.get(dialogo)?.focus());
  });

  document.querySelectorAll("[data-settings-link]").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll("[data-settings-link]").forEach(outro => {
        const ativo = outro === link;
        outro.classList.toggle("active", ativo);
        if (ativo) outro.setAttribute("aria-current", "location");
        else outro.removeAttribute("aria-current");
      });
    });
  });
  window.addEventListener("hashchange", () => {
    const link = document.querySelector(`[data-settings-link][href="${window.location.hash}"]`);
    if (link) link.click();
  });

  const aplicarTema = tema => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    document.querySelectorAll("[data-theme-mode]").forEach(botao => {
      botao.setAttribute("aria-pressed", String(botao.dataset.themeMode === tema));
    });
    try { window.localStorage.setItem("cypher-tema", tema); } catch { /* armazenamento pode estar bloqueado */ }
  };
  let temaSalvo = "light";
  try { temaSalvo = window.localStorage.getItem("cypher-tema") === "dark" ? "dark" : "light"; }
  catch { /* usa o tema claro padrão */ }
  aplicarTema(temaSalvo);
  document.querySelectorAll("[data-theme-mode]").forEach(botao => {
    botao.addEventListener("click", () => aplicarTema(botao.dataset.themeMode));
  });

  const categoriaOutros = document.querySelector("[data-category-other]");
  const blocoOutraCategoria = document.querySelector("[data-other-category-field]");
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
  document.querySelectorAll(".category-option input[type=checkbox]").forEach(campo => {
    campo.addEventListener("change", atualizarCategorias);
  });
  atualizarCategorias();

  document.querySelector("[data-register-form]")?.addEventListener("submit", evento => {
    const selecionadas = [...document.querySelectorAll('.category-option input[type="checkbox"]')].some(campo => campo.checked);
    const aviso = document.querySelector("[data-category-validation]");
    if (aviso) aviso.hidden = selecionadas;
    if (!selecionadas) {
      evento.preventDefault();
      document.querySelector(".category-fieldset")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelector('.category-option input[type="checkbox"]')?.focus();
    }
  });

  document.querySelector("[data-analyze-category]")?.addEventListener("click", async evento => {
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
      resultado.textContent = dados.mensagem ?? "Não foi possível concluir a pré-análise.";
      resultado.classList.toggle("is-error", !resposta.ok);
    } catch {
      resultado.textContent = "Não foi possível solicitar a análise. Tente novamente.";
      resultado.classList.add("is-error");
    } finally {
      botao.disabled = false;
      botao.textContent = "Solicitar análise";
    }
  });

  const listaMenções = document.querySelector("[data-ghost-list]");
  document.querySelector("[data-add-ghost]")?.addEventListener("click", () => {
    if (!listaMenções) return;
    const grupo = document.createElement("fieldset");
    grupo.className = "ghost-entry";
    grupo.dataset.ghostEntry = "";
    const legenda = document.createElement("legend");
    legenda.textContent = "Pessoa sem conta no Cypher";
    const linha = document.createElement("div");
    linha.className = "form-grid";
    const campoNome = document.createElement("label");
    campoNome.textContent = "Nome da pessoa";
    const nome = document.createElement("input");
    nome.name = "mencoesFantasma[nome][]";
    nome.maxLength = 100;
    nome.placeholder = "Nome artístico ou profissional";
    campoNome.appendChild(nome);
    const campoPapel = document.createElement("label");
    campoPapel.textContent = "Crédito";
    const papel = document.createElement("input");
    papel.name = "mencoesFantasma[papel][]";
    papel.maxLength = 80;
    papel.placeholder = "Ex.: composição, produção, feat";
    campoPapel.appendChild(papel);
    linha.append(campoNome, campoPapel);
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "text-link ghost-remove";
    remover.textContent = "Remover menção";
    remover.addEventListener("click", () => grupo.remove());
    grupo.append(legenda, linha, remover);
    listaMenções.appendChild(grupo);
    nome.focus();
  });

  document.querySelector("[data-central-search]")?.addEventListener("submit", evento => {
    evento.preventDefault();
    const campo = evento.currentTarget.querySelector("input");
    const consulta = campo.value.trim().toLocaleLowerCase("pt-BR");
    document.querySelectorAll("[data-faq-item]").forEach(item => {
      item.hidden = !item.textContent.toLocaleLowerCase("pt-BR").includes(consulta);
    });
  });
})();

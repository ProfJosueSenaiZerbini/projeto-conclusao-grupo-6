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
        item.hidden = !item.textContent
          .toLocaleLowerCase("pt-BR")
          .includes(consulta);
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
  const camadaMenu = document.querySelector(
    "[data-sidebar-close].mobile-overlay"
  );
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
      if (rotulo)
        rotulo.textContent = interessado
          ? "Interesse demonstrado"
          : "Demonstrar interesse";
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
      const cartoes = [...document.querySelectorAll("[data-event-card]")];
      let visiveis = 0;
      cartoes.forEach(cartao => {
        const visivel =
          filtro === "Todos" || cartao.dataset.eventCategory === filtro;
        cartao.hidden = !visivel;
        if (visivel) visiveis += 1;
      });
      document
        .querySelectorAll("[data-events-filter-empty]")
        .forEach(estado => {
          estado.hidden = visiveis > 0;
        });
    });
  });

  const seletorTipoObra = document.querySelector("#selecao-tipo-obra");
  let acionadorTipoObra = null;
  const abrirSelecaoTipoObra = acionador => {
    if (!seletorTipoObra) return;
    acionadorTipoObra =
      acionador ?? document.querySelector("[data-work-type-open]");
    if (typeof seletorTipoObra.showModal === "function") {
      if (!seletorTipoObra.open) seletorTipoObra.showModal();
    } else {
      seletorTipoObra.setAttribute("open", "");
    }
    seletorTipoObra.querySelector("a, button")?.focus();
  };
  const fecharSelecaoTipoObra = () => {
    if (!seletorTipoObra) return;
    if (typeof seletorTipoObra.close === "function" && seletorTipoObra.open) {
      seletorTipoObra.close();
    } else {
      seletorTipoObra.removeAttribute("open");
      acionadorTipoObra?.focus();
    }
  };
  document.querySelectorAll("[data-work-type-open]").forEach(botao => {
    botao.addEventListener("click", () => abrirSelecaoTipoObra(botao));
  });
  document.querySelectorAll("[data-work-type-close]").forEach(botao => {
    botao.addEventListener("click", fecharSelecaoTipoObra);
  });
  seletorTipoObra?.addEventListener("click", evento => {
    if (evento.target === seletorTipoObra) fecharSelecaoTipoObra();
  });
  seletorTipoObra?.addEventListener("close", () => acionadorTipoObra?.focus());
  if (window.location.hash === "#cadastro-obra") abrirSelecaoTipoObra();

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
      definirTexto(
        dialogo,
        "[data-event-category-detail]",
        dados.detailCategory
      );
      definirTexto(dialogo, "[data-event-date-detail]", dados.detailDate);
      definirTexto(dialogo, "[data-event-time-detail]", dados.detailTime);
      definirTexto(
        dialogo,
        "[data-event-location-detail]",
        dados.detailLocation
      );
      definirTexto(dialogo, "[data-event-org-detail]", dados.detailOrg);
      definirTexto(
        dialogo,
        "[data-event-description-detail]",
        dados.detailDescription
      );
      definirTexto(dialogo, "[data-event-format-detail]", dados.detailFormat);
      definirTexto(
        dialogo,
        "[data-event-registration-detail]",
        dados.detailRegistration
      );
      definirTexto(dialogo, "[data-event-prize-detail]", dados.detailPrize);
      const listaTags = dialogo.querySelector("[data-event-tags-detail]");
      if (listaTags) {
        listaTags.replaceChildren();
        (dados.detailTags ?? "")
          .split("|")
          .filter(Boolean)
          .forEach(tag => {
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
      Object.entries(campos).forEach(([seletor, chave]) =>
        definirTexto(dialogo, seletor, dados[chave])
      );
      const listaCreditos = dialogo.querySelector("[data-work-credit-list]");
      if (listaCreditos) {
        listaCreditos.replaceChildren();
        let creditos = [];
        try {
          creditos = JSON.parse(
            decodeURIComponent(dados.workCreditDetails || "")
          );
        } catch {
          creditos = [];
        }
        if (creditos.length === 0) {
          const vazio = document.createElement("p");
          vazio.textContent = "Nenhum crédito associado.";
          listaCreditos.appendChild(vazio);
        } else {
          creditos.forEach(credito => {
            const linha = document.createElement("div");
            linha.className = "work-credit-detail";
            const pessoa = document.createElement("strong");
            pessoa.textContent = credito.name;
            const funcao = document.createElement("span");
            funcao.textContent = credito.role;
            const participacao = document.createElement("small");
            const estado = credito.verified
              ? "Confirmado"
              : credito.userId
                ? "Crédito não confirmado"
                : "Menção sem perfil vinculado";
            participacao.textContent = [credito.participation, estado]
              .filter(Boolean)
              .join(" · ");
            linha.append(pessoa, funcao, participacao);
            listaCreditos.appendChild(linha);
          });
        }
      }

      const linkEscuta = dialogo.querySelector("[data-work-listen-link]");
      if (linkEscuta) {
        linkEscuta.hidden = true;
        linkEscuta.removeAttribute("href");
        if (dados.workLink) {
          try {
            const url = new URL(dados.workLink);
            if (url.protocol === "http:" || url.protocol === "https:") {
              linkEscuta.href = url.href;
              linkEscuta.hidden = false;
            }
          } catch {
            // Links inválidos não são exibidos.
          }
        }
      }

      const id = encodeURIComponent(dados.workId || "");
      const obraDoUsuario = dados.workOwned === "true";
      const editar = dialogo.querySelector("[data-work-edit]");
      if (editar) {
        editar.href = `/works/${id}/edit`;
        editar.hidden = !obraDoUsuario;
      }
      const excluir = dialogo.querySelector("[data-work-delete]");
      if (excluir) {
        excluir.action = `/works/${id}/delete`;
        excluir.hidden = !obraDoUsuario;
        excluir.onsubmit = evento => {
          if (!window.confirm("Excluir esta obra e os créditos associados?")) {
            evento.preventDefault();
          }
        };
      }
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
      Object.entries(campos).forEach(([seletor, chave]) =>
        definirTexto(dialogo, seletor, dados[chave])
      );
      const exclusivo = dialogo.querySelector("[data-beat-exclusive-detail]");
      if (exclusivo instanceof HTMLElement) {
        exclusivo.hidden = dados.beatExclusive !== "true";
      }
      const ofertas = dialogo.querySelector("[data-beat-ofertas-detail]");
      if (ofertas) {
        ofertas.replaceChildren();
        let lista = [];
        try {
          lista = JSON.parse(decodeURIComponent(dados.beatOfertas ?? ""));
        } catch {
          lista = [];
        }
        if (lista.length === 0) {
          const vazio = document.createElement("p");
          vazio.textContent = "Nenhuma oferta cadastrada.";
          ofertas.append(vazio);
        } else {
          lista.forEach(oferta => {
            const item = document.createElement("div");
            item.className = "beat-offer-detail";
            const titulo = document.createElement("strong");
            titulo.textContent = oferta.tipo;
            const preco = document.createElement("span");
            preco.textContent =
              oferta.precoCentavos === null
                ? "Preço sob consulta"
                : `R$ ${(oferta.precoCentavos / 100).toFixed(2).replace(".", ",")}`;
            const descricao = document.createElement("small");
            descricao.textContent =
              oferta.descricao || "Sem descrição adicional.";
            item.append(titulo, preco, descricao);
            ofertas.append(item);
          });
        }
      }
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

  const linksConfiguracao = [
    ...document.querySelectorAll("[data-settings-link]"),
  ];
  const atualizarSecaoConfiguracao = linkAtivo => {
    linksConfiguracao.forEach(link => {
      const ativo = link === linkAtivo;
      link.classList.toggle("active", ativo);
      if (ativo) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  linksConfiguracao.forEach(link => {
    link.addEventListener("click", () => atualizarSecaoConfiguracao(link));
  });
  const sincronizarSecaoConfiguracao = () => {
    const link = linksConfiguracao.find(
      item => item.getAttribute("href") === window.location.hash
    );
    if (link) atualizarSecaoConfiguracao(link);
  };
  window.addEventListener("hashchange", sincronizarSecaoConfiguracao);
  sincronizarSecaoConfiguracao();

  const aplicarTema = tema => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    document.querySelectorAll("[data-theme-mode]").forEach(botao => {
      botao.setAttribute(
        "aria-pressed",
        String(botao.dataset.themeMode === tema)
      );
    });
    try {
      window.localStorage.setItem("cypher-tema", tema);
    } catch {
      /* armazenamento pode estar bloqueado */
    }
  };
  let temaSalvo = "light";
  try {
    temaSalvo =
      window.localStorage.getItem("cypher-tema") === "dark" ? "dark" : "light";
  } catch {
    /* usa o tema claro padrão */
  }
  aplicarTema(temaSalvo);
  document.querySelectorAll("[data-theme-mode]").forEach(botao => {
    botao.addEventListener("click", () => aplicarTema(botao.dataset.themeMode));
  });

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
    Instrumental: {
      contexto: "Material instrumental",
      sugestao:
        "Informe os dados essenciais do instrumental e, se quiser, um link para escuta.",
      campos: ["bpm", "description", "release-date", "listen-link"],
      creditos: "Créditos do instrumental",
      lancamento: "Identificação e disponibilidade do instrumental",
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

  const listaPerfisCredito = document.querySelector(
    "[data-profile-credit-list]"
  );
  document
    .querySelector("[data-add-profile-credit]")
    ?.addEventListener("click", () => {
      if (!listaPerfisCredito) return;
      const grupo = document.createElement("fieldset");
      grupo.className = "ghost-entry credit-entry";
      grupo.dataset.creditEntry = "";
      const legenda = document.createElement("legend");
      legenda.textContent = "Perfil Cypher";
      const linha = document.createElement("div");
      linha.className = "form-grid";
      const criarCampo = (rotulo, nome, placeholder, maxLength, required) => {
        const campo = document.createElement("label");
        campo.textContent = rotulo;
        const entrada = document.createElement("input");
        entrada.type = "text";
        entrada.name = nome;
        entrada.maxLength = maxLength;
        entrada.placeholder = placeholder;
        entrada.required = required;
        if (nome === "perfilCreditoHandle") {
          entrada.setAttribute("list", "perfis-cypher");
          entrada.autocomplete = "off";
        }
        campo.appendChild(entrada);
        return campo;
      };
      linha.append(
        criarCampo(
          "Identificador do perfil",
          "perfilCreditoHandle",
          "@identificador",
          81,
          true
        ),
        criarCampo("Função", "perfilCreditoPapel", "Ex.: composição", 80, true),
        criarCampo(
          "Participação",
          "perfilCreditoParticipacao",
          "Ex.: 50%",
          30,
          false
        )
      );
      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "text-link ghost-remove";
      remover.dataset.removeCreditEntry = "";
      remover.textContent = "Remover crédito";
      grupo.append(legenda, linha, remover);
      listaPerfisCredito.appendChild(grupo);
      grupo.querySelector("input")?.focus();
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
    nome.name = "mencaoFantasmaNome";
    nome.maxLength = 100;
    nome.placeholder = "Nome artístico ou profissional";
    nome.required = true;
    campoNome.appendChild(nome);
    const campoPapel = document.createElement("label");
    campoPapel.textContent = "Crédito";
    const papel = document.createElement("input");
    papel.name = "mencaoFantasmaPapel";
    papel.maxLength = 80;
    papel.placeholder = "Ex.: composição, produção, feat";
    papel.required = true;
    campoPapel.appendChild(papel);
    const campoParticipacao = document.createElement("label");
    campoParticipacao.textContent = "Participação (opcional)";
    const participacao = document.createElement("input");
    participacao.name = "mencaoFantasmaParticipacao";
    participacao.maxLength = 30;
    participacao.placeholder = "Ex.: 50%";
    campoParticipacao.appendChild(participacao);
    linha.append(campoNome, campoPapel, campoParticipacao);
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "text-link ghost-remove";
    remover.dataset.removeCreditEntry = "";
    remover.textContent = "Remover menção";
    grupo.append(legenda, linha, remover);
    listaMenções.appendChild(grupo);
    nome.focus();
  });

  document.addEventListener("click", evento => {
    if (!(evento.target instanceof Element)) return;
    const remover = evento.target.closest("[data-remove-credit-entry]");
    if (remover)
      remover.closest("[data-credit-entry], [data-ghost-entry]")?.remove();
  });

  document
    .querySelector("[data-central-search]")
    ?.addEventListener("submit", evento => {
      evento.preventDefault();
      const campo = evento.currentTarget.querySelector("input");
      const consulta = campo.value.trim().toLocaleLowerCase("pt-BR");
      document.querySelectorAll("[data-faq-item]").forEach(item => {
        item.hidden = !item.textContent
          .toLocaleLowerCase("pt-BR")
          .includes(consulta);
      });
    });
})();

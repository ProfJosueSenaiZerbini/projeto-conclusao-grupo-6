/* Módulo ES do frontend Cypher. */
(() => {
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
})();

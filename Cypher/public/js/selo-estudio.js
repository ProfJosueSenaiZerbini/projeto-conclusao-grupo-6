import { atualizarFaixa } from "./controles-faixa.js";
import { desenharSelo } from "./selo-render.js";
import { bibliotecaSelo } from "./selo-biblioteca.js";
import { vetorPorId, vetores } from "./selo-vetores.js";
import {
  baseSelo,
  converterSelo,
  copia,
  criarHistorico,
  modeloSelo,
  modelos,
  novaCamada,
  tipologias,
  zona,
} from "./selo-estado.js";

const raiz = document.querySelector("[data-selo-estudio]");
if (raiz) iniciar(raiz);

function iniciar(raiz) {
  const cfg = JSON.parse(raiz.dataset.config);
  const r = cfg.recursosEstudio;
  const fallback = raiz.parentElement.querySelector("[data-seal-editor]");
  const csrf = fallback.elements._csrf.value;
  const publicado = cfg.composicao ? JSON.parse(cfg.composicao) : null;
  const inicial = publicado
    ? { ...publicado, estrutura: publicado.estrutura || baseSelo().estrutura }
    : converterSelo(
        cfg.formaAtual,
        cfg.corAtual,
        cfg.iniciaisSelo,
        cfg.simboloAtual
      );
  const mark = '<span class="pf-seal" aria-hidden="true"></span>';
  const categorias = {
    modelos: "Modelos",
    forma: "Forma",
    letras: "Monograma",
    simbolos: "Símbolos",
    cores: "Cores",
    bordas: "Contornos",
    fundo: "Fundo",
    textura: "Texturas",
    ornamentos: "Ornamentos",
    composicao: "Composição",
    camadas: "Camadas",
    marcas: "Marcas",
    revisao: "Conferência",
    versoes: "Versões anteriores",
  };
  const etapas = [
    {
      id: "base",
      nome: "Base",
      resumo: "Modelo, formato e paleta",
      descricao:
        "Escolha um ponto de partida e defina a estrutura visual do selo.",
      ferramentas: ["modelos", "forma", "cores", "fundo", "bordas"],
    },
    {
      id: "elementos",
      nome: "Elementos",
      curto: "Itens",
      resumo: "Letras, símbolos e marcas",
      descricao: "Adicione os elementos que vão formar a sua assinatura.",
      ferramentas: ["letras", "simbolos", "ornamentos", "marcas"],
    },
    {
      id: "composicao",
      nome: "Composição",
      curto: "Arranjo",
      resumo: "Distribuição e camadas",
      descricao:
        "Organize as posições e a sobreposição antes dos retoques finais.",
      ferramentas: ["composicao", "camadas"],
    },
    {
      id: "acabamento",
      nome: "Acabamento",
      curto: "Retoque",
      resumo: "Textura e superfície",
      descricao:
        "Dê o toque final ao selo sem mudar a distribuição dos elementos.",
      ferramentas: ["textura"],
    },
    {
      id: "revisao",
      nome: "Revisão",
      resumo: "Conferir e publicar",
      descricao: "Confira como o selo aparece no perfil antes de publicar.",
      ferramentas: ["revisao", "versoes"],
    },
  ];
  const exclusivas = new Set([
    "fundo",
    "bordas",
    "ornamentos",
    "marcas",
    "camadas",
  ]);
  const permitidas = etapa =>
    etapa.ferramentas.filter(k => modo === "avancado" || !exclusivas.has(k));
  const etapaAtual = () =>
    etapas.findIndex(etapa => etapa.ferramentas.includes(categoria));
  const ultimasFerramentas = new Map();
  let h = criarHistorico(inicial),
    salvo = JSON.stringify(inicial);
  let modo = "simples",
    categoria = "modelos",
    selecionada = null,
    trocarVetor = null;
  let versoes = [],
    imagens = [],
    comparar = false,
    carregando = true,
    enviando = false,
    guias = false,
    quadro,
    drag;
  let ultimoRender = JSON.stringify(inicial),
    ignorarSaida = false;
  const bloqueios = new Set();
  const $ = s => raiz.querySelector(s);
  const esc = x =>
    String(x ?? "").replace(
      /[&<>"']/g,
      c =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]
    );
  const idioma = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const rotulo = l =>
    l.nome ||
    tipologias[l.tipo] +
      (l.valor && l.tipo !== "imagem"
        ? " · " +
          (["simbolo", "ornamento"].includes(l.tipo)
            ? vetorPorId(l.valor)?.nome || l.valor
            : l.valor)
        : "");
  const sujeito = () => h.atual.camadas.find(l => l.id === selecionada);
  const biblioteca = bibliotecaSelo(cfg.autor, v => {
    const anterior = h.atual.camadas.find(
      l => l.id === trocarVetor && !l.bloquear
    );
    if (anterior) {
      h.alterar(c => {
        c.camadas.find(l => l.id === anterior.id).valor = v.id;
      });
      selecionada = anterior.id;
      trocarVetor = null;
    } else {
      const adicionado = camadaAdicionada(
        v.categoria === "ornamentos" ? "ornamento" : "simbolo",
        v.id
      );
      if (!adicionado) return;
    }
    biblioteca.usar(v.id);
    redesenhar();
    [...raiz.querySelectorAll("[data-vetor-escolher]")]
      .find(b => b.dataset.vetorEscolher === v.id)
      ?.focus({ preventScroll: true });
  });
  const dirty = () => JSON.stringify(h.atual) !== salvo;
  const btn = (acao, label, extra = "") =>
    '<button type="button" data-acao="' +
    acao +
    '" ' +
    extra +
    ">" +
    label +
    "</button>";
  const atributos = (path, disabled) =>
    'data-prop="' + path + '"' + (disabled ? " disabled" : "");
  function menu(path, label, opcoes, v, disabled = false) {
    return (
      "<label>" +
      label +
      "<select " +
      atributos(path, disabled) +
      ">" +
      Object.entries(opcoes)
        .map(
          ([k, n]) =>
            '<option value="' +
            esc(k) +
            '"' +
            (k === v ? " selected" : "") +
            ">" +
            esc(n) +
            "</option>"
        )
        .join("") +
      "</select></label>"
    );
  }
  function campo(path, label, v, max, disabled = false) {
    return (
      "<label>" +
      label +
      "<input " +
      atributos(path, disabled) +
      ' maxlength="' +
      max +
      '" type="text" autocomplete="off" value="' +
      esc(v) +
      '"></label>'
    );
  }
  function num(
    path,
    label,
    v,
    min,
    max,
    step = 1,
    disabled = false,
    tipo = "number"
  ) {
    return (
      "<label>" +
      label +
      "<input " +
      atributos(path, disabled) +
      ' type="' +
      tipo +
      '" min="' +
      min +
      '" max="' +
      max +
      '" step="' +
      step +
      '" value="' +
      v +
      '"></label>'
    );
  }
  function check(path, label, v, disabled = false) {
    return (
      '<label class="se-check"><input ' +
      atributos(path, disabled) +
      ' type="checkbox"' +
      (v ? " checked" : "") +
      ">" +
      label +
      "</label>"
    );
  }
  function cor(path, label, v, disabled = false) {
    return (
      '<div class="se-color">' +
      campo(path, label, v, 7, disabled) +
      '<input aria-label="Seletor: ' +
      label +
      '" ' +
      atributos(path, disabled) +
      ' type="color" value="' +
      (v || "#ffffff") +
      '">' +
      btn(
        "cor-automatica",
        "Usar paleta",
        'data-valor="' + path + '"' + (disabled ? " disabled" : "")
      ) +
      "</div>"
    );
  }

  raiz.innerHTML =
    '<div class="se-toolbar"><div class="se-modos" role="group" aria-label="Modo de edição">' +
    btn("modo", "Simplificado", 'data-valor="simples" aria-pressed="true"') +
    btn("modo", "Avançado", 'data-valor="avancado" aria-pressed="false"') +
    '</div><div class="se-actions">' +
    btn("undo", "Desfazer") +
    btn("redo", "Refazer") +
    btn("sorteio", "Sortear") +
    btn("reset", "Restaurar") +
    "</div></div>" +
    '<div class="se-mobile-bar" aria-label="Atalhos do Estúdio" role="group">' +
    btn(
      "ver-previa",
      mark + "<span>Prévia</span>",
      'aria-label="Ver prévia em tamanho maior" aria-controls="se-painel-previa"'
    ) +
    btn("ir-etapas", "Etapas", 'aria-controls="se-menu-etapas"') +
    btn(
      "undo-mobile",
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v2"/></svg>',
      'aria-label="Desfazer" title="Desfazer"'
    ) +
    btn(
      "redo-mobile",
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 5 5 5-5 5m5-5h-9a6 6 0 0 0-6 6v2"/></svg>',
      'aria-label="Refazer" title="Refazer"'
    ) +
    "</div>" +
    '<nav class="se-stepper" id="se-menu-etapas" aria-label="Etapas do Estúdio de Selos"><ol></ol></nav>' +
    '<div class="se-layout"><section class="se-preview" id="se-painel-previa" aria-labelledby="se-previa">' +
    '<header><div><span class="se-kicker">VISUALIZAÇÃO</span><h4 id="se-previa" tabindex="-1">Prévia do selo</h4></div><span class="se-live">Prévia ao vivo</span>' +
    btn("voltar-edicao", "Voltar à edição", 'class="se-preview-back"') +
    "</header>" +
    '<div class="se-canvas" tabindex="0" data-fundo="neutro" aria-label="Área de composição; no modo avançado, use as setas para mover a camada selecionada"><div class="se-ampliada">' +
    mark +
    "</div></div>" +
    '<div class="se-controles-previa"><div class="se-view se-view-zoom"><label><span class="se-controle-titulo"><span>Zoom</span><output data-zoom-valor aria-hidden="true">100%</output></span><input type="range" data-zoom min="55" max="140" value="100" aria-label="Zoom da prévia" aria-valuetext="100%"></label><div class="se-view-acoes">' +
    btn("centralizar", "Redefinir zoom") +
    btn("guias", "Guias", 'aria-pressed="false"') +
    "</div></div>" +
    '<div class="se-view se-view-contexto"><label>Fundo da prévia <select data-fundo-previa><option value="neutro">Neutro</option><option value="claro">Claro</option><option value="escuro">Escuro</option><option value="colorido">Colorido</option><option value="transparente">Transparente</option></select></label>' +
    btn("comparar", "Comparar com publicado", 'aria-pressed="false"') +
    "</div></div>" +
    '<div class="se-compare" hidden></div>' +
    '<div class="se-perfil"><span class="se-contexto">' +
    mark +
    "</span><span><strong>" +
    esc(cfg.nome || "Seu perfil") +
    "</strong><small>Profissional na Cypher · 48 px</small></span></div>" +
    '<details class="se-amostras"><summary>Legibilidade em outros tamanhos</summary><div class="se-sizes">' +
    [16, 24, 32, 64, 96]
      .map(
        n =>
          '<div><i style="--seal-size:' +
          n +
          'px">' +
          mark +
          "</i><small>" +
          n +
          " px</small></div>"
      )
      .join("") +
    "</div></details>" +
    '<p class="se-avisos"></p></section>' +
    '<section class="se-ferramentas" aria-labelledby="se-titulo-etapa"><header class="se-etapa-intro"><span class="se-kicker"></span><h4 id="se-titulo-etapa" tabindex="-1"></h4><p></p></header>' +
    '<nav class="se-tools" aria-label="Ferramentas desta etapa"></nav><div class="se-propriedades" id="se-painel-opcoes"></div>' +
    '<footer class="se-work-footer"><nav class="se-step-actions" aria-label="Voltar ou avançar etapa"></nav>' +
    '<div class="se-save"><p role="status" class="se-status">Carregando o estúdio…</p><div>' +
    btn("rascunho", "Salvar rascunho") +
    btn("publicar", "Publicar selo", 'class="button button-lime"') +
    "</div></div></footer></section></div>" +
    '<dialog class="se-sair cy-confirm" aria-labelledby="se-titulo-sair"><form method="dialog"><h2 id="se-titulo-sair">Alterações não salvas</h2>' +
    '<p>Quer guardar a composição antes de sair do estúdio?</p><div class="se-inline">' +
    '<button value="continuar" autofocus>Continuar editando</button><button value="salvar">Salvar rascunho e sair</button>' +
    '<button value="descartar">Sair sem salvar</button></div></form></dialog>';
  function ajustarZoom(campo) {
    const zoom = Number(campo.value);
    const leitura = zoom + "%";
    $("[data-zoom-valor]").value = leitura;
    campo.setAttribute("aria-valuetext", leitura);
    atualizarFaixa(campo);
    $(".se-ampliada").style.setProperty("--se-zoom", zoom / 100);
  }
  ajustarZoom($("[data-zoom]"));
  if (
    cfg.composicao ||
    cfg.imagem ||
    raiz.parentElement.querySelector("[data-seal-editor] [value=retirar]")
  ) {
    const origem = fallback.querySelector(".pf-seal-remove-confirm");
    if (origem) {
      const form = document.createElement("form");
      form.action = fallback.action;
      form.method = "post";
      form.className = "se-retirar";
      form.append(fallback.elements._csrf.cloneNode(), origem);
      raiz.append(form);
    }
  }
  $(".se-layout").prepend($(".se-ferramentas"));
  const navPerfil = raiz
    .closest(".profile-edit-layout")
    ?.querySelector(".profile-edit-sidebar");
  if (navPerfil && "ResizeObserver" in window) {
    new ResizeObserver(([entrada]) => {
      raiz.style.setProperty(
        "--se-profile-nav",
        Math.ceil(entrada.target.offsetHeight) + "px"
      );
    }).observe(navPerfil);
  }
  raiz.hidden = false;
  fallback.hidden = true;
  // The profile tabs and the mini preview both remain visible on narrow screens.
  // Native focus scrolling can place a field behind either one or the app dock.
  raiz.addEventListener("focusin", ({ target }) => {
    if (
      !matchMedia("(max-width: 900px)").matches ||
      !target.matches("input, select, button, summary") ||
      !target.closest(".se-layout, .se-stepper")
    )
      return;
    requestAnimationFrame(() => {
      if (
        document.activeElement !== target ||
        !target.matches(":focus-visible")
      )
        return;
      const { left, top, width, height } = target.getBoundingClientRect();
      const emCima = document.elementFromPoint(
        left + width / 2,
        top + height / 2
      );
      if (width && height && !target.contains(emCima))
        target.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "instant",
        });
    });
  });

  function renderNav() {
    const indice = etapaAtual();
    const etapa = etapas[indice];
    const etapaMudou = raiz.dataset.etapa !== etapa.id;
    const modoMudou = raiz.dataset.modo !== modo;
    const ferramentaMudou = raiz.dataset.ferramenta !== categoria;
    if (etapaMudou) {
      raiz.dataset.etapa = etapa.id;
      $(".se-stepper ol").innerHTML = etapas
        .map(
          ({ id, nome, curto, resumo }, i) =>
            "<li>" +
            btn(
              "etapa",
              '<span class="se-step-number" aria-hidden="true">' +
                String(i + 1).padStart(2, "0") +
                '</span><span class="se-step-copy"><strong class="se-step-full">' +
                nome +
                "</strong>" +
                '<strong class="se-step-short">' +
                (curto || nome) +
                "</strong><small>" +
                resumo +
                "</small></span>",
              'data-valor="' +
                id +
                '" aria-label="Etapa ' +
                (i + 1) +
                ": " +
                nome +
                '"' +
                (i === indice ? ' aria-current="step"' : "")
            ) +
            "</li>"
        )
        .join("");
      $(".se-etapa-intro .se-kicker").textContent =
        "ETAPA " + String(indice + 1).padStart(2, "0") + " / 0" + etapas.length;
      $("#se-titulo-etapa").textContent = etapa.nome;
      $(".se-etapa-intro p").textContent = etapa.descricao;
      $(".se-step-actions").innerHTML =
        (indice > 0
          ? btn(
              "etapa-seguinte",
              '<span aria-hidden="true">←</span> ' + etapas[indice - 1].nome,
              'data-valor="' +
                etapas[indice - 1].id +
                '" aria-label="Voltar: ' +
                etapas[indice - 1].nome +
                '"'
            )
          : "") +
        (indice < etapas.length - 1
          ? btn(
              "etapa-seguinte",
              etapas[indice + 1].nome + ' <span aria-hidden="true">→</span>',
              'data-valor="' +
                etapas[indice + 1].id +
                '" aria-label="Avançar: ' +
                etapas[indice + 1].nome +
                '" class="se-next"'
            )
          : "");
      $('[data-acao="publicar"]').hidden = etapa.id !== "revisao";
    }
    if (etapaMudou || modoMudou || ferramentaMudou) {
      raiz.dataset.ferramenta = categoria;
      $(".se-tools").innerHTML = permitidas(etapa)
        .map(k =>
          btn(
            "categoria",
            categorias[k],
            'data-valor="' +
              k +
              '" aria-controls="se-painel-opcoes" aria-pressed="' +
              (k === categoria) +
              '"'
          )
        )
        .join("");
      $(".se-tools").hidden = etapa.ferramentas.length === 1;
    }
    ultimasFerramentas.set(etapa.id, categoria);
    raiz.dataset.modo = modo;
    raiz
      .querySelectorAll('[data-acao="modo"]')
      .forEach(el =>
        el.setAttribute("aria-pressed", el.dataset.valor === modo)
      );
  }
  const status = mensagem => {
    $(".se-status").textContent = mensagem;
  };
  function atualizarBotoes() {
    $('[data-acao="undo-mobile"]').disabled = !h.podeDesfazer;
    $('[data-acao="redo-mobile"]').disabled = !h.podeRefazer;
    for (const a of [
      "undo",
      "redo",
      "reset",
      "publicar",
      "rascunho",
      "comparar",
    ]) {
      $('[data-acao="' + a + '"]').disabled =
        a === "undo"
          ? !h.podeDesfazer
          : a === "redo"
            ? !h.podeRefazer
            : a === "reset"
              ? !dirty()
              : a === "comparar"
                ? !(
                    publicado ||
                    cfg.imagem ||
                    versoes.some(v => !v.retirado_em)
                  )
                : enviando || carregando;
    }
    const atual = JSON.stringify(h.atual);
    if (!enviando && atual !== ultimoRender && dirty())
      status("Alterações não salvas.");
    else if (!enviando && atual !== ultimoRender)
      status("A composição está igual ao último estado salvo.");
    ultimoRender = atual;
  }
  function avisos(c) {
    const ativas = c.camadas.filter(l => l.mostrar && l.opacidade && l.valor);
    const alertas = [];
    if (ativas.some(l => l.x < 12 || l.x > 88 || l.y < 12 || l.y > 88))
      alertas.push("Há elementos fora da área segura.");
    if (
      ativas.some(
        l =>
          (l.tipo === "texto" && l.escala < 70) || (l.compacta && l.escala < 55)
      )
    )
      alertas.push("Confira a leitura dos elementos pequenos.");
    if (
      ativas.some(
        l => l.cor && (l.cor === c.fundo.cor || l.cor === c.fundo.segunda)
      )
    )
      alertas.push("Há cor de elemento igual à do fundo.");
    if (ativas.length > 6)
      alertas.push("Confira o excesso de detalhes nas prévias compactas.");
    if (!ativas.some(l => l.compacta))
      alertas.push("Nenhum elemento marcado para a versão compacta.");
    $(".se-avisos").textContent = alertas.join(" ");
  }
  function render() {
    const base = h.atual;
    const c = drag?.pos
      ? {
          ...base,
          camadas: base.camadas.map(l =>
            l.id === drag.id ? { ...l, ...drag.pos } : l
          ),
        }
      : base;
    // Não substitua o alvo SVG durante um gesto de toque. Ele precisa
    // continuar conectado até o navegador concluir a sequência de eventos.
    if (drag) {
      if (drag.pos)
        drag.no.setAttribute(
          "transform",
          drag.antes.replace(
            /^translate\([^)]+\)/,
            "translate(" + drag.pos.x + " " + drag.pos.y + ")"
          )
        );
    } else {
      desenharSelo($(".se-ampliada .pf-seal"), c, {
        selecionada: modo === "avancado" ? selecionada : null,
        guias,
      });
    }
    desenharSelo($(".se-contexto .pf-seal"), c, { compacta: true });
    desenharSelo($(".se-mobile-bar .pf-seal"), c, { compacta: true });
    if ($(".se-amostras").open)
      raiz
        .querySelectorAll(".se-sizes .pf-seal")
        .forEach((s, i) => desenharSelo(s, c, { compacta: i < 4 }));
    avisos(c);
    atualizarBotoes();
  }
  function fila() {
    if (!quadro)
      quadro = requestAnimationFrame(() => {
        quadro = null;
        render();
      });
  }
  function renderComparar() {
    const alvo = $(".se-compare");
    alvo.hidden = !comparar;
    $('[data-acao="comparar"]').setAttribute("aria-pressed", comparar);
    if (!comparar) return;
    alvo.innerHTML =
      "<span>Publicado</span>" +
      (cfg.imagem
        ? '<img width="48" height="48" alt="Marca publicada">'
        : mark);
    if (cfg.imagem) alvo.querySelector("img").src = cfg.imagem;
    else
      desenharSelo(
        alvo.querySelector(".pf-seal"),
        publicado || versaoLocal(versoes.find(v => !v.retirado_em)) || inicial,
        { compacta: true }
      );
  }
  const versaoLocal = v =>
    v && (v.composicao || converterSelo(v.forma, v.cor, v.letras, v.simbolo));
  const simples = () => modo === "simples";
  function controlesCamada(l) {
    if (!l) return "<p>Selecione uma camada para editar suas propriedades.</p>";
    const p = "camadas." + h.atual.camadas.indexOf(l) + ".",
      b = l.bloquear;
    const texto = l.tipo === "letras" || l.tipo === "texto";
    return (
      '<div class="se-layer-options"><div class="se-layer-heading"><h5>' +
      esc(rotulo(l)) +
      "</h5>" +
      (b
        ? "<small>Camada bloqueada</small>"
        : "<small>Camada selecionada</small>") +
      '</div><fieldset class="se-fields"><legend>Aparência da camada</legend>' +
      (texto
        ? campo(
            p + "valor",
            l.tipo === "letras" ? "Letras ou números" : "Texto complementar",
            l.valor,
            l.tipo === "letras" ? 6 : 36,
            b
          ) +
          menu(p + "fonte", "Fonte", r.fontes, l.fonte, b) +
          num(p + "peso", "Peso", l.peso, 400, 900, 100, b) +
          num(p + "espaco", "Espaçamento", l.espaco, -4, 6, 0.5, b) +
          num(p + "curva", "Curvatura", l.curva, -40, 40, 1, b, "range")
        : l.tipo === "imagem"
          ? check(p + "recorte", "Preencher e recortar", l.recorte, b) +
            check(p + "mono", "Monocromático", l.mono, b)
          : btn(
              "trocar-vetor",
              "Trocar desenho",
              'data-valor="' + l.id + '"' + (b ? " disabled" : "")
            ) +
            check(p + "preencher", "Preenchimento", l.preencher !== false, b) +
            menu(
              p + "trama",
              "Textura do vetor",
              r.texturas,
              l.trama || "nenhuma",
              b
            ) +
            menu(
              p + "acabamentoVetor",
              "Acabamento do vetor",
              r.acabamentos,
              l.acabamentoVetor || "fosco",
              b
            )) +
      campo(p + "nome", "Nome da camada", l.nome, 48, b) +
      (l.tipo === "imagem"
        ? ""
        : cor(p + "cor", "Cor da camada (hex)", l.cor, b) +
          cor(p + "contorno", "Cor do traço (hex)", l.contorno, b) +
          num(
            p + "espessura",
            "Espessura do traço",
            l.espessura,
            0,
            4,
            0.25,
            b
          )) +
      '</fieldset><fieldset class="se-fields"><legend>Posição e tamanho</legend>' +
      num(p + "x", "Posição X", l.x, -20, 120, 1, b) +
      num(p + "y", "Posição Y", l.y, -20, 120, 1, b) +
      num(p + "largura", "Largura (%)", l.largura, 25, 180, 1, b) +
      num(p + "altura", "Altura (%)", l.altura, 25, 180, 1, b) +
      num(p + "escala", "Escala (%)", l.escala, 10, 220, 1, b) +
      num(p + "rotacao", "Rotação (°)", l.rotacao, -180, 180, 1, b) +
      num(
        p + "opacidade",
        "Opacidade (%)",
        l.opacidade,
        0,
        100,
        1,
        b,
        "range"
      ) +
      check(p + "flip", "Espelhar", l.flip, b) +
      check(p + "compacta", "Manter no selo compacto", l.compacta, b) +
      "</fieldset></div>"
    );
  }

  function painel() {
    const c = h.atual,
      l = sujeito(),
      alvo = $(".se-propriedades");
    let html = "";
    if (categoria === "modelos")
      html +=
        '<div class="se-panel-intro"><p>Todos os modelos são editáveis.</p>' +
        btn("vazio", "Começar do zero") +
        "</div>" +
        '<div class="se-grid">' +
        modelos
          .map(([nome], i) =>
            btn(
              "modelo",
              mark +
                (nome.length > 12 ? '<span class="se-model-long">' : "<span>") +
                nome +
                "</span>",
              'data-valor="' + i + '"'
            )
          )
          .join("") +
        "</div>";
    if (categoria === "forma")
      html +=
        '<div class="se-grid">' +
        Object.entries(cfg.formasSelo)
          .map(([k, n]) =>
            btn(
              "forma",
              '<span class="pf-seal" data-forma="' +
                k +
                '" aria-hidden="true"></span><span>' +
                esc(n) +
                "</span>",
              'data-valor="' + k + '" aria-pressed="' + (k === c.forma) + '"'
            )
          )
          .join("") +
        "</div>" +
        (!simples()
          ? '<div class="se-fields">' +
            num("raio", "Cantos (-1 usa o formato original)", c.raio, -1, 50) +
            num(
              "estrutura.largura",
              "Largura da forma (%)",
              c.estrutura.largura,
              65,
              125
            ) +
            num(
              "estrutura.altura",
              "Altura da forma (%)",
              c.estrutura.altura,
              65,
              125
            ) +
            num(
              "estrutura.rotacao",
              "Rotação da forma (°)",
              c.estrutura.rotacao,
              -45,
              45
            ) +
            num(
              "estrutura.margem",
              "Margem interna",
              c.estrutura.margem,
              0,
              20
            ) +
            "</div>"
          : "");
    if (categoria === "letras") {
      const monograma = c.camadas.find(e => e.tipo === "letras");
      html +=
        '<div class="se-fields se-monograma">' +
        campo(
          "monograma",
          "Monograma: até 3 letras ou números",
          monograma?.valor || "",
          6,
          monograma?.bloquear
        ) +
        "</div>";
      if (!simples())
        html +=
          btn("add", "Adicionar texto complementar", 'data-valor="texto"') +
          (monograma && l?.id !== monograma.id
            ? btn(
                "propriedades",
                "Ajustar monograma",
                'data-valor="' + monograma.id + '"'
              )
            : "") +
          (l && (l.tipo === "letras" || l.tipo === "texto")
            ? controlesCamada(l)
            : "");
    }
    if (categoria === "simbolos" || categoria === "ornamentos") {
      const emTroca = c.camadas.find(e => e.id === trocarVetor && !e.bloquear);
      if (emTroca)
        html +=
          '<p class="se-vetor-aviso">Trocando o desenho de <strong>' +
          esc(rotulo(emTroca)) +
          "</strong>. As outras propriedades ficam como estão.</p>" +
          btn("cancelar-troca-vetor", "Voltar a adicionar");
      else
        html +=
          "<p>Escolha um desenho para adicionar como camada independente." +
          (simples() ? " Use o modo avançado para ajustar cada camada." : "") +
          "</p>";
      if (c.camadas.length >= 12 && !emTroca)
        html +=
          '<p class="se-vetor-aviso">Limite de 12 camadas. Remova uma para adicionar outro desenho.</p>';
      if (!simples() && l && (l.tipo === "simbolo" || l.tipo === "ornamento"))
        html +=
          '<details class="se-vetor-ajustes"><summary>Ajustar ' +
          esc(l.nome || vetorPorId(l.valor)?.nome || "camada") +
          "</summary>" +
          controlesCamada(l) +
          "</details>";
      html += "<div data-selo-biblioteca></div>";
    }
    if (categoria === "cores")
      html +=
        '<div class="se-grid">' +
        Object.entries(cfg.coresSelo)
          .map(([k, n]) =>
            btn(
              "paleta",
              '<span class="pf-seal-color-option" data-cor="' +
                k +
                '"><span class="pf-seal-color-sample"></span></span><span>' +
                esc(n) +
                "</span>",
              'data-valor="' + k + '" aria-pressed="' + (k === c.paleta) + '"'
            )
          )
          .join("") +
        "</div>" +
        (c.fundo.tipo !== "paleta"
          ? btn("aplicar-paleta", "Usar a paleta como fundo")
          : "") +
        (!simples()
          ? '<div class="se-fields">' +
            cor("fundo.cor", "Cor base (hex)", c.fundo.cor) +
            cor("fundo.segunda", "Segunda cor (hex)", c.fundo.segunda) +
            btn("harmonia", "Gerar complementar a partir da cor base") +
            "</div>"
          : "");
    if (categoria === "bordas")
      html += c.bordas
        .map((b, i) => {
          const p = "bordas." + i + ".";
          return (
            '<fieldset class="se-fields"><legend>' +
            (i === 0 ? "Contorno externo" : "Contorno interno") +
            "</legend>" +
            menu(p + "tipo", "Estilo", r.bordas, b.tipo) +
            cor(p + "cor", "Cor (hex)", b.cor) +
            num(p + "espessura", "Espessura", b.espessura, 0, 8, 0.5) +
            num(p + "recuo", "Recuo", b.recuo, 0, 29) +
            num(
              p + "opacidade",
              "Opacidade (%)",
              b.opacidade,
              0,
              100,
              1,
              false,
              "range"
            ) +
            "</fieldset>"
          );
        })
        .join("");
    if (categoria === "fundo")
      html +=
        '<div class="se-fields">' +
        menu("fundo.tipo", "Preenchimento", r.preenchimentos, c.fundo.tipo) +
        cor("fundo.cor", "Cor base (hex)", c.fundo.cor) +
        cor("fundo.segunda", "Segunda cor (hex)", c.fundo.segunda) +
        num(
          "fundo.angulo",
          "Ângulo do degradê linear",
          c.fundo.angulo,
          0,
          360,
          1,
          false,
          "range"
        ) +
        "</div>";
    if (categoria === "textura")
      html +=
        '<div class="se-fields">' +
        menu("acabamento", "Acabamento do selo", r.acabamentos, c.acabamento) +
        menu("textura.tipo", "Textura do selo", r.texturas, c.textura.tipo) +
        (!simples()
          ? num(
              "textura.opacidade",
              "Intensidade (%)",
              c.textura.opacidade,
              0,
              65,
              1,
              false,
              "range"
            ) +
            num(
              "textura.escala",
              "Escala da textura",
              c.textura.escala,
              2,
              16,
              1,
              false,
              "range"
            )
          : "") +
        "</div>";
    if (categoria === "composicao")
      html +=
        '<p>As distribuições mantêm suas cores, fontes e camadas bloqueadas.</p><div class="se-inline">' +
        Object.entries({
          vertical: "Vertical",
          horizontal: "Lado a lado",
          central: "Central",
          diagonal: "Diagonal",
          circular: "Circular",
          invertida: "Vertical invertida",
        })
          .map(([k, n]) => btn("layout", n, 'data-valor="' + k + '"'))
          .join("") +
        "</div>" +
        (!simples()
          ? '<div class="se-inline">' +
            btn(
              "alinhar",
              "Centralizar em X",
              'data-valor="x"' + (!l || l.bloquear ? " disabled" : "")
            ) +
            btn(
              "alinhar",
              "Centralizar em Y",
              'data-valor="y"' + (!l || l.bloquear ? " disabled" : "")
            ) +
            "</div>" +
            controlesCamada(l)
          : "") +
        '<fieldset class="se-fields"><legend>Proteger no sorteio</legend>' +
        Object.entries({
          forma: "Forma",
          paleta: "Paleta",
          fundo: "Fundo",
          textura: "Textura",
          acabamento: "Acabamento",
        })
          .map(
            ([k, n]) =>
              '<label class="se-check"><input type="checkbox" data-bloqueio="' +
              k +
              '"' +
              (bloqueios.has(k) ? " checked" : "") +
              ">" +
              n +
              "</label>"
          )
          .join("") +
        "</fieldset>";
    if (categoria === "camadas")
      html +=
        '<div class="se-inline">' +
        btn("add", "Adicionar texto", 'data-valor="texto"') +
        btn("add", "Adicionar símbolo", 'data-valor="simbolo"') +
        btn("add", "Adicionar ornamento", 'data-valor="ornamento"') +
        "</div>" +
        '<ol class="se-camadas">' +
        [...c.camadas]
          .reverse()
          .map(
            e =>
              '<li data-ordem="' +
              e.id +
              '" draggable="' +
              !e.bloquear +
              '">' +
              btn(
                "camada",
                esc(rotulo(e)),
                'data-valor="' +
                  e.id +
                  '" aria-pressed="' +
                  (e.id === selecionada) +
                  '"'
              ) +
              btn(
                "visibilidade",
                e.mostrar ? "Ocultar" : "Mostrar",
                'data-valor="' + e.id + '"' + (e.bloquear ? " disabled" : "")
              ) +
              btn(
                "bloqueio",
                e.bloquear ? "Desbloquear" : "Bloquear",
                'data-valor="' + e.id + '"'
              ) +
              "</li>"
          )
          .join("") +
        "</ol>" +
        (l
          ? (() => {
              const i = c.camadas.indexOf(l),
                off = l.bloquear ? " disabled" : "";
              return (
                '<div class="se-inline">' +
                btn(
                  "subir",
                  "Subir",
                  off ||
                    (!c.camadas[i + 1] || c.camadas[i + 1].bloquear
                      ? "disabled"
                      : "")
                ) +
                btn(
                  "descer",
                  "Descer",
                  off ||
                    (!c.camadas[i - 1] || c.camadas[i - 1].bloquear
                      ? "disabled"
                      : "")
                ) +
                btn(
                  "duplicar",
                  "Duplicar",
                  off ||
                    (c.camadas.length >= 12 || l.tipo === "letras"
                      ? "disabled"
                      : "")
                ) +
                btn("reset-camada", "Restaurar camada", off) +
                btn("excluir", "Excluir", off) +
                "</div>"
              );
            })()
          : "") +
        controlesCamada(l);
    if (categoria === "marcas")
      html +=
        "<p>Use sua imagem como camada. Enquanto estiver em análise ela só pode aparecer no seu rascunho.</p>" +
        '<form class="se-cadastro-marca se-fields"><label>Imagem PNG ou JPEG, até 64 KB<input required type="file" accept="image/png,image/jpeg" name="imagem"></label>' +
        '<label>Sobre a marca<input required minlength="10" maxlength="1500" name="justificativa"></label><label class="se-check"><input required type="checkbox" name="direitos" value="sim">Tenho autorização para usar a marca</label>' +
        '<button type="submit">Enviar para análise</button></form><div class="se-versoes">' +
        imagens
          .map(
            i =>
              '<div><img width="38" height="38" alt="" src="/selos/imagem/' +
              esc(i.id) +
              '"><span>' +
              esc(i.justificativa.slice(0, 50)) +
              "<br><small>" +
              (i.estado === "pendente" ? "Em análise" : "Aprovada") +
              "</small></span>" +
              btn(
                "marca",
                "Adicionar à composição",
                'data-valor="' + esc(i.id) + '"'
              ) +
              "</div>"
          )
          .join("") +
        "</div>" +
        (l?.tipo === "imagem" ? controlesCamada(l) : "");
    if (categoria === "revisao")
      html +=
        '<div class="se-review"><h5>Antes de publicar</h5>' +
        "<ol><li>Confira se as letras e os símbolos continuam legíveis em tamanho de perfil.</li>" +
        "<li>Experimente fundos claros e escuros na prévia para checar o contraste.</li></ol>" +
        "<p>Salvar rascunho não muda o perfil. Publicar atualiza o selo visível na Cypher.</p>" +
        btn(
          "conferir-previa",
          "Conferir prévia",
          'aria-controls="se-painel-previa"'
        ) +
        "</div>";
    if (categoria === "versoes")
      html += versoes.length
        ? '<p>Restaurar carrega uma cópia para edição. Só publicar muda o perfil.</p><div class="se-versoes">' +
          versoes
            .map(
              v =>
                '<div data-versao="' +
                esc(v.id) +
                '">' +
                mark +
                "<span>" +
                esc(idioma.format(v.criado_em)) +
                "<br><small>" +
                (!v.retirado_em ? "Publicado" : "Versão anterior") +
                "</small></span>" +
                btn(
                  "versao-comparar",
                  "Comparar",
                  'data-valor="' + esc(v.id) + '"'
                ) +
                btn("versao", "Restaurar", 'data-valor="' + esc(v.id) + '"') +
                "</div>"
            )
            .join("") +
          "</div>"
        : "<p>Nenhuma versão nativa publicada ainda.</p>";
    alvo.innerHTML = html;
    alvo.querySelectorAll('input[type="range"]').forEach(atualizarFaixa);
    if (categoria === "modelos")
      alvo
        .querySelectorAll('[data-acao="modelo"]')
        .forEach((el, i) =>
          desenharSelo(
            el.firstElementChild,
            modeloSelo(modelos[i], cfg.iniciaisSelo || "CY"),
            { compacta: true }
          )
        );
    if (categoria === "versoes")
      alvo.querySelectorAll("[data-versao]").forEach((el, i) =>
        desenharSelo(el.firstElementChild, versaoLocal(versoes[i]), {
          compacta: true,
        })
      );
    const acervo = alvo.querySelector("[data-selo-biblioteca]");
    if (acervo)
      biblioteca.montar(acervo, {
        origem: categoria === "ornamentos" ? "ornamentos" : "",
        troca: Boolean(
          trocarVetor &&
          c.camadas.some(l => l.id === trocarVetor && !l.bloquear)
        ),
        cheio: c.camadas.length >= 12,
      });
  }
  function set(c, path, value) {
    const partes = path.split("."),
      chave = partes.pop();
    const alvo = partes.reduce((a, k) => a[k], c);
    if (alvo) alvo[chave] = value;
  }
  function valorCampo(el) {
    const p = el.dataset.prop;
    if (el.type === "checkbox") return el.checked;
    if (el.type === "range" || el.type === "number")
      return Number.isFinite(el.valueAsNumber)
        ? zona(el.valueAsNumber, Number(el.min), Number(el.max))
        : undefined;
    if (
      p === "monograma" ||
      (p.endsWith(".valor") &&
        el.type === "text" &&
        sujeito()?.tipo === "letras")
    )
      return [
        ...el.value
          .normalize("NFC")
          .toLocaleUpperCase("pt-BR")
          .replace(/[^\p{L}0-9]/gu, ""),
      ]
        .slice(0, 3)
        .join("");
    if (p.endsWith(".nome"))
      return el.value
        .replace(/[^\p{L}\p{M}\p{N} .,'’!?()+&/—·-]/gu, "")
        .slice(0, 48);
    if (p.endsWith(".valor") && el.type === "text")
      return [
        ...el.value
          .normalize("NFC")
          .replace(/[^\p{L}\p{M}\p{N} .,'’!?:+&/—·-]/gu, ""),
      ]
        .slice(0, 36)
        .join("");
    if (/(\.cor|\.segunda|\.contorno)$/.test(p))
      return /^#[a-f0-9]{6}$/i.test(el.value)
        ? el.value.toLowerCase()
        : el.value === ""
          ? ""
          : undefined;
    return el.value;
  }
  function editarCampo(el, continua) {
    const p = el.dataset.prop,
      v = valorCampo(el);
    if (el.type === "text")
      el.setAttribute("aria-invalid", String(v === undefined));
    if (v === undefined) return;
    h.alterar(c => {
      if (p === "monograma") {
        const l = c.camadas.find(e => e.tipo === "letras");
        if (l && !l.bloquear) l.valor = v;
        else if (!l && v && c.camadas.length < 12)
          c.camadas.push(
            novaCamada("letras", v, {
              y: c.camadas.some(e => e.tipo === "simbolo") ? 58 : 50,
            })
          );
      } else {
        set(c, p, v);
        if (p.endsWith(".preencher") && !v) {
          const camada = c.camadas[Number(p.split(".")[1])];
          if (camada.espessura === 0) {
            camada.espessura = 1;
            const controle = el
              .closest("fieldset")
              ?.querySelector('[data-prop$=".espessura"]');
            if (controle) controle.value = "1";
          }
        }
        if (/^fundo\.(cor|segunda)$/.test(p) && v && c.fundo.tipo === "paleta")
          c.fundo.tipo = p.endsWith("segunda") ? "linear" : "solido";
      }
    }, continua);
    if (el.type === "color") {
      for (const input of raiz.querySelectorAll("[data-prop]"))
        if (input !== el && input.dataset.prop === p) input.value = v;
    }
    if (!continua && el.type === "text") el.value = v;
    fila();
  }
  function redesenhar(acao, valor) {
    renderNav();
    painel();
    fila();
    if (acao)
      [...raiz.querySelectorAll("[data-acao]")]
        .find(b => b.dataset.acao === acao && b.dataset.valor === valor)
        ?.focus({ preventScroll: true });
  }
  const confirmar = (m, rotulo) =>
    window.cypherConfirmar?.(m, { rotulo }) ??
    Promise.resolve(window.confirm(m));
  function camadaAdicionada(tipo, valor) {
    if (h.atual.camadas.length >= 12) {
      status("O selo pode ter até 12 camadas.");
      return;
    }
    const n = h.atual.camadas.length;
    const lugares = [
      [50, 29],
      [25, 40],
      [75, 40],
      [36, 75],
      [64, 75],
      [50, 49],
      [41, 34],
      [58, 34],
      [24, 66],
      [76, 66],
    ];
    const [x, y] = ["simbolo", "ornamento"].includes(tipo)
      ? lugares.find(([x, y]) =>
          h.atual.camadas.every(
            l => !l.mostrar || Math.hypot(x - l.x, y - l.y) > 15
          )
        ) || lugares[n % lugares.length]
      : [50, tipo === "texto" ? 75 : 35 + (n % 4) * 5];
    const l = novaCamada(tipo, valor, { x, y });
    selecionada = l.id;
    h.alterar(c => c.camadas.push(l));
    return l.id;
  }
  function distribuir(c, tipo) {
    const livres = c.camadas.filter(l => !l.bloquear && l.mostrar);
    livres.forEach((l, i) => {
      const offset =
        (i - (livres.length - 1) / 2) *
        Math.min(19, 62 / Math.max(livres.length, 1));
      const angulo =
        (2 * Math.PI * i) / Math.max(livres.length, 1) - Math.PI / 2;
      l.x =
        tipo === "circular" && livres.length > 1
          ? Math.round(50 + 28 * Math.cos(angulo))
          : ["horizontal", "diagonal"].includes(tipo)
            ? 50 + offset
            : 50;
      l.y =
        tipo === "circular" && livres.length > 1
          ? Math.round(50 + 28 * Math.sin(angulo))
          : tipo === "invertida"
            ? 50 - offset
            : ["vertical", "diagonal"].includes(tipo)
              ? 50 + offset
              : 50;
    });
  }
  async function carregar() {
    try {
      const resposta = await fetch("/perfil/selo/estudio", {
        headers: { Accept: "application/json" },
      });
      if (!resposta.ok) throw new Error();
      const d = await resposta.json();
      versoes = d.versoes;
      imagens = d.imagens;
      if (d.rascunho && !dirty()) {
        h = criarHistorico(d.rascunho);
        salvo = ultimoRender = JSON.stringify(d.rascunho);
        status("Rascunho recuperado. O selo público não mudou.");
      } else if (!dirty()) status("O perfil só muda quando você publicar.");
      if (["versoes", "marcas"].includes(categoria) || !dirty()) painel();
      fila();
    } catch {
      status(
        "Não consegui carregar o rascunho e as versões. Recarregue antes de salvar para não sobrescrever seu trabalho."
      );
      return;
    }
    carregando = false;
    atualizarBotoes();
  }
  async function gravar(acao) {
    if (enviando || carregando) return false;
    h.concluir();
    if (raiz.querySelector('[aria-invalid="true"]')) {
      status("Revise a cor informada. Use o formato #RRGGBB.");
      return;
    }
    if (
      acao === "publicar" &&
      !(await confirmar(
        "O selo em edição vai substituir a versão visível no seu perfil e nos créditos.",
        "Publicar selo"
      ))
    )
      return;
    if (enviando) return;
    const captura = copia(h.atual);
    enviando = true;
    status(acao === "rascunho" ? "Salvando rascunho…" : "Publicando selo…");
    atualizarBotoes();
    try {
      const resposta = await fetch("/perfil/selo/estudio", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ acao, composicao: captura }),
      });
      let d;
      try {
        d = await resposta.json();
      } catch {}
      if (!resposta.ok || !d?.sucesso)
        throw new Error(
          d?.erro || "Falha ao salvar. Suas alterações continuam no editor."
        );
      salvo = JSON.stringify(captura);
      if (acao === "publicar") {
        if (!dirty()) {
          location.assign(
            "/perfil?editar=1&secao=selo&selo=salvo#profile-editor-selo"
          );
          return;
        }
        await carregar();
        status("Selo publicado. As alterações posteriores não foram salvas.");
      } else
        status(
          dirty()
            ? "Rascunho salvo. Ainda há alterações mais recentes."
            : "Rascunho salvo. O selo público não mudou."
        );
      return !dirty();
    } catch (erro) {
      status(erro.message);
      return false;
    } finally {
      enviando = false;
      $('[data-acao="rascunho"]').disabled = false;
      $('[data-acao="publicar"]').disabled = false;
    }
  }

  raiz.addEventListener("submit", async e => {
    const form = e.target;
    if (!form.matches(".se-cadastro-marca")) return;
    e.preventDefault();
    const submit = form.querySelector("button"),
      file = form.elements.imagem.files[0];
    if (
      !file ||
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 65536
    ) {
      status("Escolha uma imagem PNG ou JPEG de até 64 KB.");
      return;
    }
    submit.disabled = true;
    status("Enviando marca…");
    try {
      const bitmap = await createImageBitmap(file);
      const dentro =
        bitmap.width > 0 &&
        bitmap.height > 0 &&
        bitmap.width <= 2048 &&
        bitmap.height <= 2048;
      bitmap.close();
      if (!dentro) throw new Error("Use uma imagem de até 2.048 × 2.048 px.");
      const imagem = await new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(Error("Imagem ilegível."));
        leitor.readAsDataURL(file);
      });
      const dados = Object.fromEntries(new FormData(form));
      const resp = await fetch("/selos/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({
          imagem,
          justificativa: dados.justificativa,
          direitos: dados.direitos,
          objetivo: "camada",
        }),
      });
      const d = await resp.json();
      if (!resp.ok)
        throw new Error(d.erro || "Não foi possível enviar a marca.");
      imagens.unshift({
        id: d.id,
        justificativa: dados.justificativa,
        estado: "pendente",
      });
      if (categoria === "marcas") painel();
      status("Marca enviada para análise. Seu selo público não mudou.");
    } catch (e) {
      status(e.message);
    } finally {
      submit.disabled = false;
    }
  });

  raiz.addEventListener("input", e => {
    const el = e.target;
    if (el.matches("[data-zoom]")) {
      ajustarZoom(el);
      return;
    }
    if (el.type === "range") atualizarFaixa(el);
    if (el.matches("[data-prop]")) editarCampo(el, true);
  });
  raiz.addEventListener("change", e => {
    const el = e.target;
    if (el.matches("[data-fundo-previa]"))
      $(".se-canvas").dataset.fundo = el.value;
    if (el.matches("[data-bloqueio]"))
      el.checked
        ? bloqueios.add(el.dataset.bloqueio)
        : bloqueios.delete(el.dataset.bloqueio);
    if (el.matches("[data-prop]")) {
      editarCampo(el, false);
      h.concluir();
    }
  });
  raiz.addEventListener("focusout", e => {
    if (e.target.matches("[data-prop]")) {
      h.concluir();
      fila();
    }
  });
  $(".se-amostras").addEventListener("toggle", fila);

  let reordenando = null;
  raiz.addEventListener("dragstart", e => {
    const item = e.target.closest("[data-ordem]");
    if (!item?.draggable) return;
    reordenando = item.dataset.ordem;
    e.dataTransfer.setData("text/plain", reordenando);
    e.dataTransfer.effectAllowed = "move";
  });
  raiz.addEventListener("dragover", e => {
    const destino = e.target.closest("[data-ordem]");
    if (
      reordenando &&
      destino?.draggable &&
      destino.dataset.ordem !== reordenando
    )
      e.preventDefault();
  });
  raiz.addEventListener("dragend", () => {
    reordenando = null;
  });
  raiz.addEventListener("drop", e => {
    const destino = e.target.closest("[data-ordem]");
    if (!reordenando || !destino?.draggable) return;
    e.preventDefault();
    const origem = reordenando;
    reordenando = null;
    h.alterar(c => {
      const i = c.camadas.findIndex(l => l.id === origem),
        j = c.camadas.findIndex(l => l.id === destino.dataset.ordem);
      if (
        i < 0 ||
        j < 0 ||
        i === j ||
        c.camadas
          .slice(Math.min(i, j), Math.max(i, j) + 1)
          .some(l => l.bloquear)
      )
        return;
      c.camadas.splice(j, 0, c.camadas.splice(i, 1)[0]);
    });
    selecionada = origem;
    redesenhar("camada", origem);
  });
  // Após manipular um selo, alguns navegadores móveis suprimem o
  // clique sintetizado do primeiro toque. Confirme o toque na barra
  // de desfazer ou refazer pelos eventos de ponteiro, sem duplicar o clique nativo.
  const barraMobile = $(".se-mobile-bar");
  let toqueBarra, acaoPorToque;
  barraMobile.addEventListener("pointerdown", e => {
    const b = e.target.closest(
      'button:is([data-acao="undo-mobile"], [data-acao="redo-mobile"])'
    );
    if (e.pointerType === "touch" && b && !b.disabled)
      toqueBarra = { b, id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  barraMobile.addEventListener("pointercancel", () => {
    toqueBarra = null;
  });
  barraMobile.addEventListener("pointerup", e => {
    const t = toqueBarra;
    toqueBarra = null;
    if (
      !t ||
      e.pointerId !== t.id ||
      Math.hypot(e.clientX - t.x, e.clientY - t.y) > 10 ||
      !t.b.contains(document.elementFromPoint(e.clientX, e.clientY))
    )
      return;
    acaoPorToque = { b: t.b, ate: performance.now() + 600 };
    t.b.click();
  });
  raiz.addEventListener("click", async e => {
    const b = e.target.closest("[data-acao]");
    if (
      e.isTrusted &&
      e.detail > 0 &&
      acaoPorToque?.b === b &&
      performance.now() < acaoPorToque.ate
    )
      return;
    if (!b) return;
    const a = b.dataset.acao,
      v = b.dataset.valor,
      c = h.atual;
    if (a === "modo") {
      modo = v;
      if (simples() && exclusivas.has(categoria)) {
        const etapa = etapas[etapaAtual()];
        trocarVetor = null;
        categoria =
          categoria === "ornamentos" ? "simbolos" : permitidas(etapa)[0];
      }
      redesenhar(a, v);
      return;
    }
    if (a === "categoria") {
      trocarVetor = null;
      categoria = v;
      redesenhar(a, v);
      return;
    }
    if (a === "etapa" || a === "etapa-seguinte") {
      const etapa = etapas.find(item => item.id === v);
      if (!etapa || etapa.id === etapas[etapaAtual()].id) return;
      trocarVetor = null;
      const anterior = ultimasFerramentas.get(v);
      const opcoes = permitidas(etapa);
      categoria = opcoes.includes(anterior) ? anterior : opcoes[0];
      redesenhar(a === "etapa" ? a : undefined, v);
      if (a === "etapa-seguinte") {
        $("#se-titulo-etapa").focus({ preventScroll: true });
        $(".se-stepper").scrollIntoView({
          block: "start",
          behavior: "instant",
        });
      }
      return;
    }
    if (a === "ir-etapas") {
      $('.se-stepper [aria-current="step"]').focus({ preventScroll: true });
      $(".se-stepper").scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    if (["ver-previa", "conferir-previa", "voltar-edicao"].includes(a)) {
      if (a === "conferir-previa") $(".se-amostras").open = true;
      const destino = $(
        a === "voltar-edicao" ? "#se-titulo-etapa" : "#se-previa"
      );
      destino.focus({ preventScroll: true });
      destino.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      return;
    }
    if (a === "centralizar") {
      const campo = $("[data-zoom]");
      campo.value = 100;
      ajustarZoom(campo);
      return;
    }
    if (a === "guias") {
      guias = !guias;
      b.setAttribute("aria-pressed", guias);
      fila();
      return;
    }
    if (a === "comparar") {
      comparar = !comparar;
      renderComparar();
      return;
    }
    if (a === "rascunho" || a === "publicar") {
      void gravar(a);
      return;
    }
    if (a === "undo" || a === "undo-mobile") h.desfazer();
    if (a === "redo" || a === "redo-mobile") h.refazer();
    if (
      a === "reset" &&
      (await confirmar(
        "Restaurar o último estado salvo? Você pode desfazer esta ação.",
        "Restaurar"
      ))
    )
      h.alterar(JSON.parse(salvo));
    if (a === "modelo" || a === "vazio" || a === "versao") {
      if (
        dirty() &&
        !(await confirmar(
          "Trocar a composição em edição? Você pode voltar com Desfazer.",
          "Trocar composição"
        ))
      )
        return;
      const letras =
        c.camadas.find(l => l.tipo === "letras")?.valor ||
        cfg.iniciaisSelo ||
        "CY";
      const destino =
        a === "vazio"
          ? baseSelo()
          : a === "modelo"
            ? modeloSelo(modelos[Number(v)], letras)
            : versaoLocal(versoes.find(i => i.id === v));
      if (destino) h.alterar(destino);
      selecionada = null;
    }
    if (a === "versao-comparar") {
      const alt = versoes.find(i => i.id === v);
      if (!alt) return;
      comparar = true;
      renderComparar();
      $(".se-compare").innerHTML =
        "<span>Comparando com " +
        esc(idioma.format(alt.criado_em)) +
        "</span>" +
        mark;
      desenharSelo($(".se-compare .pf-seal"), versaoLocal(alt), {
        compacta: true,
      });
      return;
    }
    if (a === "forma")
      h.alterar(e => {
        e.forma = v;
      });
    if (a === "paleta")
      h.alterar(e => {
        e.paleta = v;
      });
    if (a === "aplicar-paleta")
      h.alterar(e => {
        e.fundo.tipo = "paleta";
      });
    if (a === "cor-automatica") h.alterar(e => set(e, v, ""));
    if (a === "harmonia") {
      if (!c.fundo.cor) {
        status("Escolha uma cor base personalizada primeiro.");
        return;
      }
      h.alterar(e => {
        e.fundo.segunda =
          "#" +
          (0xffffff ^ parseInt(e.fundo.cor.slice(1), 16))
            .toString(16)
            .padStart(6, "0");
        e.fundo.tipo = "linear";
      });
    }
    if (a === "trocar-vetor") {
      const l = c.camadas.find(e => e.id === v && !e.bloquear);
      if (l) {
        selecionada = l.id;
        trocarVetor = l.id;
        categoria = l.tipo === "ornamento" ? "ornamentos" : "simbolos";
      }
    }
    if (a === "cancelar-troca-vetor") trocarVetor = null;
    if (a === "marca") camadaAdicionada("imagem", v);
    if (a === "add") {
      if (v === "texto") camadaAdicionada("texto", "Seu texto");
      else {
        categoria = v === "ornamento" ? "ornamentos" : "simbolos";
        trocarVetor = null;
      }
    }
    if (a === "camada" || a === "propriedades") selecionada = v;
    if (a === "visibilidade" || a === "bloqueio")
      h.alterar(e => {
        const l = e.camadas.find(i => i.id === v);
        if (!l) return;
        if (a === "bloqueio") l.bloquear = !l.bloquear;
        else if (!l.bloquear) l.mostrar = !l.mostrar;
      });
    if (a === "layout") h.alterar(e => distribuir(e, v));
    if (a === "sorteio")
      h.alterar(e => {
        const sortear = (t, k) => {
          const op = Object.keys(t).filter(x => x !== e[k]);
          return op[Math.floor(Math.random() * op.length)];
        };
        if (!bloqueios.has("forma")) e.forma = sortear(cfg.formasSelo, "forma");
        if (!bloqueios.has("paleta"))
          e.paleta = sortear(cfg.coresSelo, "paleta");
        if (!bloqueios.has("acabamento"))
          e.acabamento = sortear(r.acabamentos, "acabamento");
        if (!bloqueios.has("textura")) e.textura.tipo = sortear(r.texturas, "");
        const l = e.camadas.find(i => i.tipo === "simbolo" && !i.bloquear);
        if (l) {
          const op = vetores.filter(
            v => v.id !== l.valor && v.categoria !== "ornamentos"
          );
          l.valor = op[Math.floor(Math.random() * op.length)].id;
          biblioteca.usar(l.valor);
        }
      });
    const l = sujeito();
    if (
      l &&
      !l.bloquear &&
      [
        "subir",
        "descer",
        "duplicar",
        "excluir",
        "alinhar",
        "reset-camada",
      ].includes(a)
    )
      h.alterar(e => {
        const i = e.camadas.findIndex(k => k.id === l.id);
        if (a === "excluir") {
          e.camadas.splice(i, 1);
          selecionada = null;
        }
        if (a === "alinhar") e.camadas[i][v] = 50;
        if (a === "reset-camada")
          e.camadas[i] = novaCamada(l.tipo, l.valor, {
            id: l.id,
            nome: l.nome,
            mostrar: l.mostrar,
          });
        if (a === "duplicar" && e.camadas.length < 12 && l.tipo !== "letras") {
          const { id, ...props } = l,
            n = novaCamada(l.tipo, l.valor, {
              ...props,
              x: zona(l.x + 5, -20, 120),
              y: zona(l.y + 5, -20, 120),
            });
          e.camadas.splice(i + 1, 0, n);
          selecionada = n.id;
        }
        const j = a === "subir" ? i + 1 : a === "descer" ? i - 1 : -1;
        if (e.camadas[j] && !e.camadas[j].bloquear)
          [e.camadas[i], e.camadas[j]] = [e.camadas[j], e.camadas[i]];
      });
    redesenhar(a, v);
  });

  const canvas = $(".se-canvas");
  function ponto(e) {
    const matriz = canvas.querySelector("[data-seal-arte]")?.getScreenCTM();
    if (!matriz) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(matriz.inverse());
  }
  canvas.addEventListener("pointerdown", e => {
    if (simples() || !e.isPrimary || e.button !== 0) return;
    const no = e.target.closest("[data-camada]");
    if (!no) return;
    const id = no.dataset.camada;
    selecionada = id;
    const l = sujeito(),
      p = ponto(e);
    if (!l?.bloquear && p) {
      h.concluir();
      canvas.setPointerCapture(e.pointerId);
      drag = {
        id,
        no,
        antes: no.getAttribute("transform"),
        pointer: e.pointerId,
        dx: p.x - l.x,
        dy: p.y - l.y,
        pos: null,
      };
      if (e.pointerType !== "touch") e.preventDefault();
    }
    fila();
  });
  canvas.addEventListener("pointermove", e => {
    if (drag?.pointer !== e.pointerId) return;
    const p = ponto(e);
    if (!p) return;
    const snap = n =>
      guias && Math.abs(n - 50) < 3
        ? 50
        : Math.round(zona(n, -20, 120) * 10) / 10;
    drag.pos = { x: snap(p.x - drag.dx), y: snap(p.y - drag.dy) };
    fila();
  });
  function fimDrag(e) {
    if (e.pointerId === drag?.pointer) {
      const { id, pos, no, antes } = drag;
      drag = null;
      if (e.type !== "pointerup") no.setAttribute("transform", antes);
      if (e.type === "pointerup" && pos)
        h.alterar(c => {
          const l = c.camadas.find(k => k.id === id && !k.bloquear);
          if (l) Object.assign(l, pos);
        });
      redesenhar();
    }
  }
  canvas.addEventListener("pointerup", fimDrag);
  canvas.addEventListener("pointercancel", fimDrag);
  canvas.addEventListener("lostpointercapture", fimDrag);
  raiz.addEventListener("keydown", e => {
    if (
      !e.target.matches("input,select,textarea") &&
      !simples() &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      const selecionado = sujeito(),
        direcao = {
          ArrowLeft: ["x", -1],
          ArrowRight: ["x", 1],
          ArrowUp: ["y", -1],
          ArrowDown: ["y", 1],
        }[e.key];
      if (
        selecionado &&
        !selecionado.bloquear &&
        e.target.closest(".se-canvas,.se-camadas") &&
        (e.key === "Delete" || direcao)
      ) {
        e.preventDefault();
        h.alterar(c => {
          if (e.key === "Delete") {
            c.camadas = c.camadas.filter(l => l.id !== selecionada);
            selecionada = null;
          } else {
            const [k, d] = direcao,
              l = sujeito();
            l[k] = zona(l[k] + d * (e.shiftKey ? 5 : 1), -20, 120);
          }
        });
        redesenhar("camada", selecionada);
        return;
      }
    }
    if (
      !(e.ctrlKey || e.metaKey) ||
      e.altKey ||
      !["z", "y"].includes(e.key.toLowerCase()) ||
      e.target.matches("input[type=text],input[type=search],textarea")
    )
      return;
    e.preventDefault();
    if (e.shiftKey || e.key.toLowerCase() === "y") h.refazer();
    else h.desfazer();
    redesenhar();
  });
  const dialogoSaida = $(".se-sair");
  document.addEventListener("click", e => {
    const link = e.target.closest("a[href]");
    if (
      !dirty() ||
      !link ||
      link.download ||
      link.target ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.defaultPrevented ||
      e.button !== 0
    )
      return;
    const destino = new URL(link.href);
    if (
      destino.origin !== location.origin ||
      (destino.pathname === location.pathname &&
        destino.search === location.search)
    )
      return;
    if (!dialogoSaida.showModal || dialogoSaida.open) return;
    e.preventDefault();
    dialogoSaida.returnValue = "";
    dialogoSaida.addEventListener(
      "close",
      async () => {
        if (
          dialogoSaida.returnValue === "descartar" ||
          (dialogoSaida.returnValue === "salvar" && (await gravar("rascunho")))
        ) {
          ignorarSaida = true;
          location.assign(destino.href);
        }
      },
      { once: true }
    );
    dialogoSaida.showModal();
  });
  const protegerSaida = e => {
    if (dirty() && !ignorarSaida) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", protegerSaida);
  window.addEventListener("pagehide", e => {
    if (!e.persisted) window.removeEventListener("beforeunload", protegerSaida);
  });
  renderNav();
  painel();
  fila();
  void carregar();
}

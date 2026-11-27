const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
// CSS hover may stick after a tap on hybrid devices. Track mouse input explicitly.
document.querySelectorAll(".dc-rail, .dc-feature").forEach(carrossel => {
  const mostrarSetas = event =>
    carrossel.classList.toggle("dc-mouse-over", event.pointerType === "mouse");
  carrossel.addEventListener("pointerenter", mostrarSetas);
  carrossel.addEventListener("pointermove", mostrarSetas, { passive: true });
  carrossel.addEventListener("pointerdown", mostrarSetas, { passive: true });
  carrossel.addEventListener("pointerleave", () =>
    carrossel.classList.remove("dc-mouse-over")
  );
});
const contagemSempreVisivel = window.matchMedia(
  "(max-width: 900px) and (hover: none)"
);

document.querySelectorAll("[data-release-open]").forEach(abrir => {
  const dialogo = abrir.nextElementSibling;
  if (!dialogo?.matches("[data-release-dialog]") || !dialogo.showModal) return;

  const audio = dialogo.querySelector("[data-release-audio]");
  const tituloAtual = dialogo.querySelector("[data-release-now]");
  const status = dialogo.querySelector("[data-release-status]");
  let faixaAtual;
  let cliqueNoFundo = false;

  abrir.setAttribute("aria-haspopup", "dialog");
  abrir.addEventListener("click", evento => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey)
      return;
    dialogo.showModal();
    evento.preventDefault();
  });
  dialogo.addEventListener("pointerdown", evento => {
    cliqueNoFundo = evento.target === dialogo;
  });
  dialogo.addEventListener("click", evento => {
    if (cliqueNoFundo && evento.target === dialogo) dialogo.close();
    cliqueNoFundo = false;
  });
  dialogo.addEventListener("close", () => {
    audio?.pause();
    abrir.focus({ preventScroll: true });
  });

  if (!audio) return;
  const falha = "Não foi possível reproduzir este áudio.";
  const atualizarReproducao = () =>
    faixaAtual?.setAttribute(
      "aria-pressed",
      String(!audio.paused && !audio.ended)
    );

  audio.addEventListener("play", () => {
    status.textContent = "";
    atualizarReproducao();
  });
  audio.addEventListener("pause", atualizarReproducao);
  audio.addEventListener("ended", atualizarReproducao);
  audio.addEventListener("error", () => {
    atualizarReproducao();
    status.textContent = falha;
  });

  dialogo.querySelectorAll("[data-release-track]").forEach(faixa => {
    faixa.addEventListener("click", () => {
      if (faixaAtual === faixa && !audio.paused) {
        audio.pause();
        return;
      }
      if (faixaAtual !== faixa) {
        faixaAtual?.removeAttribute("aria-current");
        faixaAtual?.setAttribute("aria-pressed", "false");
        faixaAtual = faixa;
        faixa.setAttribute("aria-current", "true");
        audio.src = faixa.dataset.releaseTrack;
        audio.hidden = false;
        audio.setAttribute(
          "aria-label",
          "Reprodutor de " + faixa.dataset.trackTitle
        );
        tituloAtual.textContent = faixa.dataset.trackTitle;
      }
      status.textContent = "";
      audio.play().catch(erro => {
        if (faixaAtual === faixa && erro.name !== "AbortError")
          status.textContent = falha;
      });
    });
  });
});

document.querySelectorAll("time.dc-event-date").forEach((data, indice) => {
  const aviso = data.querySelector(".dc-event-countdown");
  const card = data.closest(".dc-event-card");
  if (!aviso || !card) return;

  aviso.id = `dc-event-countdown-${indice}`;
  card.setAttribute("aria-describedby", aviso.id);

  function atualizarAviso() {
    const diaEvento = Date.parse(`${data.dateTime}T00:00:00Z`);
    if (!Number.isFinite(diaEvento)) return;
    const agora = new Date();
    const hoje = Date.UTC(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate()
    );
    const dias = (diaEvento - hoje) / 86400000;
    if (dias > 1) aviso.textContent = `Faltam ${dias} dias`;
    else if (dias === 1) aviso.textContent = "Falta 1 dia";
    else if (dias === 0) aviso.textContent = "É hoje!";
    else aviso.textContent = "Data já passou";
    aviso.hidden = false;
  }

  data.addEventListener("pointerenter", atualizarAviso);
  card.addEventListener("focus", atualizarAviso);
  card.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !contagemSempreVisivel.matches)
      aviso.hidden = true;
  });
  if (contagemSempreVisivel.matches) atualizarAviso();
  contagemSempreVisivel.addEventListener("change", evento => {
    if (evento.matches) atualizarAviso();
  });
});

const conteudoDestaques = document.querySelector(".dc-feature-content");
const navegacao = document.querySelector(".dc-feature-nav");
if (conteudoDestaques && navegacao) {
  const slides = conteudoDestaques.querySelectorAll(".dc-slide");
  const radios = Array.from(
    navegacao.querySelectorAll(".dc-feature-choice input")
  );
  const anterior = navegacao.querySelector(".dc-feature-prev");
  const proximo = navegacao.querySelector(".dc-feature-next");
  const status = navegacao.querySelector(".dc-feature-status");
  if (
    radios.length > 1 &&
    radios.length === slides.length &&
    anterior &&
    proximo
  ) {
    navegacao.hidden = false;
    let atual = 0;
    const contador = navegacao.querySelector(".dc-feature-counter");
    let transicao;

    function mostrar(indice) {
      const antigo = atual;
      const focoNoSlide = slides[antigo].contains(document.activeElement);
      atual = Math.max(0, Math.min(slides.length - 1, indice));
      indice = atual;
      const foco = document.activeElement;
      anterior.disabled = indice === 0;
      proximo.disabled = indice === slides.length - 1;
      if (foco === anterior && anterior.disabled) proximo.focus({ preventScroll: true });
      if (foco === proximo && proximo.disabled) anterior.focus({ preventScroll: true });
      slides.forEach((slide, posicao) => {
        slide.hidden = posicao !== indice;
      });
      radios[indice].checked = true;
      if (status)
        status.textContent = radios[indice].getAttribute("aria-label");
      if (contador)
        contador.textContent = `${String(indice + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      transicao?.cancel();
      if (antigo !== indice && !movimentoReduzido.matches)
        transicao = slides[indice].animate(
          [
            {
              opacity: 0.35,
              transform: `translateX(${indice > antigo ? 14 : -14}px)`,
            },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 240, easing: "ease-out" }
        );
      if (focoNoSlide) slides[indice].focus({ preventScroll: true });
    }

    mostrar(
      Math.max(
        0,
        radios.findIndex(radio => radio.checked)
      )
    );
    function trocar(direcao) {
      mostrar(atual + direcao);
    }

    anterior.addEventListener("click", () => trocar(-1));
    proximo.addEventListener("click", () => trocar(1));
    let inicioDeslize;
    let cancelouAbertura = false;
    conteudoDestaques.addEventListener("pointerdown", evento => {
      if (!evento.isPrimary) return;
      cancelouAbertura = false;
      inicioDeslize = evento.button === 0 ? evento : undefined;
    });
    conteudoDestaques.addEventListener("dragstart", evento =>
      evento.preventDefault()
    );
    conteudoDestaques.addEventListener("pointermove", evento => {
      if (inicioDeslize?.pointerId !== evento.pointerId) return;
      const dx = evento.clientX - inicioDeslize.clientX,
        dy = evento.clientY - inicioDeslize.clientY;
      if (!cancelouAbertura && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
        inicioDeslize = undefined;
        return;
      }
      if (!cancelouAbertura && Math.abs(dx) > 12 && Math.abs(dx) > 1.4 * Math.abs(dy)) {
        cancelouAbertura = true;
        conteudoDestaques.setPointerCapture(evento.pointerId);
      }
    });
    conteudoDestaques.addEventListener("keydown", evento => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(evento.key))
        return;
      evento.preventDefault();
      if (evento.key === "Home") mostrar(0);
      else if (evento.key === "End") mostrar(slides.length - 1);
      else trocar(evento.key === "ArrowRight" ? 1 : -1);
    });
    conteudoDestaques.addEventListener("pointercancel", () => {
      inicioDeslize = undefined;
    });
    conteudoDestaques.addEventListener("lostpointercapture", () => {
      inicioDeslize = undefined;
    });
    conteudoDestaques.addEventListener("pointerup", evento => {
      if (inicioDeslize?.pointerId !== evento.pointerId) return;
      const horizontal = evento.clientX - inicioDeslize.clientX;
      const vertical = evento.clientY - inicioDeslize.clientY;
      inicioDeslize = undefined;
      if (
        Math.abs(horizontal) < 45 ||
        Math.abs(horizontal) < 1.4 * Math.abs(vertical)
      )
        return;
      cancelouAbertura = true;
      trocar(horizontal < 0 ? 1 : -1);
    });
    conteudoDestaques.addEventListener(
      "click",
      evento => {
        if (cancelouAbertura && evento.detail > 0) evento.preventDefault();
        cancelouAbertura = false;
      },
      true
    );
    radios.forEach((radio, indice) => {
      radio.addEventListener("change", () => {
        if (radio.checked) mostrar(indice);
      });
      radio.addEventListener("keydown", evento => {
        if (evento.key !== "Home" && evento.key !== "End") return;
        evento.preventDefault();
        const destino = evento.key === "Home" ? 0 : radios.length - 1;
        mostrar(destino);
        radios[destino].focus();
      });
    });
  }
}

document.querySelectorAll(".dc-rail").forEach(rail => {
  const nav = rail.querySelector(".dc-rail-nav");
  const previous = nav?.querySelector(".dc-rail-prev");
  const next = nav?.querySelector(".dc-rail-next");
  const track = previous && document.getElementById(previous.getAttribute("aria-controls"));
  const progress = nav?.querySelector(".dc-rail-progress > span");
  if (!track || !previous || !next || !rail.contains(track)) return;

  const tolerance = 2;
  let queuedTarget;
  let settleTimer;
  let frame;
  const limit = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const clamp = value => Math.min(limit(), Math.max(0, value));
  const resetTarget = () => {
    queuedTarget = undefined;
    clearTimeout(settleTimer);
  };

  function update() {
    const max = limit();
    const position = clamp(track.scrollLeft);
    const canGoBack = position > tolerance;
    const canGoOn = position < max - tolerance;
    const focused = document.activeElement;
    nav.hidden = max <= tolerance;
    if (nav.hidden) track.removeAttribute("aria-description");
    else track.setAttribute("aria-description", "Use as setas do teclado para navegar pelos itens.");
    // Preserve keyboard focus before a control becomes unavailable at either end.
    if (focused === previous && !canGoBack) {
      if (canGoOn) next.disabled = false;
      (canGoOn ? next : track).focus({ preventScroll: true });
    } else if (focused === next && !canGoOn) {
      if (canGoBack) previous.disabled = false;
      (canGoBack ? previous : track).focus({ preventScroll: true });
    }
    previous.disabled = !canGoBack;
    next.disabled = !canGoOn;
    if (!progress || nav.hidden) return;
    const visible = track.clientWidth / track.scrollWidth;
    progress.style.width = (visible * 100) + "%";
    progress.style.left = (position / max * (1 - visible) * 100) + "%";
  }
  function scheduleUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  }
  function scrollTo(target) {
    queuedTarget = clamp(target);
    clearTimeout(settleTimer);
    const reduced = movimentoReduzido.matches;
    track.scrollTo({ left: queuedTarget, behavior: reduced ? "instant" : "smooth" });
    if (reduced) {
      resetTarget();
      update();
    } else {
      settleTimer = setTimeout(resetTarget, 650);
    }
  }
  function move(direction, byItem = false) {
    const position = queuedTarget ?? clamp(track.scrollLeft);
    const rect = track.getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const starts = [0, ...Array.from(track.children, item =>
      clamp(item.getBoundingClientRect().left - rect.left + track.scrollLeft - track.clientLeft - padding)
    ), limit()];
    const ahead = starts.filter(start => direction * (start - position) > tolerance);
    if (!ahead.length) return;
    const candidates = direction > 0 ? ahead : ahead.reverse();
    const onePage = Math.max(0, track.clientWidth - padding * 2);
    scrollTo(byItem ? candidates[0] : (
      candidates.filter(start => Math.abs(start - position) <= onePage + tolerance).at(-1) ?? candidates[0]
    ));
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  rail.addEventListener("keydown", event => {
    if (![track, previous, next].includes(event.target) ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) ||
        limit() <= tolerance) return;
    event.preventDefault();
    if (event.key === "Home" || event.key === "End") scrollTo(event.key === "Home" ? 0 : limit());
    else move(event.key === "ArrowRight" ? 1 : -1, true);
  });
  track.addEventListener("scroll", scheduleUpdate, { passive: true });
  track.addEventListener("scrollend", () => { resetTarget(); update(); });
  track.addEventListener("pointerdown", resetTarget, { passive: true });
  track.addEventListener("wheel", resetTarget, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(scheduleUpdate).observe(track);
  window.addEventListener("resize", () => { resetTarget(); scheduleUpdate(); }, { passive: true });
  update();
});

const filtros = document.querySelector(".dc-tabs");
if (filtros && document.referrer && !movimentoReduzido.matches) {
  const origem = new URL(document.referrer);
  if (
    origem.origin === location.origin &&
    origem.pathname === location.pathname
  ) {
    const links = Array.from(filtros.querySelectorAll("a"));
    const parametro = filtros.dataset.queryParam || "tipo";
    const categoria = url =>
      url.searchParams.get(parametro) || (parametro === "tipo" ? "tudo" : "");
    const anterior = links.findIndex(
      link => categoria(new URL(link.href)) === categoria(origem)
    );
    const atual = links.findIndex(link => link.hasAttribute("aria-current"));
    if (anterior >= 0 && atual >= 0 && anterior !== atual && filtros.animate) {
      const trilha = document.createElement("span");
      trilha.className = "dc-tab-trail";
      trilha.setAttribute("aria-hidden", "true");

      const primeiro = links[anterior].getBoundingClientRect();
      const barra = filtros.getBoundingClientRect();
      const sentido = Math.sign(atual - anterior);
      const quantidade = Math.abs(atual - anterior);
      trilha.style.width = `${primeiro.width}px`;
      trilha.style.height = `${primeiro.height}px`;

      const posicoes = Array.from({ length: quantidade + 1 }, (_, passo) => {
        const item = links[anterior + passo * sentido].getBoundingClientRect();
        return {
          x:
            item.left -
            barra.left -
            filtros.clientLeft +
            (item.width - primeiro.width) / 2,
          y:
            item.top -
            barra.top -
            filtros.clientTop +
            (item.height - primeiro.height) / 2,
          escala: item.width / primeiro.width,
        };
      });
      if (quantidade === 1) {
        const [partida, chegada] = posicoes;
        posicoes.splice(1, 0, {
          x: (partida.x + chegada.x) / 2,
          y: (partida.y + chegada.y) / 2,
          escala: (partida.escala + chegada.escala) / 2,
        });
      }
      const quadros = posicoes.map(({ x, y, escala }, indice) => {
        const emMovimento = indice > 0 && indice < posicoes.length - 1;
        const largura = escala * (emMovimento ? 1.14 : 1);
        const altura = emMovimento ? 0.7 : 1;
        const inclinacao = emMovimento ? -12 * sentido : 0;
        return {
          transform: `translate(${x}px, ${y}px) skewX(${inclinacao}deg) scale(${largura}, ${altura})`,
        };
      });

      filtros.append(trilha);
      const animacao = trilha.animate(quadros, {
        duration: 140 + quantidade * 40,
        easing: "cubic-bezier(0.3, 0, 0.2, 1)",
      });
      animacao.finished.then(
        () => trilha.remove(),
        () => trilha.remove()
      );
    }
  }
}

const paineis = document.querySelectorAll(".dc-filter, .dc-create");
document.addEventListener("click", evento => {
  paineis.forEach(painel => {
    if (!painel.contains(evento.target)) painel.open = false;
  });
});
document.addEventListener("keydown", evento => {
  if (evento.key !== "Escape") return;
  paineis.forEach(painel => {
    if (!painel.open) return;
    painel.open = false;
    painel.querySelector("summary").focus();
  });
});


(() => {
  const area = document.querySelector("[data-event-map]");
  const status = document.querySelector("[data-map-status]");
  if (!area || !status) return;

  function avisar(texto) {
    status.textContent = texto;
    status.hidden = !texto;
  }

  // O CDN não pode atrasar a renderização nem impedir o uso da lista.
  function carregarLeaflet() {
    return new Promise((resolve, reject) => {
      const raiz = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.";
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = raiz + "css";
      css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      const js = document.createElement("script");
      js.src = raiz + "js";
      js.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      let pendentes = 2;
      const falhou = () => {
        clearTimeout(prazo);
        css.remove();
        js.remove();
        reject(new Error("Leaflet indisponível"));
      };
      const prazo = setTimeout(falhou, 6500);
      for (const recurso of [css, js]) {
        recurso.crossOrigin = "anonymous";
        recurso.addEventListener("error", falhou, { once: true });
        recurso.addEventListener("load", () => {
          if (--pendentes !== 0) return;
          if (!window.L) return falhou();
          clearTimeout(prazo);
          resolve(window.L);
        }, { once: true });
      }
      document.head.append(css, js);
    });
  }

  function montar(L) {
    area.hidden = false;
    const mapa = L.map(area, { scrollWheelZoom: false, zoomControl: false });
    L.control
      .zoom({ zoomInTitle: "Aproximar", zoomOutTitle: "Afastar" })
      .addTo(mapa);
    mapa.attributionControl.setPrefix(false);
    let carregou = false;
    let prazoFundo;
    const fundoIndisponivel = () => {
      clearTimeout(prazoFundo);
      avisar("O mapa de fundo não carregou. Use os pinos ou consulte os endereços na lista.");
    };
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      referrerPolicy: "strict-origin-when-cross-origin",
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>',
    })
      .on("loading", () => {
        carregou = false;
        clearTimeout(prazoFundo);
        avisar("Carregando mapa de fundo…");
        prazoFundo = setTimeout(fundoIndisponivel, 6500);
      })
      .on("tileload", () => {
        carregou = true;
        clearTimeout(prazoFundo);
        avisar("");
      })
      .on("load", () => {
        if (!carregou) fundoIndisponivel();
      })
      .addTo(mapa);

    const locais = new Map();
    for (const item of document.querySelectorAll("[data-marker]")) {
      const coordenadas = [Number(item.dataset.lat), Number(item.dataset.lon)];
      const chave = coordenadas.join(",");
      if (!locais.has(chave)) locais.set(chave, { coordenadas, itens: [] });
      locais.get(chave).itens.push(item);
    }
    const limites = [];
    let preselecionado;
    for (const { coordenadas, itens } of locais.values()) {
      limites.push(coordenadas);
      const popup = document.createElement("div");
      popup.className = "ev-map-popup";
      for (const item of itens) {
        const evento = item.querySelector("a").cloneNode(true);
        popup.append(evento);
      }
      const nome =
        itens.length > 1
          ? itens.length + " eventos neste local"
          : itens[0].querySelector("strong").textContent;
      const marcador = L.marker(coordenadas, {
        title: nome,
        alt: nome,
        icon: L.divIcon({
          className: "ev-map-marker",
          html: itens.length > 1 ? String(itens.length) : "●",
          iconSize: [34, 34],
          iconAnchor: [17, 23],
          popupAnchor: [0, -18],
        }),
      })
        .addTo(mapa)
        .bindPopup(popup, { maxHeight: 240 });
      marcador.getElement()?.setAttribute("aria-label", nome);
      for (const item of itens) {
        const botao = item.querySelector("button");
        botao.hidden = false;
        botao.addEventListener("click", () => {
          mapa.setView(coordenadas, Math.max(14, mapa.getZoom()));
          marcador.openPopup();
          marcador.getElement()?.focus({ preventScroll: true });
        });
        if (item.dataset.marker === area.dataset.selecionado)
          preselecionado = marcador;
      }
    }
    if (limites.length === 1) mapa.setView(limites[0], 13);
    else mapa.fitBounds(limites, { padding: [32, 32], maxZoom: 14 });
    preselecionado?.openPopup();
  }

  avisar("Carregando mapa…");
  carregarLeaflet().then(montar).catch(() => {
    area.hidden = true;
    for (const botao of document.querySelectorAll("[data-marker] button")) botao.hidden = true;
    avisar("O mapa não carregou. Os endereços continuam na lista.");
  });
})();

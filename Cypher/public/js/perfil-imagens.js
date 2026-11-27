import { atualizarFaixa } from "./controles-faixa.js";

const limitar = (v, m) => Math.max(-m, Math.min(m, v));

for (const raiz of document.querySelectorAll("[data-perfil-imagens]")) {
  const $ = s => raiz.querySelector(s);
  const dialogo = $("dialog"),
    canvas = $("canvas"),
    ctx = canvas.getContext("2d");
  const zoom = $('input[type="range"]'),
    salvar = $("[data-pi-salvar]");
  const status = $("[data-pi-status]"),
    estado = $("[data-pi-dialog-status]");
  const botoes = [...dialogo.querySelectorAll("button"), zoom];
  let campo,
    imagem,
    url,
    mime,
    giro = 0,
    x = 0,
    y = 0,
    arraste,
    carregando = false,
    enviando = false;

  function desenhar() {
    if (!imagem) return;
    atualizarFaixa(zoom);
    $("[data-pi-ampliacao]").value = Math.round(Number(zoom.value) * 100) + "%";
    const { width: w, height: h } = canvas;
    const { naturalWidth: iw, naturalHeight: ih } = imagem;
    const troca = Math.abs(giro) % 2 !== 0,
      rw = troca ? ih : iw,
      rh = troca ? iw : ih;
    const escala = Math.max(w / rw, h / rh) * Number(zoom.value);
    x = limitar(x, Math.max(0, (rw * escala - w) / 2));
    y = limitar(y, Math.max(0, (rh * escala - h) / 2));
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + x, h / 2 + y);
    ctx.rotate((giro * Math.PI) / 2);
    ctx.scale(escala, escala);
    ctx.drawImage(imagem, -iw / 2, -ih / 2);
    ctx.restore();
  }

  function atualizarCartao(card, id) {
    card.dataset.piId = id;
    const foto = card.querySelector("img");
    if (id) foto.src = "/midias-de-publicacao/" + encodeURIComponent(id);
    else foto.removeAttribute("src");
    foto.hidden = !id;
    card.querySelector("[data-pi-vazio]").hidden = !!id;
    card.querySelector("[data-pi-remover]").hidden = !id;
    card
      .querySelector("[data-pi-escolher]")
      .setAttribute(
        "aria-label",
        (id ? "Trocar " : "Selecionar ") +
          card.querySelector("h4").textContent.toLowerCase()
      );
    card.querySelector("[data-pi-legenda]").textContent = id
      ? "Trocar imagem"
      : "Escolher imagem";
  }

  async function receber(res) {
    if (!res.ok) {
      const dados = await res.json().catch(() => null);
      throw Error(
        dados?.erro || "Não foi possível atualizar a imagem. Tente novamente."
      );
    }
    return res.status === 204 ? null : res.json();
  }

  for (const card of raiz.querySelectorAll("[data-pi-campo]")) {
    const seletor = card.querySelector('input[type="file"]');
    const escolher = card.querySelector("[data-pi-escolher]");
    const remover = card.querySelector("[data-pi-remover]");
    escolher.addEventListener("click", () => {
      if (!carregando) seletor.click();
    });
    async function ajustarArquivo(arquivo) {
      if (!arquivo || carregando || dialogo.open) return;
      if (
        !/\.(png|jpe?g)$/i.test(arquivo.name) ||
        arquivo.size > 8 * 1024 * 1024
      ) {
        status.textContent = "Escolha um PNG ou JPEG de até 8 MB.";
        return;
      }
      carregando = true;
      status.textContent = "Preparando imagem…";
      const origem = URL.createObjectURL(arquivo);
      try {
        const foto = new Image();
        foto.src = origem;
        await foto.decode();
        if (
          !foto.naturalWidth ||
          !foto.naturalHeight ||
          foto.naturalWidth * foto.naturalHeight > 40_000_000
        )
          throw Error("Imagem muito grande ou inválida. Escolha outra.");
        url = origem;
        imagem = foto;
        campo = card;
        mime = /\.png$/i.test(arquivo.name) ? "image/png" : "image/jpeg";
        const capa = card.dataset.piCampo === "capa";
        dialogo.dataset.enquadramento = capa ? "capa" : "foto";
        canvas.width = capa ? 1600 : 640;
        canvas.height = capa ? 600 : 640;
        $("#pi-dialog-titulo").textContent = capa
          ? "Ajustar capa"
          : "Ajustar foto de perfil";
        $("[data-pi-capa-dica]").hidden = !capa;
        zoom.value = "1";
        giro = x = y = 0;
        desenhar();
        dialogo.showModal();
        canvas.focus();
        status.textContent = "";
        estado.textContent = "";
      } catch {
        URL.revokeObjectURL(origem);
        imagem = url = null;
        status.textContent =
          "Não foi possível abrir esta imagem. Use um PNG ou JPEG válido de até 40 megapixels.";
      } finally {
        carregando = false;
      }
    }
    seletor.addEventListener("change", () => {
      const arquivo = seletor.files[0];
      seletor.value = "";
      void ajustarArquivo(arquivo);
    });
    const entradaArquivos = e => e.dataTransfer?.types.includes("Files");
    escolher.addEventListener("dragover", e => {
      if (!entradaArquivos(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      escolher.classList.add("pi-soltar");
    });
    escolher.addEventListener("dragleave", e => {
      if (!escolher.contains(e.relatedTarget))
        escolher.classList.remove("pi-soltar");
    });
    escolher.addEventListener("drop", e => {
      if (!entradaArquivos(e)) return;
      e.preventDefault();
      escolher.classList.remove("pi-soltar");
      void ajustarArquivo(e.dataTransfer.files[0]);
    });
    remover.addEventListener("click", async () => {
      const id = card.dataset.piId;
      if (
        !id ||
        !(await (window.cypherConfirmar?.("Remover esta imagem do perfil?", {
          rotulo: "Remover imagem",
        }) ??
          Promise.resolve(window.confirm("Remover esta imagem do perfil?"))))
      )
        return;
      remover.disabled = escolher.disabled = true;
      try {
        await receber(
          await fetch(
            "/midias-de-publicacao/" + encodeURIComponent(id) + "/retirar",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "X-CSRF-Token": raiz.dataset.csrf,
              },
            }
          )
        );
        atualizarCartao(card, "");
        status.textContent = "Imagem removida.";
        escolher.focus();
      } catch (erro) {
        status.textContent = erro.message;
      } finally {
        remover.disabled = escolher.disabled = false;
      }
    });
  }

  zoom.addEventListener("input", desenhar);
  dialogo.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || enviando) return;
    if ("piZoom" in b.dataset) {
      zoom.value = String(
        Math.min(
          3,
          Math.max(1, Number(zoom.value) + Number(b.dataset.piZoom) * 0.15)
        )
      );
      desenhar();
    }
    if ("piGirar" in b.dataset) {
      giro = (giro + Number(b.dataset.piGirar)) % 4;
      x = y = 0;
      desenhar();
    }
    if ("piRedefinir" in b.dataset) {
      zoom.value = "1";
      giro = x = y = 0;
      desenhar();
    }
    if ("piFechar" in b.dataset || "piCancelar" in b.dataset) dialogo.close();
  });
  dialogo.addEventListener("cancel", e => {
    if (enviando) e.preventDefault();
  });
  dialogo.addEventListener("close", () => {
    if (url) URL.revokeObjectURL(url);
    url = imagem = arraste = null;
    canvas.width = canvas.height = 1;
    campo?.querySelector("[data-pi-escolher]").focus();
  });
  canvas.addEventListener("pointerdown", e => {
    if (!imagem || enviando || !e.isPrimary || e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    arraste = { id: e.pointerId, a: e.clientX, b: e.clientY, x, y };
  });
  canvas.addEventListener("pointermove", e => {
    if (arraste?.id !== e.pointerId || enviando) return;
    const r = canvas.getBoundingClientRect();
    x = arraste.x + ((e.clientX - arraste.a) * canvas.width) / r.width;
    y = arraste.y + ((e.clientY - arraste.b) * canvas.height) / r.height;
    desenhar();
  });
  for (const evento of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(evento, e => {
      if (arraste?.id === e.pointerId) arraste = null;
    });
  canvas.addEventListener("keydown", e => {
    const direcao = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[e.key];
    if (!direcao || enviando) return;
    e.preventDefault();
    const passo = canvas.width / (e.shiftKey ? 22 : 90);
    x += direcao[0] * passo;
    y += direcao[1] * passo;
    desenhar();
  });

  salvar.addEventListener("click", async () => {
    if (!campo || !imagem || enviando) return;
    enviando = true;
    botoes.forEach(b => (b.disabled = true));
    estado.textContent = "Salvando imagem…";
    try {
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, mime, 0.91)
      );
      if (!blob) throw Error("Não foi possível preparar o recorte.");
      const finalidade = campo.dataset.piCampo;
      const dados = await receber(
        await fetch(raiz.dataset.envio + "?finalidade=" + finalidade, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-CSRF-Token": raiz.dataset.csrf,
            "X-File-Name":
              (finalidade === "capa" ? "capa" : "foto-perfil") +
              (mime === "image/png" ? ".png" : ".jpg"),
          },
          body: blob,
        })
      );
      if (!dados?.id) throw Error("O servidor não confirmou a imagem.");
      atualizarCartao(campo, dados.id);
      status.textContent =
        finalidade === "capa"
          ? "Capa atualizada."
          : "Foto de perfil atualizada.";
      dialogo.close();
      raiz.dispatchEvent(
        new CustomEvent("perfil-imagem-salva", {
          bubbles: true,
          detail: { finalidade },
        })
      );
    } catch (erro) {
      estado.textContent = erro.message;
    } finally {
      enviando = false;
      botoes.forEach(b => (b.disabled = false));
    }
  });
}

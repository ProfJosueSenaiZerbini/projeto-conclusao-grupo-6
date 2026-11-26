document.querySelectorAll("[data-publication-upload]").forEach(form => {
  const crop = form.querySelector("[data-profile-crop]");
  let image, objectUrl, offsetX = 0, offsetY = 0;
  const frame = crop?.querySelector(".mr-crop-frame");
  const preview = crop?.querySelector("img");
  const zoom = crop?.querySelector('input[type="range"]');
  const cover = () => form.elements.finalidade.value === "capa";
  const geometry = () => {
    const width = frame.clientWidth, height = frame.clientHeight;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * Number(zoom.value);
    const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
    offsetX = Math.max(width - w, Math.min(0, offsetX));
    offsetY = Math.max(height - h, Math.min(0, offsetY));
    Object.assign(preview.style, { width: `${w}px`, height: `${h}px`, left: `${offsetX}px`, top: `${offsetY}px` });
    return { width, height, scale };
  };
  const resetCrop = () => {
    if (!crop) return;
    const file = form.elements.arquivo.files[0];
    crop.hidden = !file || !["imagem", "capa"].includes(form.elements.finalidade.value);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    image = null;
    if (crop.hidden) return;
    objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.onload = () => {
      image = preview; zoom.value = "1";
      const scale = Math.max(frame.clientWidth / image.naturalWidth, frame.clientHeight / image.naturalHeight);
      offsetX = (frame.clientWidth - image.naturalWidth * scale) / 2;
      offsetY = (frame.clientHeight - image.naturalHeight * scale) / 2;
      geometry();
    };
    frame.classList.toggle("is-cover", cover());
  };
  if (crop) {
    form.elements.arquivo.addEventListener("change", resetCrop);
    zoom.addEventListener("input", () => image && geometry());
    frame.addEventListener("pointerdown", e => {
      if (!image) return;
      frame.setPointerCapture(e.pointerId);
      const startX = e.clientX, startY = e.clientY, x = offsetX, y = offsetY;
      const move = event => { offsetX = x + event.clientX - startX; offsetY = y + event.clientY - startY; geometry(); };
      frame.addEventListener("pointermove", move);
      frame.addEventListener("pointerup", () => frame.removeEventListener("pointermove", move), { once: true });
    });
  }
  const tipos = {
    imagem: ".png,.jpg,.jpeg",
    capa: ".png,.jpg,.jpeg",
    audio: ".mp3,.wav,.ogg",
    video: ".mp4,.webm",
    texto: ".txt",
  };
  const ajustarArquivo = () => {
    form.elements.arquivo.accept = tipos[form.elements.finalidade.value];
    if (crop) { form.elements.arquivo.value = ""; crop.hidden = true; image = null; }
  };
  form.elements.finalidade.addEventListener("change", ajustarArquivo);
  ajustarArquivo();
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const arquivo = form.elements.arquivo.files[0],
      botao = form.querySelector("button"),
      status = form.querySelector("[data-upload-status]");
    if (!arquivo) return;
    botao.disabled = true;
    status.textContent = "Enviando arquivo…";
    try {
      if (!form.elements.autorizacao.checked)
        throw Error("Confirme a autorização de uso do arquivo.");
      const limite = {
        imagem: 8 * 1024 * 1024,
        capa: 8 * 1024 * 1024,
        audio: 25 * 1024 * 1024,
        video: 25 * 1024 * 1024,
        texto: 256 * 1024,
      }[form.elements.finalidade.value];
      if (arquivo.size > limite)
        throw Error("O arquivo ultrapassa o limite da finalidade selecionada.");
      let envio = arquivo;
      if (crop && image && !crop.hidden) {
        const { width, height, scale } = geometry();
        const canvas = document.createElement("canvas");
        canvas.width = cover() ? 1600 : 640;
        canvas.height = cover() ? 600 : 640;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, -offsetX / scale, -offsetY / scale, width / scale, height / scale, 0, 0, canvas.width, canvas.height);
        envio = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.88));
        if (!envio) throw Error("Não foi possível recortar a imagem.");
        if (envio.size > limite) throw Error("O recorte ultrapassa o limite de 8 MB.");
      }
      const r = await fetch(
        form.dataset.publicationUpload +
          "?finalidade=" +
          encodeURIComponent(form.elements.finalidade.value),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Midia-Autorizada": "sim",
            "X-File-Name": encodeURIComponent(arquivo.name),
            "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
              .content,
          },
          body: envio,
        }
      );
      if (!r.ok) {
        let msg = "Não foi possível enviar o arquivo.";
        try {
          msg = (await r.json()).erro || msg;
        } catch {}
        throw Error(msg);
      }
      location.reload();
    } catch (erro) {
      status.textContent = erro.message;
      botao.disabled = false;
    }
  });
});

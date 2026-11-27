const selos = document.querySelectorAll("[data-seal-public]");
if (selos.length) {
  const { desenharSelo } = await import("./selo-render.js");
  for (const selo of selos) {
    try {
      desenharSelo(selo, JSON.parse(selo.dataset.sealPublic), {
        compacta: true,
      });
    } catch {
      /* A assinatura básica continua disponível caso a composição não possa ser lida. */
    }
  }
}

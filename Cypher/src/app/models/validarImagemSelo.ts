import { crc32 } from "node:zlib";

const tamanhoValido = (largura: number, altura: number) =>
  largura >= 1 && altura >= 1 && largura <= 2048 && altura <= 2048;

export function imagemSeloValida(imagem: Buffer, mime: string) {
  if (!imagem.length || imagem.length > 65536) return false;
  if (mime === "image/png") {
    if (
      imagem.length < 45 ||
      !imagem
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      return false;
    let offset = 8,
      temDados = false;
    while (offset + 12 <= imagem.length) {
      const n = imagem.readUInt32BE(offset),
        fim = offset + 12 + n;
      if (fim > imagem.length) return false;
      const tipo = imagem.toString("ascii", offset + 4, offset + 8);
      if (
        !/^[A-Za-z]{4}$/.test(tipo) ||
        crc32(imagem.subarray(offset + 4, fim - 4)) !==
          imagem.readUInt32BE(fim - 4)
      )
        return false;
      if (
        offset === 8 &&
        (tipo !== "IHDR" ||
          n !== 13 ||
          !tamanhoValido(imagem.readUInt32BE(16), imagem.readUInt32BE(20)))
      )
        return false;
      if (tipo === "IDAT" && n > 0) temDados = true;
      if (tipo === "IEND") return temDados && n === 0 && fim === imagem.length;
      offset = fim;
    }
    return false;
  }
  if (
    mime !== "image/jpeg" ||
    imagem.length < 12 ||
    imagem.readUInt16BE(0) !== 0xffd8 ||
    imagem.readUInt16BE(imagem.length - 2) !== 0xffd9
  )
    return false;
  let offset = 2,
    quadro = false;
  while (offset + 4 < imagem.length) {
    if (imagem[offset++] !== 0xff) return false;
    while (imagem[offset] === 0xff) offset++;
    const m = imagem[offset++];
    if (offset + 2 > imagem.length) return false;
    const n = imagem.readUInt16BE(offset);
    if (n < 2 || offset + n >= imagem.length) return false;
    if ([0xc0, 0xc1, 0xc2].includes(m)) {
      if (
        n < 8 ||
        !tamanhoValido(
          imagem.readUInt16BE(offset + 5),
          imagem.readUInt16BE(offset + 3)
        )
      )
        return false;
      quadro = true;
    }
    if (m === 0xda) return quadro && n >= 6 && offset + n < imagem.length - 2;
    offset += n;
  }
  return false;
}

import { criarVetor, vetorPorId } from "./selo-vetores.js";
const NS = "http://www.w3.org/2000/svg";
const fontes = {
  sans: '"Space Grotesk", Arial, sans-serif',
  editorial: "Georgia, serif",
  mono: '"Courier New", monospace',
  pesada: 'Impact, "Arial Black", sans-serif',
  classica: '"Times New Roman", serif',
};
let instancia = 0;
const ultimos = new WeakMap(),
  imagens = new WeakMap();
function svg(tag, attrs = {}, texto) {
  const elemento = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) elemento.setAttribute(k, v);
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export function desenharSelo(el, c, opcoes = {}) {
  const { compacta = false, selecionada, guias = false } = opcoes;
  const assinatura = JSON.stringify([c, compacta, selecionada, guias]);
  if (ultimos.get(el) === assinatura) return;
  ultimos.set(el, assinatura);
  const anteriores = imagens.get(el) || new Map(),
    atuais = new Map();
  imagens.set(el, atuais);
  el.classList.add("pf-seal-composicao");
  el.dataset.forma = c.forma;
  el.dataset.cor = c.paleta;
  el.style.borderRadius = c.raio < 0 ? "" : c.raio + "%";
  const estrutura = c.estrutura || {
    largura: 100,
    altura: 100,
    rotacao: 0,
    margem: 0,
  };
  el.style.width = "calc(var(--seal-size) * " + estrutura.largura / 100 + ")";
  el.style.aspectRatio =
    ((c.forma === "bilhete" ? 1.25 : 1) * estrutura.largura) / estrutura.altura;
  el.style.rotate = estrutura.rotacao + "deg";
  const base = c.fundo.cor || "var(--seal-base)",
    segunda = c.fundo.segunda || "var(--seal-light)";
  const fundos = {
    paleta:
      "radial-gradient(circle at 30% 20%, var(--seal-light), var(--seal-base) 70%)",
    solido: base,
    linear:
      "linear-gradient(" + c.fundo.angulo + "deg," + base + "," + segunda + ")",
    radial: "radial-gradient(circle," + segunda + "," + base + ")",
    transparente: "transparent",
  };
  el.style.background = fundos[c.fundo.tipo];
  const id = "cy-selo-" + ++instancia;
  const s = svg("svg", {
    viewBox: "0 0 100 100",
    "aria-hidden": "true",
    preserveAspectRatio: "none",
  });
  const defs = svg("defs");
  s.append(defs);
  const acabamentos = {
    fosco: "",
    metal:
      "linear-gradient(135deg,#fff0 20%,#ffffff75 38%,#0004 53%,#fff0 70%)",
    acetinado: "linear-gradient(156deg,#ffffff65 4%,#fff0 52%)",
    carimbo: "repeating-linear-gradient(125deg,#0000 0 5px,#0002 6px 7px)",
  };
  const brilho = document.createElement("span");
  brilho.className = "pf-seal-acabamento";
  brilho.style.background = compacta ? "" : acabamentos[c.acabamento];
  const bordas = c.bordas.flatMap(b => {
    if (b.tipo === "nenhuma" || b.espessura === 0) return [];
    const numeros =
      b.tipo === "dupla" ? [b.recuo, b.recuo + b.espessura] : [b.recuo];
    return numeros.map(inset => {
      const moldura = document.createElement("span");
      moldura.className = "pf-seal-moldura";
      Object.assign(moldura.style, {
        inset: inset + "%",
        opacity: b.opacidade / 100,
        borderWidth:
          (b.tipo === "dupla" ? b.espessura / 2 : b.espessura) + "cqi",
        borderColor: b.cor || "currentColor",
        borderStyle:
          { tracejada: "dashed", pontilhada: "dotted" }[b.tipo] || "solid",
      });
      return moldura;
    });
  });
  if (!compacta && c.textura.tipo !== "nenhuma") {
    const n = c.textura.escala;
    const p = svg("pattern", {
      id: id + "-t",
      width: n,
      height: n,
      patternUnits: "userSpaceOnUse",
    });
    if (c.textura.tipo === "pontos")
      p.append(
        svg("circle", { cx: n / 2, cy: n / 2, r: 1, fill: "currentColor" })
      );
    else
      p.append(
        svg("path", {
          d:
            c.textura.tipo === "grade"
              ? "M0 0H" + n + "M0 0V" + n
              : c.textura.tipo === "riscado"
                ? "M0 " + n + "L" + n + " 0 M0 0L" + n + " " + n
                : "M0 " + n + "L" + n + " 0",
          stroke: "currentColor",
          "stroke-width": 1,
        })
      );
    defs.append(p);
    s.append(
      svg("rect", {
        width: 100,
        height: 100,
        fill: "url(#" + id + "-t)",
        opacity: c.textura.opacidade / 100,
      })
    );
  }
  if (guias) {
    s.append(
      svg("path", {
        d: "M50 0v100M0 50h100",
        fill: "none",
        stroke: "#fff",
        "stroke-width": 0.4,
        "stroke-dasharray": "2 2",
        opacity: 0.85,
      }),
      svg("rect", {
        x: 12,
        y: 12,
        width: 76,
        height: 76,
        fill: "none",
        stroke: "#fff",
        "stroke-width": 0.45,
        "stroke-dasharray": "2 2",
      })
    );
  }
  const arte = svg("g", {
    transform:
      "translate(" +
      estrutura.margem +
      " " +
      estrutura.margem +
      ") scale(" +
      (1 - estrutura.margem / 50) +
      ")",
    "data-seal-arte": "",
  });
  s.append(arte);
  for (const [i, l] of c.camadas.entries()) {
    if (!l.mostrar || (compacta && !l.compacta) || !l.valor) continue;
    const visual = l.tipo === "imagem";
    const vetorial = l.tipo === "simbolo" || l.tipo === "ornamento";
    const vetor = vetorial ? vetorPorId(l.valor) : null;
    if (vetorial && !vetor) continue;
    const ext = 0.6 * l.escala;
    const corpo = svg("g", {
      transform:
        "translate(" +
        l.x +
        " " +
        l.y +
        ") rotate(" +
        l.rotacao +
        ") scale(" +
        ((l.flip ? -1 : 1) * l.largura) / 100 +
        " " +
        l.altura / 100 +
        ")",
      opacity: l.opacidade / 100,
      "data-camada": l.id,
      fill: l.cor || "currentColor",
    });
    const texto = vetor
      ? criarVetor(vetor, {
          tamanho: ((l.tipo === "ornamento" ? 26 : 24) * l.escala) / 100,
          cor: l.cor || "currentColor",
          contorno: l.contorno || "currentColor",
          espessura: l.espessura,
          preencher: l.preencher !== false,
          trama: l.trama,
          acabamentoVetor: l.acabamentoVetor,
          defs,
          prefixo: id + "-v" + i,
        })
      : visual
        ? anteriores.get(l.id) || svg("image")
        : svg("text", {
            "text-anchor": "middle",
            "dominant-baseline": l.curva ? "auto" : "central",
            "font-weight": l.peso,
            "font-family": fontes[l.fonte],
            "font-size":
              ({ letras: 30, texto: 12, simbolo: 23, ornamento: 20 }[l.tipo] *
                l.escala) /
              100,
            "letter-spacing": l.espaco,
            "paint-order": "stroke fill",
            "stroke-linejoin": "round",
            stroke: l.espessura ? l.contorno || "currentColor" : "none",
            "stroke-width": l.espessura,
          });
    if (visual) {
      atuais.set(l.id, texto);
      const caminho = "/selos/imagem/" + encodeURIComponent(l.valor);
      if (texto.getAttribute("href") !== caminho)
        texto.setAttribute("href", caminho);
      for (const [k, v] of Object.entries({
        x: -ext / 2,
        y: -ext / 2,
        width: ext,
        height: ext,
        preserveAspectRatio: l.recorte ? "xMidYMid slice" : "xMidYMid meet",
      }))
        texto.setAttribute(k, v);
      texto.removeAttribute("filter");
      if (l.mono) {
        const f = svg("filter", { id: id + "-mono-" + i });
        f.append(svg("feColorMatrix", { type: "saturate", values: "0" }));
        defs.append(f);
        texto.setAttribute("filter", "url(#" + id + "-mono-" + i + ")");
      }
    } else if (l.curva && (l.tipo === "letras" || l.tipo === "texto")) {
      const caminho = id + "-l" + i;
      const rota = svg("path", {
        id: caminho,
        d: "M-65 0 Q0 " + -l.curva + " 65 0",
      });
      corpo.append(rota);
      rota.setAttribute("fill", "none");
      texto.append(
        svg("textPath", { href: "#" + caminho, startOffset: "50%" }, l.valor)
      );
    } else if (!vetorial) texto.textContent = l.valor;
    corpo.append(texto);
    arte.append(corpo);
    if (selecionada === l.id) {
      const geometria = vetorial ? corpo : texto;
      const caixa = geometria.getBBox?.bind(geometria);
      // O contorno de seleção é montado depois que o SVG entra na árvore.
      corpo.classList.add("pf-seal-ativo");
      if (caixa)
        requestAnimationFrame(() => {
          if (!texto.isConnected) return;
          const b = caixa();
          corpo.prepend(
            svg("rect", {
              x: b.x - 2,
              y: b.y - 2,
              width: b.width + 4,
              height: b.height + 4,
              fill: "none",
              stroke: "#fff",
              "stroke-width": 0.55,
              "stroke-dasharray": "1.8 1.3",
              "pointer-events": "none",
            })
          );
        });
    }
  }
  el.replaceChildren(brilho, ...bordas, s);
}

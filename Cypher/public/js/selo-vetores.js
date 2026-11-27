import catalogo from "./selo-vetores.json" with { type: "json" };

export const categoriasVetores = {
  musica: "Música",
  arte: "Arte",
  urbana: "Cultura urbana",
  natureza: "Natureza",
  fauna: "Fauna",
  universo: "Universo",
  geometria: "Geometria",
  abstracao: "Abstração",
  identidade: "Identidade",
  industria: "Indústria",
  ornamentos: "Ornamentação",
};
export const estilosVetores = {
  minimalista: "Minimalista",
  brutalista: "Brutalista",
  geometrico: "Geométrico",
  classico: "Clássico",
  gotico: "Gótico",
  industrial: "Industrial",
  ornamental: "Ornamental",
  abstrato: "Abstrato",
  stencil: "Stencil",
  underground: "Underground",
};
export const vetores = catalogo;
const pilhas = Object.keys(categoriasVetores).map(cat =>
  vetores.filter(v => v.categoria === cat)
);
const descoberta = Array.from(
  { length: Math.max(...pilhas.map(p => p.length)) },
  (_, i) => pilhas.map(p => p[i]).filter(Boolean)
).flat();
const porId = new Map(vetores.map(v => [v.id, v]));
export const vetorPorId = id => porId.get(id);
export const simplificar = s =>
  String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
export function pesquisarVetores({
  busca = "",
  categoria = "",
  estilo = "",
  colecao = "",
  favoritos = [],
  recentes = [],
  origem = "",
  familia = "",
} = {}) {
  const palavras = simplificar(busca)
    .trim()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const conjunto =
    colecao === "recentes"
      ? recentes.map(vetorPorId).filter(Boolean)
      : colecao === "favoritos"
        ? favoritos.map(vetorPorId).filter(Boolean)
        : categoria || origem || palavras.length
          ? vetores
          : descoberta;
  return conjunto.filter(v => {
    if (
      (categoria && v.categoria !== categoria) ||
      (estilo && v.estilo !== estilo) ||
      (origem && v.categoria !== origem) ||
      (familia && v.familia !== familia)
    )
      return false;
    const index = simplificar(
      [
        v.id,
        v.nome,
        v.familia,
        categoriasVetores[v.categoria],
        estilosVetores[v.estilo],
        ...v.palavras,
      ].join(" ")
    );
    return palavras.every(p => index.includes(p));
  });
}

const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}
const tramas = {
  linhas: "M-2 2 2-2M0 6l6-6M4 8l4-4",
  grade: "M0 3h6M3 0v6",
  riscado: "M-2 2 2-2M0 6l6-6M4 8l4-4M0 0l6 6",
};
function camadaTrama(defs, id, trama) {
  const p = el("pattern", {
    id,
    width: 6,
    height: 6,
    patternUnits: "userSpaceOnUse",
  });
  if (trama === "pontos") {
    p.append(
      el("circle", {
        cx: 1.4,
        cy: 1.4,
        r: 0.85,
        fill: "#111",
        "fill-opacity": 0.52,
      }),
      el("circle", {
        cx: 4.4,
        cy: 4.4,
        r: 0.8,
        fill: "#fff",
        "fill-opacity": 0.65,
      })
    );
  } else {
    const d = tramas[trama];
    if (!d) return "";
    p.append(
      el("path", {
        d,
        fill: "none",
        stroke: "#111",
        "stroke-width": 1.35,
        "stroke-opacity": 0.48,
      }),
      el("path", {
        d,
        fill: "none",
        stroke: "#fff",
        "stroke-width": 0.46,
        "stroke-opacity": 0.64,
        transform: "translate(.65 .65)",
      })
    );
  }
  defs.append(p);
  return "url(#" + id + ")";
}
function acabamento(defs, id, tipo) {
  if (tipo === "carimbo") {
    const p = el("pattern", {
      id,
      width: 11,
      height: 9,
      patternUnits: "userSpaceOnUse",
    });
    p.append(
      el("path", {
        d: "M0 1h3v1H0Zm6 2h2v1H6ZM2 7l3-1 1 1-3 1Zm7-1h2v1H9Z",
        fill: "#111",
        opacity: 0.38,
      })
    );
    defs.append(p);
    return "url(#" + id + ")";
  }
  const stops =
    tipo === "metal"
      ? [
          [0, "#111", 0.2],
          [0.3, "#fff", 0.12],
          [0.46, "#fff", 0.68],
          [0.56, "#141414", 0.4],
          [0.77, "#fff", 0.26],
          [1, "#111", 0.22],
        ]
      : tipo === "acetinado"
        ? [
            [0, "#fff", 0.67],
            [0.32, "#fff", 0.23],
            [0.64, "#fff", 0],
            [1, "#222", 0.18],
          ]
        : [];
  if (!stops.length) return "";
  const g = el("linearGradient", { id, x1: 0, y1: 0, x2: 1, y2: 1 });
  for (const [offset, cor, opacidade] of stops)
    g.append(
      el("stop", { offset, "stop-color": cor, "stop-opacity": opacidade })
    );
  defs.append(g);
  return "url(#" + id + ")";
}

export function criarVetor(
  v,
  {
    tamanho = 52,
    cor = "currentColor",
    contorno = "currentColor",
    espessura = 0,
    preencher = true,
    trama = "nenhuma",
    acabamentoVetor = "fosco",
    defs,
    prefixo = "vetor",
  } = {}
) {
  const group = el("g", { "data-vetor": v.id });
  const [x, y, w, h] = v.caixa,
    s = tamanho / Math.max(w, h);
  group.setAttribute(
    "transform",
    "scale(" + s + ") translate(" + (-x - w / 2) + " " + (-y - h / 2) + ")"
  );
  group.append(
    el("path", {
      d: v.d,
      fill: preencher ? cor : "none",
      "fill-rule": "evenodd",
      stroke: espessura > 0 ? contorno : "none",
      "stroke-width": espessura / s,
      "stroke-linejoin": "round",
      "paint-order": "stroke fill",
    })
  );
  if (defs && preencher) {
    const a = acabamento(defs, prefixo + "-acab", acabamentoVetor);
    const t = camadaTrama(defs, prefixo + "-trama", trama);
    for (const fill of [a, t].filter(Boolean))
      group.append(
        el("path", {
          d: v.d,
          fill,
          "fill-rule": "evenodd",
          "pointer-events": "none",
        })
      );
  }
  return group;
}

export function miniaturaVetor(v) {
  const mini = el("svg", {
    viewBox: "-32 -32 64 64",
    "aria-hidden": true,
    focusable: false,
  });
  mini.append(criarVetor(v));
  return mini;
}

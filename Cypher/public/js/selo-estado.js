export const copia = valor => structuredClone(valor);
export const tipologias = {
  letras: "Monograma",
  texto: "Texto",
  simbolo: "Símbolo",
  ornamento: "Ornamento",
  imagem: "Marca",
};
export const zona = (n, min, max) => Math.max(min, Math.min(max, n));
export function novaCamada(tipo, valor, extras = {}) {
  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), n =>
          n.toString(16).padStart(2, "0")
        ).join(""),
    tipo,
    valor,
    nome: "",
    fonte: "sans",
    peso: 800,
    espaco: 0,
    curva: 0,
    cor: "",
    contorno: "",
    espessura: 0,
    x: 50,
    y: 50,
    escala: 100,
    largura: 100,
    altura: 100,
    rotacao: 0,
    opacidade: 100,
    flip: false,
    mostrar: true,
    bloquear: false,
    compacta: ["letras", "simbolo", "imagem"].includes(tipo),
    recorte: false,
    mono: false,
    ...(["simbolo", "ornamento"].includes(tipo)
      ? { preencher: true, trama: "nenhuma", acabamentoVetor: "fosco" }
      : {}),
    ...extras,
  };
}
export function baseSelo(forma = "orbita", paleta = "oliva") {
  return {
    v: 1,
    forma,
    paleta,
    raio: -1,
    estrutura: { largura: 100, altura: 100, rotacao: 0, margem: 0 },
    fundo: { tipo: "paleta", cor: "", segunda: "", angulo: 135 },
    bordas: [
      { tipo: "solida", cor: "", espessura: 2, recuo: 0, opacidade: 100 },
      { tipo: "solida", cor: "", espessura: 1, recuo: 9, opacidade: 70 },
    ],
    textura: { tipo: "nenhuma", opacidade: 20, escala: 8 },
    acabamento: "fosco",
    camadas: [],
  };
}
export function converterSelo(forma, cor, letras, simbolo) {
  const c = baseSelo(forma, cor);
  if (simbolo && simbolo !== "nenhum")
    c.camadas.push(novaCamada("simbolo", simbolo, { y: 30, escala: 83 }));
  if (letras)
    c.camadas.push(
      novaCamada("letras", letras, {
        y: c.camadas.length ? 58 : 50,
        espaco: -1,
      })
    );
  return c;
}
export const modelos = [
  ["Essencial", "disco", "prata", "sans", "fosco", "nenhuma", "nenhum"],
  ["Industrial", "quadro", "cobre", "pesada", "metal", "grade", "raio"],
  ["Cromo", "orbita", "prata", "mono", "metal", "nenhuma", "estrela"],
  ["Carimbo", "placa", "areia", "pesada", "carimbo", "pontos", "alvo"],
  ["Subsolo", "onda", "oliva", "pesada", "fosco", "riscado", "pulso"],
  ["Brasão", "escudo", "ouro", "classica", "acetinado", "nenhuma", "coroa"],
  ["Editorial", "bilhete", "prata", "editorial", "fosco", "nenhuma", "nenhum"],
  ["Geometria", "prisma", "ciano", "mono", "acetinado", "grade", "hexagono"],
  ["Abstrato", "gota", "lilas", "sans", "metal", "linhas", "infinito"],
  ["Retrô", "disco", "cobre", "editorial", "acetinado", "pontos", "disco"],
  ["Monocromático", "quadro", "prata", "mono", "fosco", "linhas", "centro"],
  ["Stencil", "placa", "jade", "pesada", "carimbo", "riscado", "cruz"],
  ["Futuro", "onda", "ciano", "sans", "metal", "grade", "planeta"],
];
export function modeloSelo(modelo, letras) {
  const [, forma, paleta, fonte, acabamento, textura, simbolo] = modelo;
  const c = converterSelo(forma, paleta, letras, simbolo);
  c.acabamento = acabamento;
  c.textura.tipo = textura;
  const monograma = c.camadas.find(l => l.tipo === "letras");
  if (monograma) monograma.fonte = fonte;
  if (acabamento === "carimbo") c.bordas[1].tipo = "tracejada";
  return c;
}
export function criarHistorico(inicial) {
  let atual = copia(inicial),
    iniciado = null;
  const passado = [],
    futuro = [];
  const mesmo = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function guardar(antes) {
    if (mesmo(antes, atual)) return;
    passado.push(antes);
    if (passado.length > 60) passado.shift();
    futuro.length = 0;
  }
  return {
    get atual() {
      return atual;
    },
    get podeDesfazer() {
      return Boolean(passado.length);
    },
    get podeRefazer() {
      return Boolean(futuro.length);
    },
    iniciar() {
      if (!iniciado) iniciado = copia(atual);
    },
    concluir() {
      if (iniciado) {
        guardar(iniciado);
        iniciado = null;
      }
    },
    cancelar() {
      if (iniciado) {
        atual = iniciado;
        iniciado = null;
      }
    },
    alterar(fn, continua = false) {
      if (continua) this.iniciar();
      else this.concluir();
      const antes = continua ? null : copia(atual);
      if (typeof fn === "function") fn(atual);
      else atual = copia(fn);
      if (antes) guardar(antes);
    },
    desfazer() {
      this.concluir();
      if (passado.length) {
        futuro.push(atual);
        atual = passado.pop();
      }
    },
    refazer() {
      this.concluir();
      if (futuro.length) {
        passado.push(atual);
        atual = futuro.pop();
      }
    },
  };
}

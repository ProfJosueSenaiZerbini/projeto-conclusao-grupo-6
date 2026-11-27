import { ErroInteracao } from "./interacoesConteudo.js";
import { vetorSelo } from "./vetoresSelo.js";

export const formasSelo = {
  disco: "Disco",
  placa: "Placa",
  quadro: "Quadro",
  orbita: "Órbita",
  onda: "Frequência",
  prisma: "Prisma",
  escudo: "Escudo",
  gota: "Gota",
  bilhete: "Bilhete",
};
export const coresSelo = {
  oliva: "Ácido",
  areia: "Areia",
  lilas: "Ultravioleta",
  cobre: "Cobre",
  ciano: "Ciano",
  rosa: "Magenta",
  ouro: "Ouro velho",
  rubi: "Rubi",
  jade: "Jade",
  prata: "Prata",
};
export const simbolosSelo = {
  pulso: "Pulso",
  estrela: "Estrela",
  raio: "Raio",
  alvo: "Alvo",
  onda: "Onda",
  flor: "Flor",
  coroa: "Coroa",
  lua: "Lua",
  diamante: "Diamante",
  nota: "Nota",
  sol: "Sol",
  nenhum: "Sem símbolo",
};
export const recursosEstudio = {
  fontes: {
    sans: "Sans",
    editorial: "Editorial",
    mono: "Mono",
    pesada: "Impacto",
    classica: "Clássica",
  },
  preenchimentos: {
    paleta: "Paleta",
    solido: "Sólido",
    linear: "Degradê linear",
    radial: "Degradê radial",
    transparente: "Transparente",
  },
  texturas: {
    nenhuma: "Sem textura",
    linhas: "Hachura",
    pontos: "Pontilhado",
    grade: "Grade",
    riscado: "Riscado",
  },
  acabamentos: {
    fosco: "Fosco",
    metal: "Metálico",
    acetinado: "Acetinado",
    carimbo: "Carimbo",
  },
  bordas: {
    nenhuma: "Sem contorno",
    solida: "Sólido",
    tracejada: "Tracejado",
    pontilhada: "Pontilhado",
    dupla: "Duplo",
  },
};

const falha = () => {
  throw new ErroInteracao(
    "A composição contém opções inválidas ou excede os limites do estúdio."
  );
};
function registro(valor: unknown, chaves: string) {
  if (
    !valor ||
    typeof valor !== "object" ||
    Array.isArray(valor) ||
    Object.keys(valor).length !== chaves.split(" ").length ||
    chaves.split(" ").some(chave => !Object.hasOwn(valor, chave))
  )
    return falha();
  return valor as Record<string, unknown>;
}
function opcao<T extends Record<string, unknown>>(valor: unknown, opcoes: T) {
  if (typeof valor !== "string" || !Object.hasOwn(opcoes, valor))
    return falha();
  return valor as keyof T & string;
}
function numero(valor: unknown, min: number, max: number) {
  if (
    typeof valor !== "number" ||
    !Number.isFinite(valor) ||
    valor < min ||
    valor > max
  )
    return falha();
  return Math.round(valor * 100) / 100;
}
function booleano(valor: unknown) {
  if (typeof valor !== "boolean") return falha();
  return valor;
}
function cor(valor: unknown, automatica = true) {
  if (
    typeof valor !== "string" ||
    !((automatica && valor === "") || /^#[a-fA-F0-9]{6}$/.test(valor))
  )
    return falha();
  return valor.toLowerCase();
}
export function validarComposicao(valor: unknown, publicar = false) {
  const moderna =
    valor && typeof valor === "object" && Object.hasOwn(valor, "estrutura");
  const c = registro(
    valor,
    "v forma paleta raio fundo bordas textura acabamento camadas" +
      (moderna ? " estrutura" : "")
  );
  const estrutura = moderna
    ? registro(c.estrutura, "largura altura rotacao margem")
    : { largura: 100, altura: 100, rotacao: 0, margem: 0 };
  if (
    c.v !== 1 ||
    !Array.isArray(c.camadas) ||
    c.camadas.length > 12 ||
    !Array.isArray(c.bordas) ||
    c.bordas.length !== 2
  )
    return falha();
  const f = registro(c.fundo, "tipo cor segunda angulo");
  const t = registro(c.textura, "tipo opacidade escala");
  const ids = new Set<string>();
  const camadas = c.camadas.map(valor => {
    const extras = ["preencher", "trama", "acabamentoVetor"].filter(
      chave => valor && typeof valor === "object" && Object.hasOwn(valor, chave)
    );
    const l = registro(
      valor,
      [
        "id tipo valor nome fonte peso espaco curva cor contorno espessura x y escala largura altura rotacao opacidade flip mostrar bloquear compacta recorte mono",
        ...extras,
      ].join(" ")
    );
    const tipo = opcao(l.tipo, {
      letras: true,
      texto: true,
      simbolo: true,
      ornamento: true,
      imagem: true,
    });
    if (
      typeof l.id !== "string" ||
      !/^[a-z0-9-]{1,36}$/.test(l.id) ||
      ids.has(l.id)
    )
      return falha();
    ids.add(l.id);
    if (typeof l.valor !== "string" || l.valor.length > 160) return falha();
    const texto = l.valor.trim().normalize("NFC");
    if (
      typeof l.nome !== "string" ||
      l.nome.length > 48 ||
      !/^[\p{L}\p{M}\p{N} .,'’!?()+&/—·-]*$/u.test(l.nome)
    )
      return falha();
    if (tipo === "letras" && !/^[\p{L}0-9]{0,3}$/u.test(texto)) return falha();
    if (
      tipo === "texto" &&
      (!/^[\p{L}\p{M}\p{N} .,'’!?:+&/—·-]{0,36}$/u.test(texto) ||
        [...texto].length > 36)
    )
      return falha();
    const vetorial = tipo === "simbolo" || tipo === "ornamento";
    if (vetorial ? !vetorSelo(texto) : extras.length > 0) return falha();
    if (
      tipo === "imagem" &&
      !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(texto)
    )
      return falha();
    return {
      id: l.id,
      tipo,
      valor: texto,
      nome: l.nome.trim(),
      fonte: opcao(l.fonte, recursosEstudio.fontes),
      peso: numero(l.peso, 400, 900),
      espaco: numero(l.espaco, -4, 6),
      curva: numero(l.curva, -40, 40),
      cor: cor(l.cor),
      contorno: cor(l.contorno),
      espessura: numero(l.espessura, 0, 4),
      x: numero(l.x, -20, 120),
      y: numero(l.y, -20, 120),
      escala: numero(l.escala, 10, 220),
      largura: numero(l.largura, 25, 180),
      altura: numero(l.altura, 25, 180),
      rotacao: numero(l.rotacao, -180, 180),
      opacidade: numero(l.opacidade, 0, 100),
      flip: booleano(l.flip),
      mostrar: booleano(l.mostrar),
      bloquear: booleano(l.bloquear),
      compacta: booleano(l.compacta),
      recorte: booleano(l.recorte),
      mono: booleano(l.mono),
      ...(vetorial
        ? {
            preencher: Object.hasOwn(l, "preencher")
              ? booleano(l.preencher)
              : true,
            trama: Object.hasOwn(l, "trama")
              ? opcao(l.trama, recursosEstudio.texturas)
              : "nenhuma",
            acabamentoVetor: Object.hasOwn(l, "acabamentoVetor")
              ? opcao(l.acabamentoVetor, recursosEstudio.acabamentos)
              : "fosco",
          }
        : {}),
    };
  });
  if (
    camadas.filter(l => l.tipo === "letras").length > 1 ||
    (publicar &&
      !camadas.some(
        l =>
          l.mostrar &&
          l.opacidade > 0 &&
          l.valor &&
          (l.preencher !== false || l.espessura > 0) &&
          l.x >= 0 &&
          l.x <= 100 &&
          l.y >= 0 &&
          l.y <= 100
      ))
  )
    throw new ErroInteracao(
      "Inclua pelo menos um elemento visível na área do selo antes de publicar."
    );
  return {
    v: 1,
    forma: opcao(c.forma, formasSelo),
    paleta: opcao(c.paleta, coresSelo),
    raio: numero(c.raio, -1, 50),
    estrutura: {
      largura: numero(estrutura.largura, 65, 125),
      altura: numero(estrutura.altura, 65, 125),
      rotacao: numero(estrutura.rotacao, -45, 45),
      margem: numero(estrutura.margem, 0, 20),
    },
    fundo: {
      tipo: opcao(f.tipo, recursosEstudio.preenchimentos),
      cor: cor(f.cor),
      segunda: cor(f.segunda),
      angulo: numero(f.angulo, 0, 360),
    },
    bordas: c.bordas.map(valor => {
      const b = registro(valor, "tipo cor espessura recuo opacidade");
      return {
        tipo: opcao(b.tipo, recursosEstudio.bordas),
        cor: cor(b.cor),
        espessura: numero(b.espessura, 0, 8),
        recuo: numero(b.recuo, 0, 29),
        opacidade: numero(b.opacidade, 0, 100),
      };
    }),
    textura: {
      tipo: opcao(t.tipo, recursosEstudio.texturas),
      opacidade: numero(t.opacidade, 0, 65),
      escala: numero(t.escala, 2, 16),
    },
    acabamento: opcao(c.acabamento, recursosEstudio.acabamentos),
    camadas,
  };
}
export type ComposicaoSelo = ReturnType<typeof validarComposicao>;
export function lerComposicao(valor: string | null) {
  try {
    return valor ? validarComposicao(JSON.parse(valor)) : null;
  } catch {
    return null;
  }
}

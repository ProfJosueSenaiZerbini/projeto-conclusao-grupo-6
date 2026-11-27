import { randomUUID } from "node:crypto";

export const estadosEndereco: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

export function cepEvento(v: unknown) {
  const s = typeof v === "string" ? v.trim() : "";
  return /^\d{5}-?\d{3}$/.test(s) ? s.replace("-", "") : "";
}
function campo(v: unknown, max: number) {
  return typeof v === "string"
    ? v.trim().replace(/\s+/g, " ").slice(0, max)
    : "";
}
export function enderecoEvento(b: Record<string, unknown>) {
  return {
    cep: cepEvento(b.cep),
    rua: campo(b.rua, 65),
    numero: campo(b.numero, 12),
    bairro: campo(b.bairro, 42),
    cidade: campo(b.cidade, 45),
    uf: campo(b.uf, 2).toUpperCase(),
  };
}
type Endereco = ReturnType<typeof enderecoEvento>;
type Ponto = { latitude: number; longitude: number };
export function lerEnderecoEvento(json: unknown): Endereco | null {
  if (typeof json !== "string" || !json) return null;
  try {
    const e = enderecoEvento(JSON.parse(json));
    return enderecoValido(e) ? e : null;
  } catch {
    return null;
  }
}
export function enderecoValido(e: Endereco) {
  return (
    e.rua.length >= 2 &&
    e.cidade.length >= 2 &&
    Object.hasOwn(estadosEndereco, e.uf)
  );
}
export function rotuloEndereco(e: Endereco) {
  return [
    [e.rua, e.numero].filter(Boolean).join(", "),
    e.bairro,
    [e.cidade, e.uf].filter(Boolean).join(" - "),
    e.cep ? e.cep.slice(0, 5) + "-" + e.cep.slice(5) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
export function cidadeMapa(e: Endereco | null) {
  return e
    ? {
        id: normalizar(e.cidade) + "-" + e.uf.toLowerCase(),
        label: e.cidade + " - " + e.uf,
      }
    : null;
}
function normalizar(v: unknown) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
export function chaveEndereco(e: Endereco) {
  return JSON.stringify(
    [e.cep, e.rua, e.numero, e.bairro, e.cidade, e.uf].map(normalizar)
  );
}
const provas = new Map<
  string,
  { ator: string; chave: string; ponto: Ponto; vence: number }
>();
const ttl = 30 * 60_000;
export function emitirProvaLocal(ator: string, e: Endereco, ponto: Ponto) {
  const id = randomUUID();
  if (provas.size >= 500) provas.delete(provas.keys().next().value!);
  provas.set(id, {
    ator,
    chave: chaveEndereco(e),
    ponto,
    vence: Date.now() + ttl,
  });
  return id;
}
export function pontoDaProva(ator: string, e: Endereco, id: string) {
  const p = provas.get(id);
  return p &&
    p.vence >= Date.now() &&
    p.ator === ator &&
    p.chave === chaveEndereco(e)
    ? p.ponto
    : null;
}
export function pontoEvento(c: Record<string, unknown>): Ponto | null {
  const { latitude, longitude } = c;
  return c.local_confirmado === 1 &&
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null;
}
export function previaMapa({ latitude: lat, longitude: lon }: Ponto) {
  const q = new URLSearchParams({
    bbox: [
      Math.max(-180, lon - 0.006),
      Math.max(-90, lat - 0.004),
      Math.min(180, lon + 0.006),
      Math.min(90, lat + 0.004),
    ].join(","),
    layer: "mapnik",
    marker: lat + "," + lon,
  });
  return "https://www.openstreetmap.org/export/embed.html?" + q;
}
export function selecionarPontoEvento(
  e: Endereco,
  dados: unknown
): Ponto | null {
  const d = dados as {
    features?: Array<{
      properties?: Record<string, unknown>;
      geometry?: { type: string; coordinates: unknown[] };
    }>;
  };
  if (!Array.isArray(d?.features)) return null;
  const pontos: Ponto[] = [];
  for (const f of d.features) {
    const p = f?.properties,
      g = f?.geometry;
    if (!p || !g || g.type !== "Point" || !Array.isArray(g.coordinates))
      continue;
    const [longitude, latitude] = g.coordinates;
    const uf = normalizar(p.state);
    if (
      normalizar(p.countrycode) !== "br" ||
      ![normalizar(e.uf), normalizar(estadosEndereco[e.uf])].includes(uf) ||
      ![p.city, p.county].some(v => normalizar(v) === normalizar(e.cidade)) ||
      normalizar(p.street) !== normalizar(e.rua) ||
      !e.numero ||
      normalizar(p.housenumber) !== normalizar(e.numero) ||
      (e.cep && cepEvento(p.postcode) && cepEvento(p.postcode) !== e.cep) ||
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      !(
        longitude >= -74 &&
        longitude <= -28 &&
        latitude >= -34 &&
        latitude <= 6
      )
    )
      continue;
    pontos.push({ latitude, longitude });
  }
  const primeiro = pontos[0];
  if (
    !primeiro ||
    pontos.some(
      p =>
        Math.hypot(
          p.latitude - primeiro.latitude,
          p.longitude - primeiro.longitude
        ) > 0.0005
    )
  )
    return null;
  return primeiro;
}
const cache = new Map<string, { ponto: Ponto | null; vence: number }>();
let proxima = 0;
export async function buscarPontoEvento(
  e: Endereco,
  buscar = globalThis.fetch
) {
  if (!enderecoValido(e) || !e.numero) return null;
  const chave = chaveEndereco(e),
    agora = Date.now(),
    existente = cache.get(chave);
  if (existente && existente.vence > agora) return existente.ponto;
  if (agora < proxima)
    throw new Error("Aguarde um instante e tente novamente.");
  proxima = agora + 1200;
  const url = new URL(
    "structured",
    process.env.CYPHER_PHOTON_URL || "https://photon.komoot.io/"
  );
  url.search = new URLSearchParams({
    countrycode: "BR",
    state: estadosEndereco[e.uf]!,
    city: e.cidade,
    street: e.rua,
    housenumber: e.numero,
    limit: "8",
  }).toString();
  const r = await buscar(url, {
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/geo+json", "User-Agent": "Cypher-TCC/1.0" },
  });
  if (!r.ok) throw new Error("O serviço de mapa está indisponível.");
  const ponto = selecionarPontoEvento(e, await r.json());
  if (cache.size >= 500) cache.delete(cache.keys().next().value!);
  cache.set(chave, { ponto, vence: agora + (ponto ? 86400_000 : 300_000) });
  return ponto;
}

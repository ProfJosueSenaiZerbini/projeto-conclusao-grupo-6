import { readFileSync } from "node:fs";
import path from "node:path";

type VetorSelo = {
  id: string;
  nome: string;
  categoria: string;
  estilo: string;
  familia: string;
  palavras: string[];
  d: string;
  caixa: [number, number, number, number];
};
const catalogo = JSON.parse(
  readFileSync(path.resolve("public/js/selo-vetores.json"), "utf8")
) as VetorSelo[];
const porId = new Map(catalogo.map(vetor => [vetor.id, vetor]));
export function vetorSelo(id: unknown) {
  return typeof id === "string" ? porId.get(id) : undefined;
}

import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const fonte = fs.readFileSync(new URL("../public/js/mapa-eventos.js", import.meta.url), "utf8");

function iniciar() {
  const status = { hidden: true };
  const area = { hidden: true, dataset: {} };
  const temporizadores = new Map();
  const recursos = new Map();
  const eventos = new Map();
  let proximo = 0;
  const recurso = tag => {
    const listeners = new Map();
    return {
      tag,
      emitir: nome => listeners.get(nome)(),
      addEventListener: (nome, fn) => listeners.set(nome, fn),
      remove() { this.removido = true; },
    };
  };
  const mapa = { attributionControl: { setPrefix() {} }, fitBounds() {} };
  const L = {
    map: () => mapa,
    control: { zoom: () => ({ addTo() {} }) },
    tileLayer() {
      return { on(nome, fn) { eventos.set(nome, fn); return this; }, addTo() {} };
    },
  };
  const window = {};
  vm.runInNewContext(fonte, {
    document: {
      querySelector: seletor => seletor === "[data-event-map]" ? area : status,
      querySelectorAll: () => [],
      head: { append: (...itens) => itens.forEach(item => recursos.set(item.tag, item)) },
      createElement: recurso,
    },
    window,
    setTimeout: fn => {
      const id = ++proximo;
      temporizadores.set(id, fn);
      return id;
    },
    clearTimeout: id => temporizadores.delete(id),
  });
  return {
    status, area, recursos, temporizadores,
    prazo() { for (const fn of [...temporizadores.values()]) fn(); },
    carregar() {
      window.L = L;
      recursos.get("script").emitir("load");
      recursos.get("link").emitir("load");
    },
    emitir: nome => eventos.get(nome)(),
  };
}

for (const falha of ["erro", "demora"]) {
  const t = iniciar();
  assert.equal(t.area.hidden, true);
  assert.match(t.status.textContent, /Carregando/);
  if (falha === "erro") t.recursos.get("script").emitir("error");
  else t.prazo();
  await new Promise(setImmediate);
  assert.equal(t.area.hidden, true);
  assert.equal(t.status.hidden, false);
  assert.match(t.status.textContent, /endereços continuam na lista/);
  assert.ok([...t.recursos.values()].every(recurso => recurso.removido));
}

const t = iniciar();
t.carregar();
await new Promise(setImmediate);
assert.equal(t.area.hidden, false);
assert.equal(t.temporizadores.size, 0);
t.emitir("loading");
assert.match(t.status.textContent, /Carregando mapa de fundo/);
t.prazo();
assert.match(t.status.textContent, /O mapa de fundo não carregou/);
t.emitir("tileload");
t.emitir("load");
assert.equal(t.status.hidden, true);
t.emitir("loading");
t.emitir("load");
assert.match(t.status.textContent, /O mapa de fundo não carregou/);
assert.equal(t.temporizadores.size, 0);

console.log("Mapa: falha e demora do CDN, demora e falha do fundo, recuperação e lista alternativa verificados.");

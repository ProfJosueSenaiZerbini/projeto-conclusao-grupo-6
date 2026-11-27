import {
  categoriasVetores,
  estilosVetores,
  miniaturaVetor,
  pesquisarVetores,
  vetorPorId,
  vetores,
} from "./selo-vetores.js";

const LIMITE = 24;
const familias = new Map();
for (const v of vetores)
  familias.set(v.familia, (familias.get(v.familia) || 0) + 1);

function elemento(tag, texto, classe) {
  const el = document.createElement(tag);
  if (texto) el.textContent = texto;
  if (classe) el.className = classe;
  return el;
}
function botao(texto, classe) {
  const b = elemento("button", texto, classe);
  b.type = "button";
  return b;
}
function seletor(nome, opcoes, valor, label) {
  const l = elemento("label", label),
    s = elemento("select");
  s.name = nome;
  for (const [k, n] of Object.entries(opcoes)) {
    const o = elemento("option", n);
    o.value = k;
    s.append(o);
  }
  s.value = valor;
  l.append(s);
  return [l, s];
}

export function bibliotecaSelo(autor, aoEscolher) {
  const chave = "cypher-selo-biblioteca-v1:" + (autor || "local");
  const preferencias = { favoritos: [], recentes: [] };
  try {
    const antigas = JSON.parse(localStorage.getItem(chave) || "null");
    for (const k of ["favoritos", "recentes"])
      if (Array.isArray(antigas?.[k]))
        preferencias[k] = [
          ...new Set(antigas[k].filter(id => vetorPorId(id))),
        ].slice(0, k === "recentes" ? 20 : vetores.length);
  } catch {}
  const estados = new Map();
  const salvar = () => {
    try {
      localStorage.setItem(chave, JSON.stringify(preferencias));
    } catch {}
  };
  return {
    usar(id) {
      preferencias.recentes = [
        id,
        ...preferencias.recentes.filter(x => x !== id),
      ].slice(0, 20);
      salvar();
    },
    montar(raiz, { origem = "", troca = false, cheio = false } = {}) {
      if (!estados.has(origem))
        estados.set(origem, {
          busca: "",
          categoria: "",
          estilo: "",
          colecao: "",
          familia: "",
          limite: LIMITE,
        });
      const estado = estados.get(origem);
      const filtros = elemento("div", null, "se-vetor-filtros");
      const busca = elemento("input");
      busca.type = "search";
      busca.placeholder = "Ex.: vinil, gótico, grafite";
      busca.value = estado.busca;
      busca.dataset.seBusca = "";
      const buscar = elemento(
        "label",
        "Buscar por nome ou palavra-chave",
        "se-vetor-busca"
      );
      buscar.append(busca);
      filtros.append(buscar);
      const [catL, cat] = seletor(
        "vetor-categoria",
        { "": "Todas as categorias", ...categoriasVetores },
        estado.categoria,
        "Categoria"
      );
      if (!origem) filtros.append(catL);
      const [estL, est] = seletor(
        "vetor-estilo",
        { "": "Todos os estilos", ...estilosVetores },
        estado.estilo,
        "Estilo"
      );
      filtros.append(estL);
      const tabs = elemento("div", null, "se-vetor-colecoes");
      tabs.setAttribute("role", "group");
      tabs.setAttribute("aria-label", "Coleção de símbolos");
      const resultadosLinha = elemento("div", null, "se-vetor-linha");
      const info = elemento("p", null, "se-vetor-contagem");
      info.setAttribute("role", "status");
      const limpar = botao("Limpar filtros", "se-vetor-limpar");
      resultadosLinha.append(info, limpar);
      limpar.addEventListener("click", () => {
        busca.value = estado.busca = estado.familia = "";
        cat.value = estado.categoria = "";
        est.value = estado.estilo = "";
        estado.limite = LIMITE;
        render();
        busca.focus({ preventScroll: true });
      });
      const grade = elemento("div", null, "se-vetor-grade");
      const mais = botao("Mostrar mais", "se-vetor-mais");
      for (const [k, n] of Object.entries({
        "": "Biblioteca",
        favoritos: "Favoritos",
        recentes: "Recentes",
      })) {
        const tab = botao(n);
        tab.dataset.vetorColecao = k;
        tabs.append(tab);
        tab.addEventListener("click", () => {
          estado.colecao = k;
          estado.limite = LIMITE;
          render();
        });
      }
      function render(foco) {
        for (const t of tabs.children)
          t.setAttribute(
            "aria-pressed",
            String(t.dataset.vetorColecao === estado.colecao)
          );
        const resultados = pesquisarVetores({
          ...estado,
          ...preferencias,
          origem,
        });
        const apresentados = resultados.slice(0, estado.limite);
        limpar.hidden = !(
          estado.busca ||
          estado.categoria ||
          estado.estilo ||
          estado.familia
        );
        info.textContent = resultados.length
          ? apresentados.length +
            " de " +
            resultados.length +
            (resultados.length === 1 ? " desenho" : " desenhos")
          : estado.colecao === "favoritos" &&
              !estado.busca &&
              !estado.categoria &&
              !estado.estilo
            ? "Você ainda não guardou favoritos nesta coleção."
            : estado.colecao === "recentes" &&
                !estado.busca &&
                !estado.categoria &&
                !estado.estilo
              ? "Os desenhos usados aparecem aqui."
              : "Nenhum desenho com esses filtros.";
        grade.replaceChildren();
        for (const v of apresentados) {
          const card = elemento("article", null, "se-vetor-card");
          const escolher = botao(null, "se-vetor-escolher");
          escolher.dataset.vetorEscolher = v.id;
          escolher.disabled = cheio && !troca;
          escolher.setAttribute(
            "aria-label",
            (troca ? "Trocar por " : "Adicionar ") + v.nome
          );
          const moldura = elemento("span", null, "se-vetor-atlas");
          moldura.append(miniaturaVetor(v));
          escolher.append(
            moldura,
            elemento("strong", v.nome),
            elemento("small", estilosVetores[v.estilo])
          );
          escolher.addEventListener("click", () => aoEscolher(v));
          card.append(escolher);
          const favoritado = preferencias.favoritos.includes(v.id);
          const fav = botao(null, "se-vetor-favorito");
          fav.dataset.vetorFavorito = v.id;
          fav.setAttribute("aria-pressed", String(favoritado));
          fav.setAttribute(
            "aria-label",
            (favoritado
              ? "Remover dos favoritos: "
              : "Guardar nos favoritos: ") + v.nome
          );
          fav.title = fav.getAttribute("aria-label");
          const ns = "http://www.w3.org/2000/svg",
            s = document.createElementNS(ns, "svg"),
            p = document.createElementNS(ns, "path");
          s.setAttribute("viewBox", "0 0 20 20");
          s.setAttribute("aria-hidden", "true");
          p.setAttribute(
            "d",
            "M10 2l2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8Z"
          );
          p.setAttribute("fill", favoritado ? "currentColor" : "none");
          p.setAttribute("stroke", "currentColor");
          p.setAttribute("stroke-width", "1.5");
          s.append(p);
          fav.append(s);
          card.append(fav);
          fav.addEventListener("click", () => {
            preferencias.favoritos = favoritado
              ? preferencias.favoritos.filter(id => id !== v.id)
              : [v.id, ...preferencias.favoritos];
            salvar();
            render(v.id);
          });
          if ((familias.get(v.familia) || 0) > 1) {
            const variantes = botao("Variações", "se-vetor-variantes");
            variantes.setAttribute(
              "aria-label",
              "Buscar variações de " + v.nome
            );
            variantes.addEventListener("click", () => {
              busca.value = estado.busca = estado.familia = v.familia;
              cat.value = estado.categoria = "";
              est.value = estado.estilo = "";
              estado.colecao = "";
              estado.limite = LIMITE;
              render();
              busca.focus({ preventScroll: true });
            });
            card.append(variantes);
          }
          grade.append(card);
        }
        mais.hidden = apresentados.length >= resultados.length;
        if (foco) {
          const alvo = [
            ...grade.querySelectorAll("[data-vetor-favorito]"),
          ].find(e => e.dataset.vetorFavorito === foco);
          (alvo || tabs.querySelector('[aria-pressed="true"]')).focus({
            preventScroll: true,
          });
        }
      }
      busca.addEventListener("input", () => {
        estado.busca = busca.value;
        estado.familia = "";
        estado.limite = LIMITE;
        render();
      });
      cat.addEventListener("change", () => {
        estado.categoria = cat.value;
        estado.limite = LIMITE;
        render();
      });
      est.addEventListener("change", () => {
        estado.estilo = est.value;
        estado.limite = LIMITE;
        render();
      });
      mais.addEventListener("click", () => {
        const quantidade = grade.children.length;
        estado.limite += LIMITE;
        render();
        grade.children[quantidade]
          ?.querySelector("button:not(:disabled)")
          ?.focus({ preventScroll: true });
      });
      raiz.replaceChildren(tabs, filtros, resultadosLinha, grade, mais);
      render();
    },
  };
}

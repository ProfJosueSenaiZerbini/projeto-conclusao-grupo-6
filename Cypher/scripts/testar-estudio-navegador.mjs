// Ensaio local de interface: npm run build && node scripts/testar-estudio-navegador.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "cypher-estudio-"));
console.log("Preparando ensaio do Estúdio.");
const pausa = ms => new Promise(r => setTimeout(r, ms));
const aguardar = async (fn, msg, limite = 8000) => {
  const fim = Date.now() + limite;
  while (Date.now() < fim) {
    if (await fn()) return;
    await pausa(45);
  }
  throw Error(msg);
};
Object.assign(process.env, {
  NODE_ENV: "test",
  CYPHER_DB_PATH: path.join(pasta, "teste.sqlite"),
  CYPHER_EMAIL_DIR: path.join(pasta, "emails"),
  CYPHER_EMAIL_TRANSPORT: "local",
  CYPHER_MEDIA_DIR: path.join(pasta, "media"),
});
const banco = await import("../dist/src/app/models/bancoDados.js");
const auth = await import("../dist/src/app/models/autenticacaoCypher.js");
banco.inicializarBancoCypher();
const senha = "Senha-Forte-Apenas-No-Ensaio-2026!";
for (const id of ["estudioqa", "estudiomb"]) {
  banco.criarContaCypher({
    id,
    email: id + "@example.test",
    senhaHash: await auth.gerarHashSenha(senha),
    tipoConta: "profissional",
    nome: "Estúdio QA",
    nomePublico: true,
    funcao: "Rapper",
    identificador: "@" + id,
    iniciais: "QA",
    categorias: ["Rapper"],
  });
  banco
    .conexaoInternaCypher()
    .prepare(
      "UPDATE usuarios SET email_confirmado_em=CURRENT_TIMESTAMP WHERE id=?"
    )
    .run(id);
}
banco.fecharBancoCypher();
const reserva = createServer();
await new Promise(r => reserva.listen(0, "127.0.0.1", r));
const porta = reserva.address().port;
await new Promise(r => reserva.close(r));
const url = "http://127.0.0.1:" + porta;
const app = spawn(process.execPath, ["dist/src/aplicacao.js"], {
  windowsHide: true,
  env: { ...process.env, PORT: String(porta), CYPHER_BIND_HOST: "127.0.0.1" },
  stdio: "ignore",
});
const navegador =
  process.env.CYPHER_BROWSER ||
  path.join(
    process.env["ProgramFiles(x86)"] || "C:/Program Files (x86)",
    "Microsoft/Edge/Application/msedge.exe"
  );
const perfil = "/perfil?editar=1&secao=selo";
const fechar = p => {
  if (!p || p.exitCode !== null) return;
  return Promise.race([
    new Promise(r => {
      p.once("exit", r);
      p.kill();
    }),
    pausa(2500),
  ]);
};
const seletor = (a, v) =>
  '[data-acao="' + a + '"]' + (v ? '[data-valor="' + v + '"]' : "");
try {
  await aguardar(async () => {
    try {
      return (await fetch(url + "/entrar")).ok;
    } catch {
      return false;
    }
  }, "Servidor não iniciou.");
  for (const [tema, largura, altura, mobile] of [
    ["dark", 1440, 900, false],
    ["light", 390, 844, true],
  ]) {
    if (process.env.CYPHER_QA_MOBILE === "1" && !mobile) continue;
    console.log("Abrindo Edge " + largura + "x" + altura + " (" + tema + ").");
    const perfilEdge = path.join(pasta, tema);
    const browser = spawn(
      navegador,
      [
        "--headless=new",
        "--remote-debugging-port=0",
        "--disable-gpu",
        "--user-data-dir=" + perfilEdge,
        "--no-first-run",
        "--disable-background-networking",
        "--no-proxy-server",
        "about:blank",
      ],
      { windowsHide: true, stdio: "ignore" }
    );
    let ws;
    try {
      const arq = path.join(perfilEdge, "DevToolsActivePort");
      await aguardar(
        () => fs.existsSync(arq),
        "Não abriu o navegador de teste."
      );
      const dport = fs.readFileSync(arq, "utf8").split("\n")[0].trim();
      const abas = await (
        await fetch("http://127.0.0.1:" + dport + "/json/list")
      ).json();
      ws = new WebSocket(
        abas.find(a => a.type === "page").webSocketDebuggerUrl
      );
      await new Promise((r, j) => {
        ws.addEventListener("open", r, { once: true });
        ws.addEventListener("error", j, { once: true });
      });
      await pausa(900);
      let seq = 0;
      const pend = new Map(),
        erros = [];
      ws.addEventListener("message", e => {
        const d = JSON.parse(e.data);
        if (d.method === "Runtime.exceptionThrown")
          erros.push(
            d.params.exceptionDetails.exception?.description ||
              d.params.exceptionDetails.text
          );
        if (pend.has(d.id)) {
          const f = pend.get(d.id);
          pend.delete(d.id);
          d.error ? f.rejeitar(Error(d.error.message)) : f.resolver(d.result);
        }
      });
      const cmd = (method, params = {}) =>
        new Promise((ok, fail) => {
          const id = ++seq;
          const t = setTimeout(() => {
            pend.delete(id);
            fail(Error("Timeout em " + method));
          }, 15000);
          pend.set(id, {
            resolver: v => {
              clearTimeout(t);
              ok(v);
            },
            rejeitar: e => {
              clearTimeout(t);
              fail(e);
            },
          });
          ws.send(JSON.stringify({ id, method, params }));
        });
      const ev = async expression => {
        const r = await cmd("Runtime.evaluate", {
          expression,
          awaitPromise: true,
          returnByValue: true,
          userGesture: true,
        });
        if (r.exceptionDetails)
          throw Error(
            r.exceptionDetails.exception?.description || r.exceptionDetails.text
          );
        return r.result.value;
      };
      const q = s => "document.querySelector(" + JSON.stringify(s) + ")";
      const wait = (expr, msg) =>
        aguardar(async () => {
          try {
            return await ev(expr);
          } catch {
            return false;
          }
        }, msg);
      const evento = (s, val) =>
        ev(
          "(()=>{const e=" +
            q(s) +
            ";e.value=" +
            JSON.stringify(val) +
            ";e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()"
        );
      const click = async s => {
        await wait(
          "!!" + q(s) + "?.getClientRects().length && !" + q(s) + "?.disabled",
          "Controle indisponível: " + s
        );
        await ev(
          "(()=>{const e=" +
            q(s) +
            ";const r=e.getBoundingClientRect();const alvo=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!e.contains(alvo))e.scrollIntoView({block:'center',behavior:'instant'});})()"
        );
        if (mobile) await pausa(95);
        const pos = await ev(
          "(()=>{const e=" +
            q(s) +
            ";const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;const h=document.elementFromPoint(x,y);return {x,y,ok:e===h||e.contains(h),hit:h?.outerHTML.slice(0,110)};})()"
        );
        assert.ok(pos.ok, "Controle interceptado: " + s + " / " + pos.hit);
        const { x, y } = pos;
        if (mobile) {
          await cmd("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x, y }],
          });
          await cmd("Input.dispatchTouchEvent", {
            type: "touchEnd",
            touchPoints: [],
          });
        } else {
          await cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
          await cmd("Input.dispatchMouseEvent", {
            type: "mousePressed",
            x,
            y,
            button: "left",
            clickCount: 1,
          });
          await cmd("Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x,
            y,
            button: "left",
            clickCount: 1,
          });
        }
      };
      await cmd("Page.enable");
      await cmd("Runtime.enable");
      await cmd("Network.enable");
      await cmd("Network.setBlockedURLs", { urls: ["https://*"] });
      await cmd("Emulation.setDeviceMetricsOverride", {
        width: largura,
        height: altura,
        deviceScaleFactor: 1,
        mobile,
      });
      if (mobile)
        await cmd("Emulation.setTouchEmulationEnabled", {
          enabled: true,
          maxTouchPoints: 1,
        });
      await cmd("Page.navigate", { url: url + "/entrar" });
      await wait(
        "!!document.querySelector('form input[name=password]')",
        "Página de login"
      );
      await ev(
        "localStorage.setItem('cypher-tema'," + JSON.stringify(tema) + ");"
      );
      await ev(
        "(async()=>{const f=document.querySelector('form input[name=password]').form;const d=new URLSearchParams(new FormData(f));d.set('identificador','" +
          (mobile ? "estudiomb" : "estudioqa") +
          "');d.set('password'," +
          JSON.stringify(senha) +
          ");await fetch('/entrar',{method:'POST',body:d});})()"
      );
      await cmd("Page.navigate", { url: url + perfil });
      await wait(
        q(seletor("rascunho")) + " && !" + q(seletor("rascunho")) + ".disabled",
        "Estúdio não carregou"
      );
      assert.equal(
        await ev("document.documentElement.classList.contains('dark')"),
        tema === "dark"
      );
      assert.equal(
        await ev("document.documentElement.scrollWidth<=innerWidth+2"),
        true
      );
      await ev("document.documentElement.classList.toggle('dark')");
      assert.equal(
        await ev("document.documentElement.scrollWidth<=innerWidth+2"),
        true
      );
      await ev("document.documentElement.classList.toggle('dark')");
      console.log("Estúdio carregado no Edge " + largura + "x" + altura);
      const faixaZoom = await ev(`(() => {
        const el = document.querySelector("[data-zoom]");
        const seletor = document.querySelector("[data-fundo-previa]");
        const botao = document.querySelector("[data-acao=centralizar]");
        const comparar = document.querySelector("[data-acao=comparar]");
        const aparecer = getComputedStyle(el).appearance;
        return {
          aparecer,
          foco: el.tabIndex,
          trilha: el.style.getPropertyValue("--cy-range-progresso"),
          alturasIguais: [el, botao, seletor, comparar].every(campo => Math.abs(campo.offsetHeight - el.offsetHeight) <= 1)
        };
      })()`);
      assert.deepEqual(faixaZoom, {
        aparecer: "none",
        foco: 0,
        trilha: "52.941%",
        alturasIguais: true,
      });
      await evento("[data-zoom]", "125");
      await wait(
        "document.querySelector('[data-zoom-valor]').value==='125%'",
        "Zoom não acompanha a faixa"
      );
      assert.equal(
        await ev(
          "document.querySelector('[data-zoom]').style.getPropertyValue('--cy-range-progresso')"
        ),
        "82.353%"
      );
      await click(seletor("centralizar"));
      assert.equal(
        await ev(
          "document.querySelector('[data-zoom]').getAttribute('aria-valuetext')"
        ),
        "100%"
      );
      assert.equal(
        await ev(
          "document.querySelector('[data-zoom]').style.getPropertyValue('--cy-range-progresso')"
        ),
        "52.941%"
      );
      if (!mobile) {
        const metrica = await ev(`(async()=>{
          const b=await import("/js/selo-vetores.js");
          const grid=document.body.appendChild(document.createElement("div"));
          Object.assign(grid.style,{position:"absolute",top:"0",width:"1px",height:"1px",overflow:"hidden",opacity:"0"});
          const caixas=b.vetores.map(v=>{
            const svg=b.miniaturaVetor(v);grid.replaceChildren(svg);
            const z=svg.getBBox();
            return {id:v.id,x:z.x,y:z.y,w:z.width,h:z.height};
          });
          grid.remove();
          const canvas=document.createElement("canvas");canvas.width=16;canvas.height=16;
          const ctx=canvas.getContext("2d");
          const pixel=async id=>{
            const svg=b.miniaturaVetor(b.vetorPorId(id));
            svg.setAttribute("width",16);svg.setAttribute("height",16);
            const i=new Image();
            i.src="data:image/svg+xml,"+encodeURIComponent(new XMLSerializer().serializeToString(svg));
            await i.decode();
            ctx.clearRect(0,0,16,16);ctx.drawImage(i,0,0);return [...ctx.getImageData(0,0,16,16).data].filter((_,i)=>i%4===3).map(x=>x>127);
          };
          const pares=[["disco","vinil-corte"],["microfone","microfone-ondas"],["coroa","coroa-gotica"],["coroa","coroa-muralha"],["corvo","corvo-stencil"],["moldura","moldura-art-deco"],["estrela","estrela-brasa"],["lua","lua-catedral"]];
          const contrastes=[];
          for(const [a,b] of pares){
            const [x,y]=await Promise.all([pixel(a),pixel(b)]);
            contrastes.push([a,b,x.filter((t,i)=>t!==y[i]).length/x.filter((t,i)=>t||y[i]).length]);
          }
          return {caixas,contrastes};
        })()`);
        assert.equal(metrica.caixas.length, 90);
        for (const b of metrica.caixas) {
          assert.ok(
            Math.abs(Math.max(b.w, b.h) - 52) < 0.1,
            b.id + " fora da escala"
          );
          assert.ok(
            Math.abs(b.x + b.w / 2) < 0.1 && Math.abs(b.y + b.h / 2) < 0.1,
            b.id + " fora do centro"
          );
        }
        for (const [a, b, contraste] of metrica.contrastes)
          assert.ok(contraste > 0.16, a + " e " + b + " semelhantes a 16px");
      }
      const irEtapa = async etapa => {
        if (
          (await ev(
            "document.querySelector('[data-selo-estudio]').dataset.etapa"
          )) !== etapa
        )
          await click(seletor("etapa", etapa));
        await wait(
          q(seletor("etapa", etapa)) +
            "?.getAttribute('aria-current')==='step'",
          "Etapa não marcada: " + etapa
        );
      };
      const irFerramenta = async (etapa, cat) => {
        await irEtapa(etapa);
        await click(seletor("categoria", cat));
        await wait(
          q(seletor("categoria", cat)) +
            "?.getAttribute('aria-pressed')==='true'",
          "Ferramenta não selecionada: " + cat
        );
      };
      assert.deepEqual(
        await ev(
          "Array.from(document.querySelectorAll('.se-stepper button'),b=>b.dataset.valor)"
        ),
        ["base", "elementos", "composicao", "acabamento", "revisao"]
      );
      assert.equal(await ev(q(seletor("publicar")) + ".hidden"), true);
      await click(seletor("modelo", "0"));
      await click(seletor("etapa-seguinte", "elementos"));
      await wait(
        "document.activeElement.id==='se-titulo-etapa' && document.activeElement.textContent==='Elementos'",
        "Avanço não focou o título"
      );
      await irFerramenta("elementos", "simbolos");
      const camadaInicial = await ev(
        "document.querySelectorAll('.se-ampliada [data-vetor]').length"
      );
      await click("[data-vetor-escolher]");
      await wait(
        "document.querySelectorAll('.se-ampliada [data-vetor]').length > " +
          camadaInicial,
        "Símbolo não adicionado no modo simples"
      );
      await click(seletor("modo", "avancado"));
      await wait(
        q(seletor("categoria", "simbolos")) +
          ".getAttribute('aria-pressed')==='true'",
        "Modo avançado perdeu a ferramenta"
      );
      await irFerramenta("composicao", "camadas");
      const posicaoCamada = "[data-prop$='.x']";
      await evento(posicaoCamada, 31);
      await irFerramenta("base", "cores");
      const paleta = await ev(
        "document.querySelector('.se-grid [data-acao=paleta][aria-pressed=false]').dataset.valor"
      );
      await click(seletor("paleta", paleta));
      await irEtapa("composicao");
      assert.equal(await ev(q(posicaoCamada) + ".value"), "31");
      await click(seletor("modo", "simples"));
      await wait(
        q(seletor("categoria", "composicao")) +
          "?.getAttribute('aria-pressed')==='true'",
        "Voltando ao modo simples, a etapa foi perdida"
      );
      await click(seletor("modo", "avancado"));
      await click(seletor("reset"));
      await click("#cy-confirm .cy-confirm-submit");
      await irFerramenta("base", "forma");
      const formas = [
        "disco",
        "placa",
        "quadro",
        "orbita",
        "onda",
        "prisma",
        "escudo",
        "gota",
        "bilhete",
      ];
      const amostra = ".se-ampliada .pf-seal";
      const mudancas = await ev(
        "(async()=>{const formas=" +
          JSON.stringify(formas) +
          ", el=document.querySelector('.se-ampliada .pf-seal'), amostras=[];for(let i=0;i<formas.length;i++)for(let j=0;j<formas.length;j++)if(i!==j){document.querySelector('[data-acao=forma][data-valor='+formas[i]+']').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));document.querySelector('[data-acao=forma][data-valor='+formas[j]+']').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));amostras.push([el.dataset.forma,formas[j],el.getBoundingClientRect().width, getComputedStyle(el).transitionDuration]);}return amostras;})()"
      );
      assert.equal(mudancas.length, 72);
      for (const [forma, esperada, w, d] of mudancas) {
        assert.equal(forma, esperada);
        assert.ok(w > 50);
        assert.match(d, /0\.25s/);
      }
      await click(seletor("forma", "gota"));
      await wait(
        q(amostra) + ".dataset.forma==='gota'",
        "Forma Gota não aplicada"
      );
      await irFerramenta("elementos", "letras");
      await evento("[data-prop=monograma]", mobile ? "MB" : "QA");
      await click(seletor("add", "texto"));
      await evento('.se-fields [data-prop$=".curva"]', 24);
      await irFerramenta("composicao", "camadas");
      const camadaTexto = await ev(
        "document.querySelector('.se-ampliada textPath')?.closest('[data-camada]').dataset.camada"
      );
      const posArraste = await ev(
        "(()=>{const el=document.querySelector('.se-ampliada textPath').closest('text');el.scrollIntoView({block:'center',behavior:'instant'});const b=el.getBoundingClientRect();for(let x=b.x+1;x<b.right;x+=2)for(let y=b.y+1;y<b.bottom;y+=2)if(el.contains(document.elementFromPoint(x,y)))return{x,y};return null;})()"
      );
      assert.ok(posArraste, "O texto precisa estar disponível para arrastar");
      const { x: ax, y: ay } = posArraste;
      if (mobile) {
        await cmd("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: ax, y: ay }],
        });
        await cmd("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: ax + 24, y: ay + 8 }],
        });
        await cmd("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else {
        await cmd("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: ax,
          y: ay,
        });
        await cmd("Input.dispatchMouseEvent", {
          type: "mousePressed",
          x: ax,
          y: ay,
          button: "left",
          clickCount: 1,
        });
        await cmd("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: ax + 24,
          y: ay + 8,
          buttons: 1,
        });
        await cmd("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: ax + 24,
          y: ay + 8,
          button: "left",
          clickCount: 1,
        });
      }
      const propX = '.se-propriedades [data-prop$=".x"]';
      await wait(
        q(propX) + "?.valueAsNumber > 50",
        "Arraste não atualizou a coordenada numérica"
      );
      assert.equal(
        await ev(
          "document.querySelector('.se-ampliada textPath').closest('[data-camada]').dataset.camada"
        ),
        camadaTexto
      );
      if (mobile) await pausa(400);
      await click(seletor(mobile ? "undo-mobile" : "undo"));
      await pausa(250);
      assert.equal(
        await ev(q(propX) + "?.valueAsNumber"),
        50,
        JSON.stringify(
          await ev(
            "({x:document.querySelector('.se-propriedades [data-prop$=\".x\"]')?.value,camadas:[...document.querySelectorAll('.se-ampliada [data-camada]')].map(e=>[e.dataset.camada,e.getAttribute('transform')]), undo:document.querySelector('[data-acao=undo]').disabled, redo:document.querySelector('[data-acao=redo]').disabled})"
          )
        )
      );
      const texto = await ev(
        q(amostra) + "?.querySelector('textPath')?.textContent"
      );
      assert.equal(texto, "Seu texto");
      await click(seletor(mobile ? "undo-mobile" : "undo"));
      await wait(
        "!" + q(amostra) + ".querySelector('textPath')",
        "Desfazer curvatura"
      );
      await click(seletor(mobile ? "redo-mobile" : "redo"));
      await wait(
        "!!" + q(amostra) + ".querySelector('textPath')",
        "Refazer curvatura"
      );
      await click(seletor("modo", "simples"));
      await click(seletor("modo", "avancado"));
      assert.equal(
        await ev(q(amostra) + ".querySelector('textPath').textContent"),
        "Seu texto"
      );
      await irFerramenta("elementos", "simbolos");
      const svgBusca = "[data-se-busca]";
      await evento(svgBusca, "LuA GoTiCo");
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        1
      );
      assert.ok(
        await ev(
          "!!document.querySelector('[data-vetor-escolher=lua-catedral] svg path')"
        )
      );
      await evento("select[name=vetor-categoria]", "arte");
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        0
      );
      await evento("select[name=vetor-categoria]", "universo");
      await evento("select[name=vetor-estilo]", "minimalista");
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        0
      );
      await evento("select[name=vetor-estilo]", "");
      await evento("select[name=vetor-categoria]", "");
      await evento(svgBusca, "vinil");
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        2
      );
      await click(
        ".se-vetor-card:has([data-vetor-escolher=vinil-corte]) .se-vetor-variantes"
      );
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        2
      );
      await click("[data-vetor-favorito=vinil-corte]");
      await click("[data-vetor-colecao=favoritos]");
      assert.equal(
        await ev("document.querySelectorAll('[data-vetor-escolher]').length"),
        1
      );
      await click("[data-vetor-escolher=vinil-corte]");
      await click('[data-vetor-colecao=""]');
      await click("[data-vetor-escolher=disco]");
      await wait(
        "!!document.querySelector('.se-ampliada [data-vetor=vinil-corte] path') && !!document.querySelector('.se-ampliada [data-vetor=disco] path')",
        "Vetores não chegaram às camadas"
      );
      assert.notEqual(
        await ev(
          "document.querySelector('.se-ampliada [data-vetor=vinil-corte] path').getAttribute('d')"
        ),
        await ev(
          "document.querySelector('.se-ampliada [data-vetor=disco] path').getAttribute('d')"
        )
      );
      assert.equal(
        await ev(
          "document.querySelector('[data-vetor-escolher=disco] path').getAttribute('d')"
        ),
        await ev(
          "document.querySelector('.se-ampliada [data-vetor=disco] path').getAttribute('d')"
        )
      );
      await click(".se-vetor-ajustes summary");
      await evento('[data-prop$=".trama"]', "grade");
      await evento('[data-prop$=".acabamentoVetor"]', "metal");
      await wait(
        "document.querySelector('.se-ampliada [data-vetor=disco]')?.children.length===3",
        "Textura ou acabamento não chegou ao vetor"
      );
      assert.equal(
        await ev(
          "document.querySelector('.se-ampliada [data-vetor=vinil-corte]').children.length"
        ),
        1
      );
      await click("[data-vetor-escolher=disco]");
      await click(".se-vetor-ajustes summary");
      await evento('[data-prop$=".trama"]', "pontos");
      await evento('[data-prop$=".acabamentoVetor"]', "carimbo");
      await click('[data-prop$=".flip"]');
      await evento('[data-prop$=".rotacao"]', 23);
      const camadaVinil =
        "Array.from(document.querySelectorAll('.se-ampliada [data-vetor=disco]'),v=>({id:v.parentElement.dataset.camada,refs:[...v.querySelectorAll('path[fill^=url]')].map(p=>p.getAttribute('fill')),t:v.parentElement.getAttribute('transform')}))";
      await wait(
        camadaVinil + ".filter(v=>v.refs.length===2).length===2",
        "As duas cópias do vinil não mantiveram efeitos próprios"
      );
      await wait(
        camadaVinil +
          ".some(v=>v.t.includes('rotate(23)') && v.t.includes('scale(-1 1)'))",
        "Espelhamento e rotação não chegaram à cópia"
      );
      const copias = await ev(camadaVinil);
      assert.notEqual(copias[0].id, copias[1].id);
      await click(seletor("trocar-vetor"));
      await click("[data-vetor-escolher=vinil-corte]");
      const troca =
        ".se-ampliada [data-camada=" +
        JSON.stringify(copias[1].id) +
        "] [data-vetor=vinil-corte]";
      await wait("!!" + q(troca), "Trocar desenho perdeu a camada original");
      assert.equal(
        await ev(q(troca) + ".parentElement.getAttribute('transform')"),
        copias[1].t
      );
      assert.equal(
        await ev(q(troca) + ".querySelectorAll('path[fill^=url]').length"),
        2
      );
      await click(".se-vetor-ajustes summary");
      await click(seletor("trocar-vetor"));
      await click("[data-vetor-escolher=disco]");
      await wait(
        camadaVinil + ".length===2",
        "A segunda troca alterou a quantidade de camadas"
      );
      assert.equal(new Set(copias.flatMap(c => c.refs)).size, 4);
      assert.match(copias[1].t, /rotate\(23\).*scale\(-1 1\)/);
      await irFerramenta("composicao", "camadas");
      await click(seletor("descer"));
      await wait(
        camadaVinil + "[0].id===" + JSON.stringify(copias[1].id),
        "A posição das duas camadas não trocou"
      );
      await irFerramenta("elementos", "simbolos");
      await click("[data-vetor-colecao=recentes]");
      assert.equal(
        await ev(
          "document.querySelector('[data-vetor-escolher]').dataset.vetorEscolher"
        ),
        "disco"
      );
      await click(seletor("rascunho"));
      await wait(
        q(".se-status") + ".textContent.includes('Rascunho salvo')",
        "Rascunho não salvou"
      );
      await cmd("Page.navigate", { url: url + perfil });
      await wait(
        q(".se-status") + "?.textContent.includes('Rascunho recuperado')",
        "Rascunho não recuperado"
      );
      await wait(
        q(amostra) + ".querySelector('textPath')?.textContent === 'Seu texto'",
        "A prévia não recuperou a camada de texto"
      );
      await wait(
        camadaVinil + ".filter(v=>v.refs.length===2).length===2",
        "Os efeitos não voltaram com o rascunho"
      );
      const camadasReabertas = await ev(camadaVinil);
      assert.deepEqual(
        camadasReabertas.map(v => v.id),
        [copias[1].id, copias[0].id]
      );
      assert.equal(new Set(camadasReabertas.flatMap(c => c.refs)).size, 4);
      await irFerramenta("elementos", "simbolos");
      await click("[data-vetor-colecao=favoritos]");
      assert.ok(
        await ev(
          "!!document.querySelector('[data-vetor-escolher=vinil-corte] svg path')"
        )
      );
      await click("[data-vetor-colecao=recentes]");
      assert.equal(
        await ev(
          "document.querySelector('[data-vetor-escolher]').dataset.vetorEscolher"
        ),
        "disco"
      );
      if (mobile) {
        await cmd("Emulation.setDeviceMetricsOverride", {
          width: 320,
          height: 740,
          deviceScaleFactor: 1,
          mobile: true,
        });
        await click(seletor("modo", "avancado"));
        await irFerramenta("composicao", "camadas");
        await click("[data-acao=camada]");
        assert.equal(
          await ev("document.documentElement.scrollWidth <= innerWidth + 2"),
          true
        );
        await ev(
          "document.querySelector('.se-layer-options input:not(:disabled)').focus()"
        );
        for (let i = 0; i < 8; i++) {
          await cmd("Input.dispatchKeyEvent", {
            type: "keyDown",
            key: "Tab",
            code: "Tab",
            windowsVirtualKeyCode: 9,
          });
          await cmd("Input.dispatchKeyEvent", {
            type: "keyUp",
            key: "Tab",
            code: "Tab",
            windowsVirtualKeyCode: 9,
          });
          await pausa(60);
          assert.equal(
            await ev(
              "(()=>{const a=document.activeElement,r=a.getBoundingClientRect();return a.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})()"
            ),
            true,
            "Foco oculto a 320px"
          );
        }
        await click(seletor("ir-etapas"));
        await wait(
          "document.activeElement.getAttribute('aria-current') === 'step'",
          "Atalho de etapas não voltou ao menu"
        );
        await cmd("Emulation.setDeviceMetricsOverride", {
          width: largura,
          height: altura,
          deviceScaleFactor: 1,
          mobile: true,
        });
      }
      await irEtapa("revisao");
      await click(seletor("conferir-previa"));
      await wait(
        "document.activeElement.id==='se-previa'",
        "Conferir prévia não moveu o foco"
      );
      await pausa(450);
      if (mobile) {
        await click(seletor("voltar-edicao"));
        await wait(
          "document.activeElement.id==='se-titulo-etapa'",
          "Não retornou à edição"
        );
        await pausa(450);
      }
      await ev("document.querySelector('.se-amostras').open=true");
      await wait(
        "document.querySelectorAll('.se-sizes svg').length===5",
        "A revisão não exibiu os cinco tamanhos"
      );
      await click(seletor("publicar"));
      await click("#cy-confirm .cy-confirm-submit");
      await wait(
        "location.search.includes('selo=salvo') && !!document.querySelector('.pf-seal-reveal')",
        "Publicação não confirmou"
      );
      await cmd("Page.navigate", { url: url + "/perfil" });
      await wait(
        "!!document.querySelector('[data-seal-public] svg')",
        "Não renderizou o selo publicado"
      );
      const posicaoSelo =
        "(()=>{const box=s=>document.querySelector(s).getBoundingClientRect();const selo=box('.pf-selo-assinatura'), capa=box('.pf-cover'), assinatura=box('.pf-signature'), arte=box('.pf-selo-suporte > [data-seal-public]');return {unico:document.querySelectorAll('.pf-cover .pf-selo-assinatura').length===1,dentro:selo.left>=capa.left&&selo.right<=capa.right&&selo.top>=capa.top&&selo.bottom<=capa.bottom, direita:selo.left>assinatura.right, abaixo:selo.top>assinatura.bottom,legivel:arte.width>=42,semExcesso:document.documentElement.scrollWidth<=innerWidth+2};})()";
      assert.deepEqual(await ev(posicaoSelo), {
        unico: true,
        dentro: true,
        direita: !mobile,
        abaixo: mobile,
        legivel: true,
        semExcesso: true,
      });
      if (mobile) {
        await cmd("Emulation.setDeviceMetricsOverride", {
          width: 320,
          height: 740,
          deviceScaleFactor: 1,
          mobile: true,
        });
        assert.deepEqual(await ev(posicaoSelo), {
          unico: true,
          dentro: true,
          direita: false,
          abaixo: true,
          legivel: true,
          semExcesso: true,
        });
      }
      assert.doesNotMatch(
        await ev(q("[data-seal-public] svg") + ".textContent"),
        /Seu texto/
      );
      assert.match(
        await ev(q("[data-seal-public] svg") + ".textContent"),
        mobile ? /MB/ : /QA/
      );
      assert.ok(
        await ev(
          "!!document.querySelector('[data-seal-public] [data-vetor=vinil-corte] path')"
        )
      );
      assert.equal(
        await ev(
          "document.querySelector('[data-seal-public] [data-vetor=disco]')?.children.length"
        ),
        3
      );
      const camadasPublicas = await ev(
        camadaVinil.replace(".se-ampliada", "[data-seal-public]")
      );
      assert.deepEqual(
        camadasPublicas.map(v => v.id),
        [copias[1].id, copias[0].id]
      );
      assert.equal(new Set(camadasPublicas.flatMap(c => c.refs)).size, 4);
      assert.equal(
        await ev(
          "document.querySelector('.pf-actions > [data-share-profile]')?.tagName"
        ),
        "BUTTON"
      );
      assert.equal(
        await ev(
          "!!document.querySelector('.pf-menu [data-share-profile], [data-copy-profile]')"
        ),
        false
      );
      await ev(
        `Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{window.__qaShare=d}})`
      );
      await click("[data-share-profile]");
      await wait(
        "window.__qaShare?.url.includes('/artistas/') && document.querySelector('[data-share-label]').textContent==='Compartilhado'",
        "Compartilhamento nativo não recebeu a URL"
      );
      await ev(
        `Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async u=>{window.__qaCopiado=u}}})`
      );
      await click("[data-share-profile]");
      await wait(
        "window.__qaCopiado===window.__qaShare.url && document.querySelector('[data-share-label]').textContent==='Link copiado'",
        "Não confirmou a cópia do link"
      );
      await ev(
        `Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})`
      );
      await click("[data-share-profile]");
      await wait(
        "document.querySelector('[data-share-dialog]').open && document.querySelector('[data-share-url]').value===window.__qaShare.url",
        "Não ofereceu o endereço como alternativa"
      );
      await click("[data-share-dialog] button");
      await cmd("Page.navigate", {
        url: url + "/perfil?editar=1&secao=pessoal",
      });
      await wait(
        "!!document.querySelector('[data-perfil-imagens] [data-pi-campo=capa]')",
        "Campos de foto/capa não carregaram"
      );
      assert.equal(
        await ev(
          "!!document.querySelector('[data-perfil-imagens] [name=autorizacao]')"
        ),
        false
      );
      const imagemTeste = (tipo, arrastar = false) =>
        ev(
          `(async()=>{const c=document.createElement('canvas');c.width=420;c.height=300;const x=c.getContext('2d');x.fillStyle='#d64130';x.fillRect(0,0,210,300);x.fillStyle='#124a86';x.fillRect(210,0,210,300);const b=await new Promise(r=>c.toBlob(r,'image/png'));const d=new DataTransfer();d.items.add(new File([b],'quadros.png',{type:'image/png'}));const card=document.querySelector('[data-pi-campo=${tipo}]');if(${arrastar}){card.querySelector('[data-pi-escolher]').dispatchEvent(new DragEvent('drop',{dataTransfer:d,bubbles:true,cancelable:true}));}else{const i=card.querySelector('input[type=file]');i.files=d.files;i.dispatchEvent(new Event('change',{bubbles:true}));}})()`
        );
      await evento("[data-profile-bio]", "Biografia ainda não salva.");
      for (const [tipo, w, h] of [
        ["imagem", 640, 640],
        ["capa", 1600, 600],
      ]) {
        await imagemTeste(tipo, !mobile && tipo === "capa");
        await wait(
          "document.querySelector('.pi-dialog').open",
          "O recorte não abriu: " + tipo
        );
        const ponto = (x, y) =>
          "(()=>{const c=document.querySelector('[data-pi-recorte]');return c.getContext('2d').getImageData(" +
          x +
          "," +
          y +
          ",1,1).data[0]})()";
        const antes = await ev(ponto(w * 0.7, h * 0.27));
        await click('[data-pi-girar="1"]');
        assert.notEqual(await ev(ponto(w * 0.7, h * 0.27)), antes);
        assert.equal(
          await ev(
            "getComputedStyle(document.querySelector('.pi-ajustes input[type=range]')).appearance"
          ),
          "none"
        );
        await click('[data-pi-zoom="1"]');
        assert.equal(
          await ev(
            "document.querySelector('.pi-ajustes input[type=range]').style.getPropertyValue('--cy-range-progresso')"
          ),
          "7.500%"
        );
        await wait(
          "document.querySelector('[data-pi-ampliacao]').value==='115%'",
          "Ampliação não atualizou o indicador"
        );
        await evento(".pi-ajustes input[type=range]", "1.35");
        await click("[data-pi-salvar]");
        await wait(
          `!document.querySelector('.pi-dialog').open && document.querySelector('[data-pi-campo=${tipo}] img').naturalWidth===${w} && document.querySelector('[data-pi-campo=${tipo}] img').naturalHeight===${h}`,
          "Imagem não salva: " + tipo
        );
      }
      assert.equal(
        await ev("document.querySelector('[data-profile-bio]').value"),
        "Biografia ainda não salva."
      );
      await cmd("Page.navigate", { url: url + "/perfil" });
      await click("[data-cp-abrir]");
      await wait(
        "document.querySelector('.cp-dialog').open && document.querySelector('[data-cp-campo] input[name=valor]')?.placeholder.includes('Campinas')",
        "Assistente não exibiu somente a localização pendente"
      );
      assert.ok(await ev("document.querySelector('[data-cp-foto]').hidden"));
      assert.ok(await ev("location.pathname==='/perfil' && !location.search"));
      await evento("[data-cp-campo] input[name=valor]", "Campinas");
      await click("[data-cp-salvar]");
      await wait(
        "document.querySelector('[data-cp-estado]').textContent.includes('Cidade, UF')",
        "Não validou a UF"
      );
      await evento("[data-cp-campo] input[name=valor]", "Campinas, SP");
      await click("[data-cp-salvar]");
      await wait(
        "!!document.querySelector('[data-cp-campo] textarea')",
        "Não avançou para biografia"
      );
      await evento("[data-cp-campo] textarea", "Artista da cena independente.");
      await click("[data-cp-salvar]");
      await wait(
        "document.querySelector('[data-cp-campo] select')?.options.length>1",
        "Não avançou para atuação"
      );
      await ev(
        "(()=>{const s=document.querySelector('[data-cp-campo] select');s.selectedIndex=1;})()"
      );
      await click("[data-cp-salvar]");
      await wait(
        "document.querySelector('[data-cp-pergunta]').textContent.includes('competências')",
        "Não avançou para competências"
      );
      await evento("[data-cp-campo] textarea", "Produção musical");
      await click("[data-cp-salvar]");
      await wait(
        "!!document.querySelector('[data-cp-campo] .cp-escolhas input')",
        "Não avançou para estilos"
      );
      await click("[data-cp-campo] .cp-escolhas label");
      await click("[data-cp-salvar]");
      await wait(
        "document.querySelector('[data-cp-pergunta]').textContent.includes('contato')",
        "Não avançou para contato"
      );
      await evento("[data-cp-campo] input", "contato@exemplo.test");
      await click("[data-cp-salvar]");
      await wait(
        "document.querySelector('[data-cp-pergunta]').textContent==='Perfil completo' && document.querySelector('[data-cp-abrir]').hidden",
        "Não escondeu o CTA ao concluir"
      );
      await click("[data-cp-concluir]");
      await wait(
        "document.querySelector('[data-completar-perfil]').hidden",
        "Assistente não desapareceu"
      );
      await cmd("Page.navigate", { url: url + "/descoberta" });
      await wait(
        "location.pathname==='/descoberta' && document.readyState==='complete'",
        "Descoberta não carregou"
      );
      assert.equal(
        await ev("!!document.querySelector('[data-cp-abrir]')"),
        false
      );
      assert.deepEqual(erros, []);
      console.log(
        "OK: Edge " +
          largura +
          "×" +
          altura +
          " · " +
          tema +
          " · etapas, troca de modo, 72 trocas de forma, acervo vetorial, camadas, rascunho e publicação."
      );
    } finally {
      ws?.close();
      await fechar(browser);
    }
  }
} finally {
  await fechar(app);
  await pausa(350);
  try {
    const resolvida = fs.realpathSync(pasta);
    if (
      path.dirname(resolvida) === fs.realpathSync(os.tmpdir()) &&
      path.basename(resolvida).startsWith("cypher-estudio-")
    )
      fs.rmSync(resolvida, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

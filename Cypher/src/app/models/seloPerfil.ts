import { randomUUID } from "node:crypto";
import { conexaoInternaCypher, criarNotificacaoCypher } from "./bancoDados.js";
import { exigirContaInteracao, ErroInteracao } from "./interacoesConteudo.js";
import { objetoDisponivel, objetoSobMedida } from "./politicasModeracao.js";
import { detectarMidia } from "./projetosTrabalho.js";
import { imagemSeloValida } from "./validarImagemSelo.js";
import { coresSelo, formasSelo, simbolosSelo, lerComposicao, validarComposicao } from "./composicaoSelo.js";
export { coresSelo, formasSelo, simbolosSelo } from "./composicaoSelo.js";

type Selo = {
  id: string;
  letras: string;
  forma: string;
  cor: string;
  simbolo: string;
  imagem: string | null;
  composicao_json: string | null;
};
export function seloPerfil(titular: string) {
  const db = conexaoInternaCypher();
  const selo = db
    .prepare(
      `SELECT s.id,s.letras,s.forma,s.cor,s.simbolo,s.composicao_json,
        CASE WHEN p.id IS NOT NULL THEN '/selos/imagem/' || p.id END imagem
        FROM selos_perfil s LEFT JOIN pedidos_selo_externo p ON p.selo_id=s.id
        WHERE s.autor_id=? AND s.retirado_em IS NULL`
    )
    .get(titular) as Selo | undefined;
  return selo && !objetoSobMedida(db, "selo", selo.id) ? selo : null;
}

export function salvarSeloPerfil(ator: string, dados: Record<string, unknown>) {
  exigirContaInteracao(ator);
  const db = conexaoInternaCypher();
  if (
    !db
      .prepare(
        "SELECT 1 FROM usuarios WHERE id=? AND tipo_conta='profissional'"
      )
      .get(ator)
  )
    throw new ErroInteracao("O selo pertence a uma conta profissional.", 403);
  const retirar = dados.acao === "retirar";
  const letras = String(dados.letras ?? "")
    .trim()
    .toLocaleUpperCase("pt-BR")
    .normalize("NFC");
  const forma = String(dados.forma ?? "orbita"),
    cor = String(dados.cor ?? "oliva"),
    simbolo = String(dados.simbolo ?? "pulso");
  if (
    !retirar &&
    (!/^[\p{L}0-9]{1,3}$/u.test(letras) ||
      !Object.hasOwn(formasSelo, forma) ||
      !Object.hasOwn(coresSelo, cor) ||
      !Object.hasOwn(simbolosSelo, simbolo))
  )
    throw new ErroInteracao(
      "Escolha uma composição, uma cor, um símbolo e até três letras ou números para sua assinatura."
    );
  db.transaction(() => {
    const ativo = seloPerfil(ator);
    if (
      !retirar &&
      ativo?.letras === letras &&
      ativo.forma === forma &&
      ativo.cor === cor &&
      ativo.simbolo === simbolo
    )
      return;
    const agora = Date.now();
    db.prepare(
      "UPDATE selos_perfil SET retirado_em=? WHERE autor_id=? AND retirado_em IS NULL"
    ).run(agora, ator);
    if (!retirar)
      db.prepare(
        "INSERT INTO selos_perfil(id,autor_id,letras,forma,cor,simbolo,criado_em) VALUES(?,?,?,?,?,?,?)"
      ).run(randomUUID(), ator, letras, forma, cor, simbolo, agora);
  }).immediate();
}

function bancoEstudio(ator: string) {
  exigirContaInteracao(ator);
  const db = conexaoInternaCypher();
  if (!db.prepare("SELECT 1 FROM usuarios WHERE id=? AND tipo_conta='profissional'").get(ator))
    throw new ErroInteracao("O estúdio é exclusivo para contas profissionais.", 403);
  return db;
}

export function carregarEstudio(ator: string) {
  const db = bancoEstudio(ator);
  const rascunho = db.prepare("SELECT composicao_json FROM rascunhos_selo_perfil WHERE autor_id=?")
    .get(ator) as { composicao_json: string } | undefined;
  const versoes = db.prepare(`SELECT s.id,s.letras,s.forma,s.cor,s.simbolo,s.composicao_json,s.criado_em,s.retirado_em
    FROM selos_perfil s WHERE s.autor_id=? AND NOT EXISTS
    (SELECT 1 FROM pedidos_selo_externo p WHERE p.selo_id=s.id)
    ORDER BY s.criado_em DESC,s.rowid DESC LIMIT 25`).all(ator) as
      (Selo & { criado_em: number; retirado_em: number | null })[];
  const imagens = (db.prepare(`SELECT id,justificativa,estado,selo_id FROM pedidos_selo_externo
    WHERE autor_id=? AND estado IN ('aprovado','pendente') ORDER BY criado_em DESC LIMIT 40`)
    .all(ator) as {id:string; justificativa:string; estado:string; selo_id:string|null}[])
    .filter(i=>!i.selo_id || !objetoSobMedida(db,"selo",i.selo_id))
    .map(({selo_id,...i})=>i);
  return { imagens, rascunho: lerComposicao(rascunho?.composicao_json || null),
    versoes: versoes.filter(v => !objetoSobMedida(db, "selo", v.id)).map(({composicao_json, ...v}) =>
      ({...v, composicao: lerComposicao(composicao_json)})) };
}

export function gravarEstudio(ator: string, acao: unknown, dados: unknown) {
  const db = bancoEstudio(ator);
  if (acao !== "rascunho" && acao !== "publicar") throw new ErroInteracao("Ação inválida.");
  const composicao = validarComposicao(dados, acao === "publicar");
  const ids = [...new Set(composicao.camadas.filter(l=>l.tipo==="imagem").map(l=>l.valor))];
  const consulta = db.prepare("SELECT estado,selo_id FROM pedidos_selo_externo WHERE id=? AND autor_id=?");
  for (const id of ids) {
    const p = consulta.get(id,ator) as {estado:string; selo_id:string|null} | undefined;
    if (!p || (p.estado !== "aprovado" && (acao === "publicar" || p.estado !== "pendente"))
      || (p.selo_id && objetoSobMedida(db,"selo",p.selo_id)))
      throw new ErroInteracao("Há uma marca indisponível ou ainda não aprovada na composição.", 422);
  }
  const json = JSON.stringify(composicao);
  const agora = Date.now();
  if (acao === "rascunho") {
    db.prepare(`INSERT INTO rascunhos_selo_perfil(autor_id,composicao_json,atualizado_em) VALUES(?,?,?)
      ON CONFLICT(autor_id) DO UPDATE SET composicao_json=excluded.composicao_json, atualizado_em=excluded.atualizado_em`)
      .run(ator, json, agora);
    return;
  }
  db.transaction(() => {
    const ativo = seloPerfil(ator);
    if (ativo?.composicao_json !== json) {
      db.prepare("UPDATE selos_perfil SET retirado_em=? WHERE autor_id=? AND retirado_em IS NULL").run(agora, ator);
      const letras = composicao.camadas.find(l => l.tipo === "letras" && l.mostrar && l.compacta && l.opacidade > 0)?.valor ?? "";
      const id = randomUUID();
      db.prepare(`INSERT INTO selos_perfil(id,autor_id,letras,forma,cor,simbolo,criado_em,composicao_json)
        VALUES(?,?,?,?,?,'nenhum',?,?)`).run(id, ator, letras, composicao.forma, composicao.paleta, agora, json);
      const adicionar = db.prepare("INSERT INTO recursos_selo_perfil(selo_id,pedido_id) VALUES(?,?)");
      const publicas = new Set(composicao.camadas.filter(l=>l.tipo === "imagem" && l.mostrar && l.compacta && l.opacidade > 0).map(l=>l.valor));
      for (const recurso of publicas) adicionar.run(id,recurso);
    }
    db.prepare("DELETE FROM rascunhos_selo_perfil WHERE autor_id=?").run(ator);
  }).immediate();
}

export function pedidosSelo(ator?: string) {
  return conexaoInternaCypher()
    .prepare(
      `
    SELECT s.id,s.estado,s.objetivo,s.justificativa,s.criado_em,s.motivo,p.nome AS titular
    FROM pedidos_selo_externo s LEFT JOIN perfis p ON p.usuario_id=s.autor_id
    WHERE ${ator === undefined ? "s.estado='pendente'" : "s.autor_id=?"}
    ORDER BY s.criado_em DESC,s.id LIMIT 100
  `
    )
    .all(...(ator === undefined ? [] : [ator])) as {
    id: string;
    estado: string;
    objetivo: "selo" | "camada";
    justificativa: string;
    criado_em: number;
    motivo: string | null;
    titular: string;
  }[];
}
export function pedirSelo(ator: string, dados: Record<string, unknown>) {
  exigirContaInteracao(ator);
  const db = conexaoInternaCypher();
  if (
    !db
      .prepare(
        "SELECT 1 FROM usuarios WHERE id=? AND tipo_conta='profissional'"
      )
      .get(ator)
  )
    throw new ErroInteracao("O selo pertence a uma conta profissional.", 403);
  const justificativa =
    typeof dados.justificativa === "string" ? dados.justificativa.trim() : "";
  if (
    dados.direitos !== "sim" ||
    justificativa.length < 10 ||
    justificativa.length > 1500
  )
    throw new ErroInteracao(
      "Descreva a marca e confirme que você tem autorização para utilizá-la."
    );
  const valor =
    typeof dados.imagem === "string" && dados.imagem.length <= 90000
      ? dados.imagem
      : "";
  const formato = /^data:image\/(png|jpeg);base64,([a-zA-Z0-9+/]+={0,2})$/.exec(
    valor
  );
  if (!formato)
    throw new ErroInteracao("Envie uma imagem PNG ou JPEG de até 64 KB.");
  const imagem = Buffer.from(formato[2], "base64");
  let mime: string | undefined;
  try {
    mime = detectarMidia(imagem);
  } catch {
    throw new ErroInteracao("A imagem é inválida.");
  }
  if (imagem.length > 65536 || mime !== "image/" + formato[1])
    throw new ErroInteracao("Envie uma imagem PNG ou JPEG de até 64 KB.");
  if (!imagemSeloValida(imagem,mime))
    throw new ErroInteracao("A imagem é inválida ou excede 2.048 × 2.048 px.");
  const objetivo = dados.objetivo === "camada" ? "camada" : "selo";
  const id = randomUUID();
  const r = db.transaction(() => {
    const quantidade = db.prepare("SELECT count(*) AS n FROM pedidos_selo_externo WHERE autor_id=? AND objetivo='camada' AND estado IN ('pendente','aprovado')")
      .get(ator) as { n: number };
    if (objetivo === "camada" && quantidade.n >= 20) throw new ErroInteracao("Você atingiu o limite de marcas no estúdio.", 409);
    return db.prepare(`INSERT INTO pedidos_selo_externo(id,autor_id,imagem,mime,justificativa,estado,criado_em,objetivo)
      VALUES(?,?,?,?,?,'pendente',?,?) ON CONFLICT DO NOTHING`)
      .run(id, ator, imagem, mime, justificativa, Date.now(), objetivo);
  }).immediate();
  if (!r.changes)
    throw new ErroInteracao("Já existe uma solicitação em análise.", 409);
  return id;
}
export function decidirSelo(
  ator: string,
  id: string,
  dados: Record<string, unknown>
) {
  const acao = dados.acao;
  const motivo = typeof dados.motivo === "string" ? dados.motivo.trim() : "";
  if (
    (acao !== "aprovado" && acao !== "recusado") ||
    motivo.length < 10 ||
    motivo.length > 1500
  )
    throw new ErroInteracao("Informe a decisão e sua justificativa.");
  const db = conexaoInternaCypher();
  db.transaction(() => {
    const pedido = db
      .prepare(
        "SELECT autor_id,objetivo FROM pedidos_selo_externo WHERE id=? AND estado='pendente'"
      )
      .get(id) as { autor_id: string; objetivo: string } | undefined;
    if (!pedido) throw new ErroInteracao("Solicitação indisponível.", 404);
    const agora = Date.now();
    const selo = acao === "aprovado" && pedido.objetivo === "selo" ? randomUUID() : null;
    if (selo) {
      if (!objetoDisponivel(db, "perfil", pedido.autor_id, pedido.autor_id))
        throw new ErroInteracao(
          "O perfil está indisponível para ativar o selo.",
          409
        );
      db.prepare(
        "UPDATE selos_perfil SET retirado_em=? WHERE autor_id=? AND retirado_em IS NULL"
      ).run(agora, pedido.autor_id);
      db.prepare(
        "INSERT INTO selos_perfil(id,autor_id,letras,forma,cor,criado_em) VALUES(?,?,'','disco','oliva',?)"
      ).run(selo, pedido.autor_id, agora);
    }
    db.prepare(
      "UPDATE pedidos_selo_externo SET estado=?,motivo=?,decidido_em=?,revisor_id=?,selo_id=? WHERE id=?"
    ).run(acao, motivo, agora, ator, selo, id);
    criarNotificacaoCypher({
      usuarioDestinoId: pedido.autor_id,
      tipo: "selo_decisao",
      titulo: "Decisão sobre seu selo profissional",
      mensagem: "Consulte a decisão e a justificativa.",
      url: "/selos/solicitacoes",
      entidadeTipo: "selo",
      entidadeId: id,
      chaveOrigem: "selo-decisao:" + id,
    });
  }).immediate();
}
export function imagemSelo(ator: string, id: string, revisor: boolean) {
  const db = conexaoInternaCypher();
  const pedido = db
    .prepare(
      `
    SELECT p.autor_id,p.imagem,p.mime,p.selo_id,p.estado,s.retirado_em
    FROM pedidos_selo_externo p LEFT JOIN selos_perfil s ON s.id=p.selo_id WHERE p.id=?
  `
    )
    .get(id) as
    | {
        autor_id: string;
        imagem: Buffer;
        mime: string;
        selo_id: string | null;
        estado: string;
        retirado_em: number | null;
      }
    | undefined;
  const seloComRecurso = pedido?.estado === "aprovado" && db.prepare(`SELECT s.id FROM recursos_selo_perfil r
    JOIN selos_perfil s ON s.id=r.selo_id WHERE r.pedido_id=? AND s.autor_id=? AND s.retirado_em IS NULL`)
    .get(id, pedido.autor_id) as {id:string} | undefined | false;
  if (
    !pedido ||
    !(
      revisor ||
      pedido.autor_id === ator ||
      (pedido.estado === "aprovado" &&
        (!pedido.selo_id || !objetoSobMedida(db, "selo", pedido.selo_id)) &&
        ((pedido.selo_id && !pedido.retirado_em) || (seloComRecurso && !objetoSobMedida(db,"selo",seloComRecurso.id))) &&
        objetoDisponivel(db, "perfil", pedido.autor_id, ator))
    )
  )
    throw new ErroInteracao("Imagem indisponível.", 404);
  return pedido;
}

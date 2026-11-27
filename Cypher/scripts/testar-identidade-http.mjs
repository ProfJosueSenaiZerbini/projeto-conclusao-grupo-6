import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {baseSelo, converterSelo, criarHistorico, modeloSelo, modelos, novaCamada} from '../public/js/selo-estado.js';

const pasta=fs.mkdtempSync(path.join(os.tmpdir(),'cypher-identidade-http-'));
const arquivo=path.join(pasta,'cypher.sqlite');const caixa=path.join(pasta,'emails');
process.env.CYPHER_DB_PATH=arquivo;process.env.NODE_ENV='test';
const b=await import('../dist/src/app/models/bancoDados.js');
const adm=await import('../dist/src/app/models/administracao.js');
const val=await import('../dist/src/app/validators/validarIdentidade.js');
assert.equal(val.idadeNaData('2008-11-16','2026-11-16'),18);
assert.equal(val.idadeNaData('2008-11-17','2026-11-16'),17);
assert.equal(val.idadeNaData('2008-02-29','2026-02-28'),17);
assert.equal(val.idadeNaData('2008-02-29','2026-03-01'),18);
assert.ok(val.validarNascimento('2025-02-29'));assert.ok(val.validarNascimento('2099-01-01'));
assert.equal(val.validarIdentificador('@Nome.Com_Ponto'),null);assert.ok(val.validarIdentificador('nome-com-hifen'));assert.ok(val.validarIdentificador('a'.repeat(25)));assert.ok(val.validarIdentificador('admin'));
b.inicializarBancoCypher();const senha='SenhaForteDeTeste2026';
const superId=await adm.criarAdministrador({nome:'Equipe de teste',email:'super@teste.local',senha,papel:'super_admin'});
await adm.criarAdministrador({nome:'Moderação',email:'mod@teste.local',senha,papel:'moderador'},superId);
await adm.criarAdministrador({nome:'Editor',email:'editor@teste.local',senha,papel:'editor'},superId);
b.fecharBancoCypher();
const reserva=createServer();await new Promise(resolve=>reserva.listen(0,'127.0.0.1',resolve));const porta=reserva.address().port;await new Promise(resolve=>reserva.close(resolve));
const base=`http://127.0.0.1:${porta}`;
const processo=spawn(process.execPath,['dist/src/aplicacao.js'],{cwd:process.cwd(),env:{...process.env,PORT:String(porta),CYPHER_EMAIL_DIR:caixa},windowsHide:true,stdio:['ignore','pipe','pipe']});
let log='';processo.stdout.on('data',d=>log+=d);processo.stderr.on('data',d=>log+=d);const fim=new Promise(resolve=>processo.once('exit',resolve));
let db;
try{
  let pagina;for(let n=0;n<80;n++){try{const r=await fetch(`${base}/cadastro`);if(r.ok){pagina=r;break;}if(r.status===500){log+=await r.text();break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}assert.ok(pagina,log);
  const inicial=await pagina.text();assert.match(inicial,/value="consumidor"/);assert.match(inicial,/passwordConfirmation/);assert.doesNotMatch(inicial,/data-resposta-atuacao="(?:etapaProjetos|participacaoColetiva|atividadePratica)"/);
  assert.doesNotMatch(inicial, /name="(?:possuiVulgo|visibilidadesAtuacoesJson)"/);
  assert.match(inicial, /name="nomePublico"/);
  const csrf=pagina.headers.getSetCookie().find(c=>c.startsWith('cypher_csrf='))?.split(';')[0];const tokenCSRF=csrf.slice('cypher_csrf='.length);
  const params=body=>{const p=new URLSearchParams();for(const [k,v]of Object.entries(body))for(const item of Array.isArray(v)?v:[v])p.append(k,String(item));return p;};
  const req=(rota,{method='GET',cookie='',body}={})=>fetch(`${base}${rota}`,{method,redirect:'manual',headers:{cookie:[cookie,csrf].filter(Boolean).join('; '),...(method==='POST'?{'content-type':'application/x-www-form-urlencoded','x-csrf-token':tokenCSRF}:{})},body:body?params(body):undefined});
  const post=(rota,body,cookie='')=>req(rota,{method:'POST',body,cookie});
  const dados=(email,identificador,tipoConta='consumidor')=>({name:'Pessoa Consumidora',email,identificador,tipoConta,nascimento:'1990-06-15',password:senha,passwordConfirmation:senha,aceiteTermos:'sim',versaoTermos:'2026-11-24',versaoPrivacidade:'2026-11-24'});
  const contarEmail=(destino,titulo)=>fs.readdirSync(caixa).filter(n=>n.endsWith('.eml')).map(n=>fs.readFileSync(path.join(caixa,n),'utf8')).filter(m=>m.startsWith(`To: ${destino}\n`)&&m.includes(titulo)).length;
  const tokenEmail=email=>{const mensagens=fs.readdirSync(caixa).filter(n=>n.endsWith('.eml')).sort().reverse().map(n=>fs.readFileSync(path.join(caixa,n),'utf8'));const mensagem=mensagens.find(m=>m.startsWith(`To: ${email}\n`)&&m.includes('/confirmar-email?'));assert.ok(mensagem);return mensagem.match(/token=([a-f0-9]{64})/)[1];};
  const login=async(identificador,interno=false)=>{const r=await post(interno?'/admin/entrar':'/entrar',{[interno?'email':'identificador']:identificador,password:senha});assert.equal(r.status,interno?303:302);const prefixo=interno?'cypher_admin_session=':'cypher_session=';return r.headers.getSetCookie().find(c=>c.startsWith(prefixo))?.split(';')[0];};
  for (const tipo of ['consumidor','profissional']) {
    const html=await (await req('/cadastro?tipo='+tipo)).text();
    const acesso=html.match(/<section[^>]+data-register-stage="acesso"[\s\S]*?<\/section>/)?.[0]??'';
    assert.match(acesso, /<select name="tratamento"/);
    assert.match(acesso, /name="generoPersonalizado"/);
    assert.match(acesso, /Prefiro não informar/);
  }
  db=new Database(arquivo);
  for(const alteracao of [{nascimento:'2012-01-01'},{nascimento:'2099-01-01'},{nascimento:'2025-02-29'},{identificador:'admin'},{identificador:'nome-com-hifen'},{identificador:'a'.repeat(25)},{passwordConfirmation:'OutraSenha2026'},{tratamento:'invalido'},{tratamento:'outro',generoPersonalizado:'x'.repeat(81)}]){const r=await post('/cadastro',{...dados('invalido@teste.local','invalido'),...alteracao});assert.equal(r.status,400);}
  assert.equal(db.prepare("SELECT count(*) AS total FROM usuarios WHERE tipo_conta<>'administrativo'").get().total,0,'Cadastro inválido não pode criar conta parcial');
  const pro={...dados('pro@teste.local','artista.teste','profissional'),name:'Nome Completo do Artista',nomePublico:'1',vulgo:'Artista Singular',tratamento:'feminino',categorias:['Rapper','Letrista'],vertentes:['Trap','Drill'],respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'1-3a',etapaProjetos:'publicados'},Letrista:{tempoAtuacao:'iniciando'}}),visibilidadesAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'publico'}})};
  assert.equal((await post('/cadastro',{...pro,respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'iniciando'}})})).status,400);
  const registro=await post('/cadastro',pro);assert.equal(registro.status,303);assert.equal(registro.headers.get('location'),'/email/pendente');
  const idPro=db.prepare("SELECT id FROM usuarios WHERE email='pro@teste.local'").get();
  assert.equal(db.prepare('SELECT nome,nome_informado FROM perfis WHERE usuario_id=?').get(idPro.id).nome,pro.name);
  assert.equal(db.prepare('SELECT tratamento FROM perfis WHERE usuario_id=?').get(idPro.id).tratamento, 'feminino');
  const atuacaoInicial = db.prepare('SELECT respostas_json,visibilidades_json FROM respostas_atuacao_categoria WHERE usuario_id=? AND categoria=?').get(idPro.id,'Rapper');
  assert.deepEqual(JSON.parse(atuacaoInicial.respostas_json), {tempoAtuacao:'1-3a'});
  assert.equal(JSON.parse(atuacaoInicial.visibilidades_json).tempoAtuacao,'privado');
  assert.equal(db.prepare('SELECT email_confirmado_em FROM usuarios WHERE id=?').get(idPro.id).email_confirmado_em,null);
  assert.equal((await post('/entrar',{email:pro.email,password:senha})).status,401);assert.equal((await req('/artistas/artista.teste')).status,302);
  const codigo=tokenEmail(pro.email);const salvo=db.prepare('SELECT token_hash,expira_em,criado_em FROM tokens_confirmacao_email WHERE usuario_id=?').get(idPro.id);assert.equal(salvo.token_hash,createHash('sha256').update(codigo).digest('hex'));assert.notEqual(salvo.token_hash,codigo);assert.equal(salvo.expira_em-salvo.criado_em,30*60*1000);
  assert.equal((await post('/confirmar-email',{token:codigo})).status,200);assert.equal((await post('/confirmar-email',{token:codigo})).status,400);
  assert.equal(contarEmail(pro.email,'Sua arte, sua identidade, seu corre.'),1);
  assert.equal(contarEmail(pro.email,'Chega mais. A Cypher é sua também.'),0);
  let cookiePro=await login('@ARTISTA.TESTE');
  const nomeInicial = await (await req('/artistas/artista.teste',{cookie:cookiePro})).text();
  assert.match(nomeInicial,/Nome Completo do Artista/);
  assert.match(nomeInicial,/Artista Singular/);
  assert.match(await (await req('/perfil',{cookie:cookiePro})).text(),/href="\/perfil\/completar"/);
  const identidadeInicial = {nomeInformado:pro.name,vulgo:pro.vulgo,nascimento:pro.nascimento,tratamento:'outro',generoPersonalizado:'Identidade privada de teste'};
  assert.equal((await post('/configuracoes/identidade',identidadeInicial,cookiePro)).status,303);
  assert.match(await (await req('/configuracoes',{cookie:cookiePro})).text(),/Identidade privada de teste/);
  assert.match(await (await req('/perfil',{cookie:cookiePro})).text(),/href="\/perfil\/completar"/);
  const publico=await req('/artistas/artista.teste',{cookie:cookiePro});assert.equal(publico.status,200);const htmlPublico=await publico.text();assert.match(htmlPublico,/Artista Singular/);assert.match(htmlPublico,/Nome Completo do Artista/);assert.doesNotMatch(htmlPublico,/Identidade privada de teste|1990-06-15|pro@teste.local/);
  const pendencias = await (await req('/perfil/completar',{cookie:cookiePro})).text();
  assert.match(pendencias,/Adicione uma foto de perfil|Informe sua cidade e estado/);
  assert.match(pendencias,/Adicione uma biografia/);
  assert.match(pendencias,/Desenvolvimento profissional/);
  assert.doesNotMatch(pendencias,/nomePublico|Nome completo|Data de nascimento|Gênero<|Vertentes de Rapper|Equipamentos|Status profissional|etapa dos projetos/);
  assert.doesNotMatch(htmlPublico,/CYP-[A-Z0-9]+|ID CYPHER/);
  const duplicado=await post('/cadastro',dados('duplicado@teste.local','ARTISTA.TESTE'));assert.equal(duplicado.status,409);
  assert.equal((await post('/cadastro',{...dados('consumidor@teste.local','consumidor'),categorias:'Rapper'})).status,400);
  assert.equal((await post('/cadastro',dados('consumidor@teste.local','consumidor'))).status,303);assert.equal((await post('/confirmar-email',{token:tokenEmail('consumidor@teste.local')})).status,200);
  const cookieConsumidor=await login('consumidor');const antes=db.prepare("SELECT id,email,senha_hash FROM usuarios WHERE email='consumidor@teste.local'").get();
  const perfilCons=await req('/perfil',{cookie:cookieConsumidor});assert.equal(perfilCons.status,200);const perfilConsHtml=await perfilCons.text();assert.match(perfilConsHtml,/Espaço privado/);assert.doesNotMatch(perfilConsHtml,/data-profile-context|data-seal-editor|Catálogo autoral|Avaliações recebidas/);
  assert.equal((await req('/artistas/consumidor',{cookie:cookiePro})).status,404);
  const visitante = await req('/artistas/artista.teste?aba=atuacao',{cookie:cookieConsumidor});
  assert.doesNotMatch(await visitante.text(), /De 1 a 3 anos/);
  assert.equal((await post('/configuracoes/identidade',{...identidadeInicial,nomePublicoPresente:'1'},cookiePro)).status,303);
  assert.doesNotMatch(await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text(),/Nome Completo do Artista/);
  assert.doesNotMatch(await (await req('/busca',{cookie:cookieConsumidor})).text(),/Nome Completo do Artista/);
  assert.equal((await post('/configuracoes/identidade',{...identidadeInicial,nomePublicoPresente:'1',nomePublico:'1'},cookiePro)).status,303);
  const progressoConsumidor = await (await req('/perfil/completar',{cookie:cookieConsumidor})).text();
  assert.match(progressoConsumidor,/0% completo/);
  assert.doesNotMatch(progressoConsumidor,/Tempo de atuação|Desenvolvimento profissional|Contato profissional/);
  assert.equal((await post('/perfil/apresentacao',{cidade:'São Paulo',biografia:'Acompanho a cena.'},cookieConsumidor)).status,303);
  assert.match(await (await req('/perfil/completar',{cookie:cookieConsumidor})).text(),/Informe sua cidade e estado/);
  assert.match(await (await req('/perfil?editar=apresentacao',{cookie:cookieConsumidor})).text(),/<details class="pf-expand" open>/);
  assert.equal((await post('/perfil/apresentacao',{cidade:'São Paulo, SP',biografia:'Acompanho a cena.'},cookieConsumidor)).status,303);

  const solo = {...dados('solo@teste.local','foto.solo','profissional'),name:'Nome Privado de Fotógrafa',categorias:'Fotógrafo(a)',respostasAtuacoesJson:JSON.stringify({'Fotógrafo(a)':{tempoAtuacao:'iniciando'}})};
  assert.equal((await post('/cadastro',solo)).status,303);
  assert.equal((await post('/confirmar-email',{token:tokenEmail(solo.email)})).status,200);
  const cookieSolo = await login('foto.solo');
  const idSolo = db.prepare("SELECT id FROM usuarios WHERE email=?").get(solo.email).id;
  const perfilSolo = await (await req('/artistas/foto.solo',{cookie:cookieConsumidor})).text();
  assert.match(perfilSolo, /@foto.solo/);
  assert.doesNotMatch(perfilSolo, /Nome Privado de Fotógrafa/);
  assert.doesNotMatch(await (await req('/perfil/completar',{cookie:cookieSolo})).text(),/Informe seus gêneros e estilos musicais/);
  assert.equal((await post('/perfil/secoes/pessoal',{cidade:'Recife, PE',biografia:'Começando na fotografia.'},cookieSolo)).status,303);
  assert.equal((await post('/perfil/secoes/contato',{contato:'foto@contato.test'},cookieSolo)).status,303);
  assert.equal((await post('/perfil/secoes/profissional',{
    categorias:solo.categorias,respostasAtuacoesJson:solo.respostasAtuacoesJson,visibilidadesAtuacoesJson:'{}',
    competencias:'Fotografia de shows',disponibilidade:'sob-consulta'
  },cookieSolo)).status,303);
  const editorSolo = await req('/perfil?editar=1&secao=profissional',{cookie:cookieSolo});
  assert.equal(editorSolo.status,200);
  assert.match(await editorSolo.text(),/id="profile-estilos"[^>]* hidden/);
  const assinatura = {letras:'AS',forma:'disco',cor:'oliva'};
  assert.equal((await post('/perfil/selo',assinatura,cookieConsumidor)).status,403);
  assert.equal((await post('/perfil/selo',assinatura,cookiePro)).status,303);
  assert.equal((await post('/perfil/selo',{...assinatura,cor:'cobre'},cookiePro)).status,303);
  assert.equal(db.prepare('SELECT count(*) n FROM selos_perfil WHERE autor_id=? AND retirado_em IS NULL').get(idPro.id).n,1);
  assert.equal(db.prepare('SELECT count(*) n FROM selos_perfil WHERE autor_id=?').get(idPro.id).n,2);
  const perfilComSelo = await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text();
  assert.match(perfilComSelo,/Selo profissional de Artista Singular/);
  assert.equal((perfilComSelo.match(/class="pf-selo-assinatura"/g) || []).length, 1);
  assert.match(perfilComSelo,/class="pf-selo-assinatura"[^]*?aria-label="Denunciar este selo"/);
  assert.doesNotMatch(htmlPublico,/class="pf-selo-assinatura"/);
  const meuPerfilComSelo = await (await req('/perfil',{cookie:cookiePro})).text();
  assert.match(meuPerfilComSelo,/class="pf-selo-assinatura"/);
  assert.doesNotMatch(meuPerfilComSelo,/aria-label="Denunciar este selo"/);
  assert.doesNotMatch(perfilComSelo,/Propor colaboração|Editar perfil<\/a>|Propor representação/);
  const seloInvalido = await post('/perfil/selo',{...assinatura,letras:'ABCD'},cookiePro);
  assert.equal(seloInvalido.status,303);
  assert.match(seloInvalido.headers.get("location"), /^\/perfil\?editar=1&secao=selo&erro=selo_invalido/);
  const editorSelo = await (await req('/perfil?editar=1&secao=selo',{cookie:cookiePro})).text();
  assert.match(editorSelo, /id="edit-tab-selo"[^>]*aria-selected="true"/);
  assert.match(editorSelo, /data-profile-edit-panel="identidade" hidden/);
  assert.equal((editorSelo.match(/type="radio" name="forma"/g)||[]).length, 9);
  assert.match(editorSelo,/name="forma" value="gota"/);
  assert.doesNotMatch(editorSelo,/octogono/i);
  const formaRetirada = await post('/perfil/selo',{...assinatura,forma:'octogono'},cookiePro);
  assert.match(formaRetirada.headers.get('location'), /erro=selo_invalido/);
  assert.equal((editorSelo.match(/type="radio" name="cor"/g)||[]).length, 10);
  assert.equal((editorSelo.match(/type="radio" name="simbolo"/g)||[]).length, 12);
  const assinaturaNova = {letras:'É2',forma:'gota',cor:'jade',simbolo:'nenhum'};
  const alteracaoSelo = await post('/perfil/selo',assinaturaNova,cookiePro);
  assert.equal(alteracaoSelo.status,303);
  assert.equal(alteracaoSelo.headers.get('location'),'/perfil?editar=1&secao=selo&selo=salvo#profile-editor-selo');
  assert.equal((await post('/perfil/selo',assinaturaNova,cookiePro)).status,303);
  assert.equal(db.prepare('SELECT count(*) n FROM selos_perfil WHERE autor_id=?').get(idPro.id).n,3);
  const assinaturaPublica = await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text();
  assert.match(assinaturaPublica,/data-forma="gota" data-cor="jade" data-simbolo="nenhum"[^>]*><span class="pf-seal-symbol" aria-hidden="true"><\/span><span class="pf-seal-letters" aria-hidden="true">É2/);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAADklEQVR4nGNgGAUMSAAAARAAAVrp4sUAAAAASUVORK5CYII=','base64');
  const endpointEstudio = '/perfil/selo/estudio';
  const jsonPost = (rota,body,cookie=cookiePro,comCsrf=true) => fetch(base+rota,{
    method:'POST',redirect:'manual',headers:{cookie:cookie+'; '+csrf,'content-type':'application/json',...(comCsrf?{'x-csrf-token':tokenCSRF}:{})},
    body:JSON.stringify(body)
  });
  const publicarSelo = (composicao,acao='publicar',cookie=cookiePro,token=true) => jsonPost(endpointEstudio,{acao,composicao},cookie,token);
  const consultarEstudio = cookie => req(endpointEstudio,{cookie}).then(r=>r.json());
  const ativa = () => db.prepare('SELECT id,composicao_json FROM selos_perfil WHERE autor_id=? AND retirado_em IS NULL').get(idPro.id);
  const idAnterior = ativa().id;
  const composicao = converterSelo('gota','jade','CY','estrela');
  composicao.fundo = {tipo:'linear',cor:'#224455',segunda:'#778899',angulo:35};
  composicao.camadas.push(novaCamada('texto','Lab da Cena',{curva:20,compacta:false,y:68}));
  composicao.camadas.push(novaCamada('ornamento','pontos',{mostrar:false,x:55,y:40}));
  composicao.camadas.push(novaCamada('simbolo','vinil-corte',{preencher:false,espessura:1.25,trama:'grade',acabamentoVetor:'metal',opacidade:79}));
  composicao.camadas.push(novaCamada('simbolo','lua-catedral',{trama:'pontos',acabamentoVetor:'acetinado',cor:'#221144',flip:true}));
  const valSelo=await import('../dist/src/app/models/composicaoSelo.js');
  for(const m of modelos) assert.doesNotThrow(()=>valSelo.validarComposicao(modeloSelo(m,'CY'),true));
  const composicaoAnterior=structuredClone(composicao);
  const camadaLegadaVetorial=composicaoAnterior.camadas[0];
  delete camadaLegadaVetorial.preencher; delete camadaLegadaVetorial.trama; delete camadaLegadaVetorial.acabamentoVetor;
  assert.equal(valSelo.validarComposicao(composicaoAnterior).camadas[0].preencher,true);
  const {vetores,pesquisarVetores}=await import('../public/js/selo-vetores.js');
  assert.equal(new Set(vetores.map(v=>v.id)).size,vetores.length);
  assert.ok(vetores.length>=80);
  for(const v of vetores) assert.doesNotThrow(()=>valSelo.validarComposicao({...baseSelo(),camadas:[novaCamada('simbolo',v.id)]},true));
  assert.deepEqual(pesquisarVetores({busca:'luA gOtIcO'}).map(v=>v.id),['lua-catedral']);
  const h=criarHistorico(composicao); h.alterar(s=>s.camadas[0].x=20,true); h.alterar(s=>s.camadas[0].x=30,true); h.concluir();
  assert.equal(h.atual.camadas[0].x,30); h.desfazer(); assert.equal(h.atual.camadas[0].x,50);
  h.refazer(); assert.equal(h.atual.camadas[0].x,30); h.desfazer(); h.alterar(s=>s.camadas[0].x=45);
  assert.equal(h.podeRefazer,false);
  assert.equal((await req(endpointEstudio,{cookie:cookieConsumidor})).status,403);
  assert.equal((await publicarSelo(composicao,'publicar',cookieConsumidor)).status,403);
  assert.equal((await publicarSelo(composicao,'publicar',cookiePro,false)).status,403);
  for(const invalida of [
    {...composicao, v:100}, {...composicao, forma:'não-existe'}, {...composicao, camadas:[...composicao.camadas,composicao.camadas[0]]},
    {...composicao, fundo:{...composicao.fundo, cor:'não é uma cor'}},
    {...composicao, camadas:Array.from({length:13},()=>novaCamada('simbolo','estrela'))},
    {...composicao, camadas:[novaCamada('texto','<texto não suportado>')]},
    {...composicao, camadas:[novaCamada('simbolo','vetor-que-nao-existe')]},
    {...composicao, camadas:[novaCamada('simbolo','estrela',{trama:'nao-existe'})]},
    {...composicao, camadas:[novaCamada('simbolo','estrela',{acabamentoVetor:'nao-existe'})]},
    baseSelo(),
  ]) assert.equal((await publicarSelo(invalida)).status,400);
  assert.equal((await publicarSelo(composicao,'rascunho')).status,200);
  assert.equal(ativa().id,idAnterior);
  const rascunhoVetores=(await consultarEstudio(cookiePro)).rascunho;
  assert.equal(rascunhoVetores.camadas.find(l=>l.tipo==='texto').valor,'Lab da Cena');
  assert.equal(rascunhoVetores.camadas.at(-1).acabamentoVetor,'acetinado');
  assert.equal(rascunhoVetores.camadas.at(-2).preencher,false);
  assert.equal((await consultarEstudio(cookieSolo)).rascunho,null);
  assert.doesNotMatch(await (await req('/artistas/artista.teste',{cookie:cookieSolo})).text(),/Lab da Cena/);
  assert.equal((await publicarSelo(composicao)).status,200);
  const idNovo=ativa().id;
  assert.notEqual(idNovo,idAnterior);
  assert.equal((await consultarEstudio(cookiePro)).rascunho,null);
  const historicoEstudio=(await consultarEstudio(cookiePro)).versoes;
  assert.equal(historicoEstudio[0].id,idNovo);
  assert.ok(historicoEstudio.find(v=>v.id===idAnterior).retirado_em);
  const seloEstudioPublico=await (await req('/artistas/artista.teste',{cookie:cookieSolo})).text();
  assert.match(seloEstudioPublico,/data-seal-public="[^"]*CY/);
  assert.doesNotMatch(seloEstudioPublico,/Lab da Cena/);
  assert.match(seloEstudioPublico,/vinil-corte/);
  assert.match(seloEstudioPublico,/lua-catedral/);
  assert.equal((await publicarSelo(composicao)).status,200);
  assert.equal(ativa().id,idNovo);
  assert.equal((await jsonPost('/selos/solicitacoes',{imagem:'data:image/png;base64,YWJj',justificativa:'Imagem de autoria do artista.',direitos:'sim',objetivo:'camada'})).status,400);
  const pedido = await jsonPost('/selos/solicitacoes',{imagem:'data:image/png;base64,'+png.toString('base64'),justificativa:'Imagem de autoria do artista.',direitos:'sim',objetivo:'camada'});
  assert.equal(pedido.status,201);
  const {id:marcaId}=await pedido.json();
  const comMarca=structuredClone(composicao);
  comMarca.camadas.push(novaCamada('imagem',marcaId,{mono:true,recorte:true}));
  assert.equal((await publicarSelo(comMarca,'rascunho',cookieSolo)).status,422);
  assert.equal((await publicarSelo(comMarca,'rascunho')).status,200);
  assert.equal((await publicarSelo(comMarca)).status,422);
  assert.equal((await req('/selos/imagem/'+marcaId,{cookie:cookieSolo})).status,404);
  const revisorSelo=await login('super@teste.local',true);
  assert.equal((await post('/admin/selos/'+marcaId,{acao:'aprovado',motivo:'Autorização confirmada para a camada.'},revisorSelo)).status,303);
  assert.equal(ativa().id,idNovo,'aprovar camada não altera o selo publicado');
  assert.equal((await req('/selos/imagem/'+marcaId,{cookie:cookieSolo})).status,404);
  assert.equal((await publicarSelo(comMarca)).status,200);
  assert.equal((await req('/selos/imagem/'+marcaId,{cookie:cookieSolo})).status,200);
  assert.equal((await consultarEstudio(cookiePro)).imagens.find(x=>x.id===marcaId).estado,'aprovado');
  assert.equal((await publicarSelo(composicao)).status,200);
  assert.equal((await req('/selos/imagem/'+marcaId,{cookie:cookieSolo})).status,404);
  console.log('OK: Estúdio, modelos e histórico, rascunhos privados, publicação atômica e fluxo de marca aprovada.');
  const enviarImagem = async (finalidade, { id = idPro.id, cookie = cookiePro } = {}) => {
    const resposta = await fetch(base+'/publicacoes/perfil/'+id+'/midias?finalidade='+finalidade, {
      method:'POST', headers:{cookie:csrf+'; '+cookie,'X-CSRF-Token':tokenCSRF,'Content-Type':'application/octet-stream',
        'X-Midia-Autorizada':'sim','X-File-Name':'imagem.png'}, body:png
    });
    assert.equal(resposta.status,201);
    return (await resposta.json()).id;
  };
  const foto = await enviarImagem('imagem'), anterior = await enviarImagem('capa'), capa = await enviarImagem('capa');
  await enviarImagem('imagem', {id:antes.id,cookie:cookieConsumidor});
  await enviarImagem('imagem', {id:idSolo,cookie:cookieSolo});
  assert.match(await (await req('/perfil/completar',{cookie:cookieConsumidor})).text(),/100% completo/);
  const assistenteCompleto = await (await req('/perfil/completar/dados',{cookie:cookieConsumidor})).json();
  assert.deepEqual(assistenteCompleto,{percentual:100, etapas:[]});
  for (const pagina of ['/perfil','/descoberta'])
    assert.doesNotMatch(await (await req(pagina,{cookie:cookieConsumidor})).text(),/data-cp-abrir/);
  assert.equal((await jsonPost('/perfil/completar/dados',{id:'contato',valor:'nao-permitido'},cookieConsumidor)).status,409);
  assert.equal((await jsonPost('/perfil/completar/dados',{id:'cidade',valor:'Rio de Janeiro, RJ'},cookieConsumidor,false)).status,403);
  const progressoSolo = await (await req('/perfil/completar',{cookie:cookieSolo})).text();
  assert.match(progressoSolo,/100% completo/);
  assert.match(progressoSolo,/Construa seu portfólio/);
  assert.match(progressoSolo,/Personalize seu selo profissional/);
  const sobreSolo = async () => (await req('/artistas/foto.solo?aba=sobre',{cookie:cookieConsumidor})).text();
  assert.doesNotMatch(await sobreSolo(), /Recife|Fotografia de shows|foto@contato.test|Ainda estou começando/);
  assert.match(await sobreSolo(), /Disponibilidade sob consulta/);
  const atuacaoSolo = async () => (await req('/artistas/foto.solo?aba=atuacao',{cookie:cookieConsumidor})).text();
  assert.doesNotMatch(await atuacaoSolo(), /Fotografia de shows/);
  assert.equal((await post('/configuracoes/privacidade',{perfilPublico:'on',competenciasPublicasPresente:'1',competenciasPublicas:'on'},cookieSolo)).status,303);
  assert.match(await atuacaoSolo(), /Competências e especializações[\s\S]*Fotografia de shows/);
  assert.doesNotMatch(await sobreSolo(), /Fotografia de shows/);
  assert.equal((await post('/configuracoes/privacidade',{perfilPublico:'on',competenciasPublicasPresente:'1'},cookieSolo)).status,303);
  assert.doesNotMatch(await atuacaoSolo(), /Fotografia de shows/);
  assert.match(await (await req('/perfil/completar',{cookie:cookieSolo})).text(),/100% completo/);
  const comCapa = await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text();
  assert.ok(comCapa.includes('class="pf-cover-art" src="/midias-de-publicacao/'+capa+'"'));
  assert.ok(comCapa.includes('src="/midias-de-publicacao/'+foto+'"'));
  assert.equal((await req('/midias-de-publicacao/'+anterior,{cookie:cookieConsumidor})).status,404);
  assert.equal((await req('/midias-de-publicacao/'+capa,{cookie:cookieConsumidor})).status,200);
  assert.equal((await post('/perfil/selo',{acao:'retirar'},cookiePro)).status,303);
  assert.doesNotMatch(await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text(),/Selo profissional de Artista Singular/);
  await post('/configuracoes/privacidade',{perfilPublico:'on',localizacaoPublica:'on',contatoPublico:'on'},cookieConsumidor);assert.equal(db.prepare('SELECT perfil_publico FROM perfis WHERE usuario_id=?').get(antes.id).perfil_publico,0);
  assert.equal((await post('/perfil/secoes/pessoal',{cidade:'Belo Horizonte, MG',biografia:'Trabalho com rap e escrita.'},cookiePro)).status,303);
  assert.equal((await post('/perfil/secoes/contato',{contato:'artista@contato.test'},cookiePro)).status,303);
  const atuacoesCompletas = {
    categorias:pro.categorias, competencias:'Rimas e escrita', generos:'Rap',
    respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'1-3a',atividadePratica:'aprendizado'},Letrista:{tempoAtuacao:'iniciando'}}),
    visibilidadesAtuacoesJson:JSON.stringify({Rapper:{__categoria__:'privado',tempoAtuacao:'privado'}}),
    vertentesPresentes:'1'
  };
  assert.equal((await post('/perfil/secoes/profissional',atuacoesCompletas,cookiePro)).status,303);
  const progressoMulti = await (await req('/perfil/completar',{cookie:cookiePro})).text();
  assert.match(progressoMulti,/100% completo/);
  assert.match(progressoMulti,/Personalize seu selo profissional/);
  assert.equal((await post('/perfil/secoes/profissional',{
    ...atuacoesCompletas, respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'1-3a'},Letrista:{}})
  },cookiePro)).status,303);
  const progressoSemTempo = await (await req('/perfil/completar',{cookie:cookiePro})).text();
  assert.match(progressoSemTempo,/Informe o tempo de atuação em Letrista/);
  assert.doesNotMatch(progressoSemTempo,/Informe o tempo de atuação em Rapper|100% completo/);
  const busca=await req('/busca',{cookie:cookieConsumidor});const buscaHtml=await busca.text();assert.doesNotMatch(buscaHtml,/href="\/artistas\/consumidor"/);assert.match(buscaHtml,/Nome Completo do Artista/);
  const descoberta = await req('/descoberta?tipo=profissionais&q=singular', {cookie:cookieConsumidor});
  const htmlDescoberta = await descoberta.text();
  assert.equal(descoberta.status,200);
  assert.match(htmlDescoberta,/class="dc-result-grid"/);
  assert.match(htmlDescoberta,/href="\/artistas\/artista\.teste"/);
  assert.doesNotMatch(htmlDescoberta,/class="dc-create"/);
  const ativacao={categorias:['Rapper','Letrista'],respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'<6m'},Letrista:{tempoAtuacao:'iniciando'}}),visibilidadesAtuacoesJson:'{}'};
  assert.equal((await post('/perfil/profissionalizar',ativacao,cookieConsumidor)).status,400);assert.equal(db.prepare('SELECT tipo_conta FROM usuarios WHERE id=?').get(antes.id).tipo_conta,'consumidor');
  assert.equal((await post('/perfil/profissionalizar',{...ativacao,confirmar:'1'},cookieConsumidor)).status,303);
  assert.deepEqual(db.prepare('SELECT id,email,senha_hash FROM usuarios WHERE id=?').get(antes.id),antes);assert.equal(db.prepare('SELECT tipo_conta FROM usuarios WHERE id=?').get(antes.id).tipo_conta,'profissional');assert.equal(db.prepare('SELECT count(*) AS total FROM ativacoes_profissionais WHERE usuario_id=?').get(antes.id).total,1);
  await post('/perfil/profissionalizar',{...ativacao,confirmar:'1'},cookieConsumidor);assert.equal(db.prepare('SELECT count(*) AS total FROM ativacoes_profissionais WHERE usuario_id=?').get(antes.id).total,1);
  assert.equal(contarEmail(antes.email,'Chega mais. A Cypher é sua também.'),1);
  assert.equal(contarEmail(antes.email,'Agora, seu trabalho também tem espaço aqui.'),1);
  assert.equal(contarEmail(antes.email,'Sua arte, sua identidade, seu corre.'),0);
  assert.equal(contarEmail('novo@teste.local','Sua arte, sua identidade, seu corre.'),0);
  const categoriaNova={categorias:['Rapper','Beatmaker'],respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'1-3a'},Beatmaker:{tempoAtuacao:'iniciando'}}),visibilidadesAtuacoesJson:'{}',vertentesPresentes:'1',vertentes:['Trap']};
  assert.equal((await post('/perfil/secoes/profissional',categoriaNova,cookiePro)).status,303);
  assert.deepEqual(JSON.parse(db.prepare('SELECT categorias_json FROM perfis WHERE usuario_id=?').get(idPro.id).categorias_json),['Beatmaker','Rapper']);
  const bloqueio=await post('/perfil/secoes/profissional',{categorias:'Rapper',respostasAtuacoesJson:JSON.stringify({Rapper:{tempoAtuacao:'1-3a'}}),visibilidadesAtuacoesJson:'{}'},cookiePro);assert.equal(bloqueio.status,409);
  assert.equal((await req('/perfil?editar=1&secao=profissional',{cookie:cookiePro})).status,200);
  b.inicializarBancoCypher();
  b.criarObraCypher(antes.id,{title:'Obra com crédito público',type:'Música',typeDetail:'',status:'Lançado',role:'Artista principal',roleDetail:'',description:'',genre:'Rap',genreDetail:'',lyrics:'',bpm:'',isrc:'',iswc:'',releaseDate:'2026-01-01',listenLink:''},[{handle:'@artista.teste',name:'Artista Singular',role:'Produção musical',participation:''}]);
  b.fecharBancoCypher();
  const identidade={nomeInformado:'Outro Nome Completo',vulgo:'Nova Identidade Pública',nascimento:'1990-06-15',tratamento:'feminino'};
  assert.equal((await post('/configuracoes/identidade',identidade,cookiePro)).status,303);
  assert.equal(db.prepare('SELECT nome_creditado FROM creditos WHERE usuario_creditado_id=?').get(idPro.id).nome_creditado,'Outro Nome Completo'); const creditos=await req('/artistas/artista.teste',{cookie:cookieConsumidor});const htmlCreditos=await creditos.text();assert.match(htmlCreditos,/Nova Identidade Pública/);assert.match(htmlCreditos,/Outro Nome Completo/);assert.doesNotMatch(htmlCreditos,/Nome Completo do Artista/);
  assert.equal((await post('/configuracoes/identidade',{...identidade,nomePublicoPresente:'1'},cookiePro)).status,303);
  assert.equal(db.prepare('SELECT nome_creditado FROM creditos WHERE usuario_creditado_id=?').get(idPro.id).nome_creditado,'Nova Identidade Pública');
  assert.doesNotMatch(await (await req('/artistas/artista.teste',{cookie:cookieConsumidor})).text(),/Outro Nome Completo/);
  assert.equal(db.prepare('SELECT genero_personalizado FROM perfis WHERE usuario_id=?').get(idPro.id).genero_personalizado,'');
  const nascimentoForjado=await post('/configuracoes/identidade',{...identidade,nascimento:'1991-01-01'},cookiePro);assert.equal(nascimentoForjado.status,400);assert.equal(db.prepare('SELECT nascimento FROM perfis WHERE usuario_id=?').get(idPro.id).nascimento,'1990-06-15');
  const imediato=await post('/configuracoes/identificador',{identificador:'artista.novo'},cookiePro);assert.equal(imediato.status,303);assert.match(imediato.headers.get('location'),/erro=/);
  db.prepare("UPDATE perfis SET identificador_alterado_em=datetime('now','-31 days') WHERE usuario_id=?").run(idPro.id);
  assert.equal((await post('/configuracoes/identificador',{identificador:'artista.novo'},cookiePro)).status,303);const antigo=await req('/artistas/artista.teste',{cookie:cookieConsumidor});assert.equal(antigo.status,308);assert.equal(antigo.headers.get('location'),'/artistas/artista.novo');
  assert.equal((await post('/cadastro',dados('captura@teste.local','artista.teste'))).status,409);
  const mod=await login('mod@teste.local',true);const editor=await login('editor@teste.local',true);
  const excecao={atual:'artista.novo',novo:'artista.final',motivo:'Correção solicitada pelo titular e revisada pela equipe.'};
  assert.equal((await post('/admin/identificador',excecao,editor)).status,403);assert.equal((await post('/admin/identificador',excecao,mod)).status,303);assert.equal(db.prepare('SELECT identificador FROM perfis WHERE usuario_id=?').get(idPro.id).identificador,'@artista.final');
  assert.equal((await req('/artistas/artista.teste',{cookie:cookieConsumidor})).headers.get('location'),'/artistas/artista.final');
  await post('/configuracoes/privacidade',{},cookiePro);assert.equal((await req('/artistas/artista.teste',{cookie:cookieConsumidor})).status,404);assert.equal((await req('/artistas/artista.final',{cookie:cookieConsumidor})).status,404);
  assert.equal((await req('/midias-de-publicacao/'+capa,{cookie:cookieConsumidor})).status,404);
  assert.equal((await req('/midias-de-publicacao/'+foto,{cookie:cookieConsumidor})).status,404);
  assert.equal((await post('/configuracoes/preferencias',{regiao:'São Paulo',generos:['Trap','Rap'],tema:'dark'},cookiePro)).status,303);
  const configuracoes=await req('/configuracoes',{cookie:cookiePro});const cfgHtml=await configuracoes.text();assert.match(cfgHtml,/name="cypher-theme" content="dark"/);assert.match(cfgHtml,/value="São Paulo"/);assert.doesNotMatch(cfgHtml,/Ajuda e sobre/);
  db.prepare("INSERT INTO eventos (id,proprietario_id,titulo,categoria,data_texto,local) VALUES ('sp',?,'Evento da região','Show','2030-01-01','República, São Paulo')").run(idPro.id);db.prepare("INSERT INTO eventos (id,proprietario_id,titulo,categoria,data_texto,local) VALUES ('rj',?,'Evento em outra região','Show','2030-01-01','Rio de Janeiro')").run(idPro.id);
  const vitrinePrivada = await req('/descoberta?tipo=eventos',{cookie:cookieConsumidor});
  assert.doesNotMatch(await vitrinePrivada.text(),/Evento da região|Evento em outra região/);
  const eventos=await req('/eventos',{cookie:cookiePro});const eventosHtml=await eventos.text();assert.match(eventosHtml,/Evento da região/);assert.doesNotMatch(eventosHtml,/Evento em outra região/);
  const cidadeEBairro = new URLSearchParams({ localizacao: 'Sao Paulo, Republica', categoria: 'Show' });
  const eventosBairro = await (await req('/eventos?' + cidadeEBairro, { cookie: cookiePro })).text();
  assert.match(eventosBairro, /Evento da região/);
  assert.doesNotMatch(eventosBairro, /Evento em outra região/);
  db.prepare('UPDATE tokens_confirmacao_email SET criado_em=criado_em-61000 WHERE usuario_id=?').run(idPro.id);
  const troca=await post('/configuracoes/email',{email:'novo@teste.local',senha},cookiePro);assert.equal(troca.status,303);assert.equal(db.prepare('SELECT email FROM usuarios WHERE id=?').get(idPro.id).email,'pro@teste.local');
  assert.equal((await post('/confirmar-email',{token:tokenEmail('novo@teste.local')})).status,200);assert.equal(db.prepare('SELECT email FROM usuarios WHERE id=?').get(idPro.id).email,'novo@teste.local');assert.equal((await req('/configuracoes',{cookie:cookiePro})).status,302);cookiePro=await login('novo@teste.local');assert.ok(cookiePro);
  await post('/cadastro',dados('expirado@teste.local','expirado'));const expirado=tokenEmail('expirado@teste.local');db.prepare('UPDATE tokens_confirmacao_email SET expira_em=0 WHERE token_hash=?').run(createHash('sha256').update(expirado).digest('hex'));assert.equal((await post('/confirmar-email',{token:expirado})).status,400);
  const totalAntes=db.prepare("SELECT count(*) AS total FROM tokens_confirmacao_email WHERE usuario_id=(SELECT id FROM usuarios WHERE email='expirado@teste.local')").get().total;await post('/email/reenviar',{email:'expirado@teste.local'});assert.equal(db.prepare("SELECT count(*) AS total FROM tokens_confirmacao_email WHERE usuario_id=(SELECT id FROM usuarios WHERE email='expirado@teste.local')").get().total,totalAntes);
  db.prepare("UPDATE tokens_confirmacao_email SET criado_em=criado_em-61000 WHERE usuario_id=(SELECT id FROM usuarios WHERE email='expirado@teste.local')").run();await post('/email/reenviar',{email:'expirado@teste.local'});const novoToken=tokenEmail('expirado@teste.local');assert.notEqual(novoToken,expirado);assert.equal((await post('/confirmar-email',{token:novoToken})).status,200);
  assert.deepEqual(db.pragma('foreign_key_check'),[]);
  console.log('OK: cadastro em duas modalidades, aceite versionado, @ de 3–24 caracteres, confirmação/expiração/reenvio e troca de e-mail, nome completo e vulgo no perfil público, conversão irreversível, questionário mínimo, intervalos de 30 dias, exceções, preferências e privacidade.');
}finally{db?.close();b.fecharBancoCypher();processo.kill();await fim;assert.equal(path.dirname(path.resolve(pasta)),path.resolve(os.tmpdir()));fs.rmSync(pasta,{recursive:true,force:true});}




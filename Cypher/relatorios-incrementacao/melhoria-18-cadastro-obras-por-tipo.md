# Melhoria 18 — Cadastro de Obras por tipo

**Data:** 25 de outubro de 2026  
**Escopo:** transformar o início do cadastro de Obras em uma etapa independente de seleção de tipo, com formulário contextualizado e reaproveitamento do fluxo específico de Beats.

## Implementação

A página `/works` agora possui um modal acessível de seleção de tipo aberto pelo botão **Cadastrar obra**. O modal apresenta Instrumental, Música, Single, EP, Álbum, Beat e Outro com descrições e ícones próprios. O fechamento pode ocorrer pelo botão de fechar, pelo botão Cancelar, por `Escape` ou pelo clique fora do diálogo. O foco é levado ao primeiro item e retorna ao elemento que abriu o modal.

As opções de Obras comuns direcionam para `/works/new?tipo=<slug>`. A rota também aceita o nome legível do tipo para compatibilidade. Sem tipo selecionado, `/works/new` retorna para `/works#cadastro-obra`, que reabre o modal no cliente. A escolha Beat reutiliza o fluxo já existente do Banco de Beats em `/beats/new`, evitando duplicar regras de licença, ofertas, BPM, tonalidade, duração e venda exclusiva.

O formulário `cadastro-obra.ejs` deixou de misturar a seleção de tipo com os campos de cadastro. Ele recebe o tipo escolhido, exibe um cartão de contexto com a opção de voltar e aplica a visibilidade contextual já suportada por `interacoes.js`. Instrumental foi adicionado como tipo persistido textual e utiliza os campos existentes de obra, sem criar uma tabela ou estrutura paralela. Para Outro, gênero/categoria passou a ser opcional no servidor e no HTML.

## Arquivos alterados

- `src/app/models/modeloCypher.ts`
- `src/app/controllers/controladorCompatibilidade.ts`
- `views/pages/obras.ejs`
- `views/pages/cadastro-obra.ejs`
- `public/js/interacoes.js`
- `public/css/obras.css`
- `public/css/cadastro-obra.css`
- `ANALISE-PROJETO.md`
- `README.md`

## Alterações estruturais no banco

**Nenhuma.** Não foram criadas, removidas ou renomeadas tabelas. Nenhuma coluna, constraint ou índice foi criada, removida ou alterada. O schema permanece na versão **6**.

O tipo `Instrumental` é armazenado no campo textual `obras.tipo`, que já existia e não possui uma lista SQL restritiva. Bancos existentes continuam válidos. Não houve backfill nem conversão de dados. As regras de exclusão, cascata e integridade referencial permanecem inalteradas.

## Validações e compatibilidade

- O controller continua validando título, tipo, gênero/categoria, status, papel, limites textuais, BPM, códigos, data, link e créditos.
- Instrumental usa o mesmo contrato persistido de Obras e não altera registros anteriores.
- Outro pode omitir gênero/categoria, mas, quando preenchido, o valor continua sendo validado contra as opções existentes.
- Beat não é salvo pelo fluxo de Obras; a rota encaminha para o cadastro de Beats existente.
- Edição, detalhes, filtros, créditos, participações e catálogo de obras anteriores permanecem no mesmo contrato.
- Mensagens e documentação permanecem em português do Brasil.

## Validações executadas

- `npm ci` — concluído.
- `node scripts/formatar-ejs.mjs` — concluído.
- `node --check public/js/interacoes.js` — concluído.
- `npm run check` — concluído.
- `npm run build` — concluído.
- Preview compilado com banco temporário — iniciado com sucesso.
- `/login` e `/register` — 200.
- `/works` sem sessão — redireciona para `/login`.
- Cadastro e login temporários — concluídos.
- `/works` autenticado — 200 com modal presente.
- `/works/new?tipo=instrumental` — 200 com contexto do tipo selecionado.
- `/works/new?tipo=Instrumental` — 200 por compatibilidade.
- `/works/new?tipo=beat` — 303 para `/beats/new`.

## Pendências preservadas

A tracklist de EP/Álbum, upload de áudio/capa, player, compra e checkout continuam fora do escopo atual. A seleção por tipo contextualiza os campos existentes sem simular funcionalidades ainda não implementadas.

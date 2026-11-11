# Melhoria 30 — Opções “Outro(s)” com especificação contextual

## Objetivo

Auditar as opções genéricas “Outro”, “Outra” e “Outros” nos fluxos da Cypher e, quando o valor sozinho não identificava o contexto, apresentar um campo de especificação coerente com o dado solicitado. As especificações ficam separadas dos valores canônicos; categorias e gêneros que exigem moderação não são ativados como taxonomia apenas porque alguém os digitou.

## Contextos verificados e implementação

- **Cadastro profissional — categoria “Outros”:** o campo para descrever a categoria aparece quando a opção é selecionada e é obrigatório. O texto continua seguindo o fluxo de proposta/moderação existente.
- **Edição profissional — categoria “Outros”:** a seleção revela o formulário independente para sugerir uma categoria; o envio permanece separado do salvamento do perfil e não transforma automaticamente a proposta em categoria aprovada.
- **Gênero do perfil — “Outro”:** a edição revela a especificação correspondente, validada separadamente do conjunto canônico de gêneros.
- **Questionários profissionais — “Outro objetivo” e “Outra vertente” do Rap:** os campos dependentes aparecem apenas quando a resposta que os ativa é escolhida e se tornam obrigatórios tanto na interface quanto na validação do servidor, inclusive para questionários de categorias já existentes. Os demais campos históricos não passaram a ser obrigatórios retroativamente.
- **Pedido de exceção de categoria — “Outro motivo”:** o campo de explicação é contextual, preserva o valor em caso de erro e é validado no servidor antes da solicitação ser registrada.
- **Obras — tipo e gênero “Outro”:** os campos de detalhe são independentes, condicionais e validados. O tipo continua sendo “Outro”; o gênero personalizado não altera a lista canônica antes da análise. Um texto que corresponda a gênero já conhecido é normalizado para a opção existente, evitando duplicação da taxonomia.
- **Obras — papel principal “Outro crédito”:** identificado na varredura final da lista de opções. Agora revela uma especificação obrigatória de 2 a 80 caracteres, persistida separadamente como `funcao_detalhe` e exibida no catálogo e nos perfis. O papel canônico continua sendo “Outro crédito”.
- **Eventos — categoria “Outro”:** o campo de detalhe aparece ao selecionar a categoria e é validado antes da gravação. O detalhe é apresentado no evento sem substituir a categoria usada nos filtros.

Os scripts client-side habilitam, desabilitam e limpam os campos dependentes ao alternar as opções. As validações no servidor permanecem autoritativas. Para registros legados cujo valor genérico já existia sem detalhe, a edição continua tolerando o campo vazio; novas gravações que escolhem “Outro” precisam informar a especificação.

## Compatibilidade com schema e dados

A versão do schema permanece **v16**. A coluna aditiva `obras.funcao_detalhe` usa valor padrão vazio; a inicialização/reparo de bancos v16 anteriores adiciona a coluna sem remover registros nem alterar `PRAGMA user_version`. Os detalhes de tipo/gênero de obra e categoria de evento também permanecem em campos próprios, separados das opções canônicas. Não foi criada dependência externa.

## Correções encontradas durante os testes

- O re-render do perfil após uma resposta profissional inválida foi ajustado para fornecer os dados de notificações que o cabeçalho EJS utiliza, evitando novo `ReferenceError`/HTTP 500 no caminho de erro.
- Os testes verificam a mensagem de validação realmente apresentada e a preservação do estado enviado quando o formulário volta com erro.
- A edição de obras antigas cujo papel era “Outro crédito”, mas sem detalhe persistido, não passa a bloquear a atualização; o campo novo continua obrigatório para novos registros.

## Arquivos centrais alterados

- `src/app/controllers/controladorAutenticacao.ts`
- `src/app/controllers/controladorCompatibilidade.ts`
- `src/app/controllers/controladorEventos.ts`
- `src/app/models/bancoDados.ts`
- `src/app/models/questionarioAtuacao.ts`
- `src/app/validators/validarEvento.ts`
- `views/pages/cadastro.ejs`
- `views/pages/cadastro-obra.ejs`
- `views/pages/cadastro-evento.ejs`
- `views/pages/oportunidades.ejs`
- `views/pages/obras.ejs`
- `views/pages/perfil.ejs`
- `views/pages/perfil-publico.ejs`
- `views/partials/cartao-obra.ejs`
- `views/partials/componentes/editar-perfil-secoes.ejs`
- `views/partials/componentes/questionario-atuacao.ejs`
- `public/js/interacoes.js`
- `public/js/perfil-edicao.js`
- `public/js/questionario-atuacoes.js`
- `scripts/testar-admin-ui.mjs`
- `scripts/testar-banco.mjs`
- `scripts/testar-politicas-perfil.mjs`

## Validação executada

- `npm run check` — TypeScript aprovado.
- `npm run build` — build de produção aprovado.
- `npm run test:db` — migrações históricas até v16, adição idempotente de `funcao_detalhe`, governança, cooldown, taxonomia e filtros de privacidade aprovados.
- `npm run test:admin-ui` — renderização EJS, cadastro/perfil, moderação de propostas, categorias e gêneros, criação/edição de obras e eventos, salvamentos parciais, permissões e fluxo de exceção aprovados.
- `node --check` — scripts JavaScript de interface e testes aprovados.
- Chromium headless — campos condicionais de cadastro, proposta de categoria, gênero do perfil, perguntas dependentes, tipo/gênero/papel de obra e categoria de evento verificados em interação; campos ativos ficaram visíveis e obrigatórios. A validação HTTP cobre o motivo “Outro” no pedido de exceção.

## Organização dos relatórios

Esta é a melhoria **30**, correspondente à ordem atual. Os registros anteriores permanecem separados por ordem: `melhoria-28-cadastro-progressivo.md` e `melhoria-29-edicao-de-perfil-por-secoes.md` não foram consolidados neste arquivo.

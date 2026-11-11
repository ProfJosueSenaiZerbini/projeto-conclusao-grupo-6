# Melhoria 29 — Edição e apresentação do perfil por seções

## Objetivo

Reformular a edição de perfil existente para organizar os dados em áreas contextuais e reduzir a navegação por um formulário vertical extenso, preservando a arquitetura, o modelo de dados e as regras de negócio da Cypher.

## Organização da edição

A página existente passou a oferecer cinco áreas navegáveis:

1. **Informações pessoais:** nome artístico que já existia, cidade e biografia.
2. **Atuação profissional:** categorias, gêneros, status, equipamentos e questionários separados por categoria selecionada.
3. **Portfólio e experiência:** resumo de obras/créditos e atalhos para as páginas existentes de obras, beats e eventos/oportunidades.
4. **Privacidade e contato:** contato profissional e preferências de visibilidade já suportadas pelo sistema.
5. **Conta e segurança:** resumo dos dados de conta e links para as configurações existentes.

O perfil público e a página do titular foram reorganizados para uma apresentação editorial coerente com a identidade Cypher. A navegação evidencia a aba atual e apresenta somente seu painel; a estrutura usa abas acessíveis por teclado e se adapta a telas estreitas.

Os questionários exibidos acompanham as categorias selecionadas. Cada resposta é mantida sob sua categoria, e a edição de respostas não reconhece cargos nem concede capacidades. As mudanças de categoria continuam sujeitas ao cooldown de 60 dias, exceções aprovadas e auditoria existentes.

## Salvamentos e proteção contra perda de dados

Os dados editáveis são enviados por formulário/área. O backend mescla os campos efetivamente enviados com os valores persistidos, evitando que um campo omitido apague valores de outra seção. Contato e preferências de privacidade reutilizam endpoints e componentes existentes.

O JavaScript acompanha as mudanças por formulário, mostra marcadores de “Não salvo” na aba correspondente e mantém os rascunhos ao alternar entre abas. A saída da página avisa sobre alterações não salvas. Os estados de sucesso só são apresentados após o retorno do servidor.

As perguntas obrigatórias de uma categoria recém-adicionada são verificadas no cliente para orientar a pessoa, mas a validação definitiva permanece no servidor. Categorias já existentes não passam a exigir respostas retroativamente.

## Privacidade e segurança

A visibilidade pública continua sendo aplicada no servidor. O filtro de colaboradores limita a visualização dos dados permitidos a contas com crédito compartilhado em obra publicada; visitante externo não recebe dados privados. As preferências de perfil não substituem autorização do servidor.

Não foi criada migração de banco. Cooldown, exceções, snapshots/auditoria e schema v16 permanecem inalterados.

## Correções feitas durante a implementação

- Corrigidos os caminhos dos includes EJS aninhados no componente de edição, causa da falha HTTP 500 ao incluir questionários e preferências de privacidade.
- O redirect após salvar contato retorna à aba **Privacidade e contato**.
- O formulário de contato marca a mesma chave de seção da aba, fazendo o indicador de rascunho aparecer no lugar correto.
- O serializador compartilhado foi adaptado para manter o funcionamento tanto do cadastro progressivo quanto da edição profissional.

## Arquivos centrais

- `src/app/controllers/controladorCompatibilidade.ts`
- `src/app/controllers/controladorPerfis.ts`
- `src/app/routes/rotasCypher.ts`
- `views/pages/perfil.ejs`
- `views/pages/perfil-publico.ejs`
- `views/pages/configuracoes.ejs`
- `views/partials/componentes/editar-perfil-secoes.ejs`
- `views/partials/componentes/preferencias-privacidade-perfil.ejs`
- `views/partials/componentes/questionario-atuacao.ejs`
- `public/js/perfil-edicao.js`
- `public/js/questionario-atuacoes.js`
- `public/css/perfil.css`
- `scripts/testar-admin-ui.mjs`

## Limitações explícitas

Não foram apresentados controles sem suporte real no backend: upload de foto de perfil ou capa, campos separados de nome civil e artístico, alteração de e-mail ou senha e gerenciamento de sessões não foram adicionados a esta página. A administração de obras, beats e eventos continua nos destinos próprios, sem duplicar cadastros de conteúdo.

## Validação executada

- `npm run check` e `npm run build` — TypeScript/build aprovados.
- `npm run test:db` — schema v16, cooldown, governança e filtros de privacidade aprovados.
- `npm run test:admin-ui` — renderização EJS, autorização, salvamentos HTTP e preservação dos valores de outras seções aprovados.
- Chromium — alternância entre painéis, questionários Rapper/DJ, rascunhos pessoal e contato, temas claro/escuro e viewports de 360px/390px verificados; sem rolagem horizontal nos viewports móveis testados.

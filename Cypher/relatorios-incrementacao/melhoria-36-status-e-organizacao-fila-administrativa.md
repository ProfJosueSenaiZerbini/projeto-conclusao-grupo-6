# Melhoria 36 — Status e organização da fila administrativa

## Objetivo

Deixar mais intuitiva a leitura das filas de solicitações de exceção de categoria, distinguindo pedidos que aguardam análise, pedidos que aguardam resposta e decisões já concluídas.

## Alterações realizadas

Na fila de pendentes, cada pedido agora exibe um marcador textual de estado: **Aguardando análise da equipe** ou **Aguardando resposta do profissional**. A navegação foi simplificada para **Pendentes** e **Decididos**, com descrições auxiliares e contadores. Durante uma solicitação de esclarecimento, a interface explica que a decisão está pausada até o retorno do profissional.

No histórico, foram adicionados filtros acessíveis para **Todas**, **Aprovadas** e **Recusadas**, com contadores e mensagem de ausência de resultados. Os controles são responsivos e receberam estados de foco, contraste para tema claro/escuro e consideração para redução de movimento. A classificação não altera status, decisões, prazos, autorizações nem auditoria.

Ao testar a apresentação do estado mais recente, identificou-se que mensagens de um mesmo segundo eram desempatatadas por UUID aleatório. As consultas do histórico e de última mensagem passaram a usar `rowid` como desempate pela ordem de inserção, mantendo timestamps como ordenação primária. Isso faz com que o status exibido, a pausa de decisão após esclarecimento e a conversa registrada usem a mensagem realmente mais recente. Não houve alteração de schema.

## Arquivos

- `views/pages/admin-revisao.ejs`
- `public/css/configuracoes.css`
- `public/js/interacoes.js`
- `src/app/models/bancoDados.ts`
- `scripts/testar-admin-ui.mjs`

## Verificação

Foram executados `npm run build`, `npm run test:db` e `npm run test:admin-ui`; todos passaram. A suíte de integração confirma os marcadores de estados pendentes, o pedido de esclarecimento, a impossibilidade de decidir antes da resposta, o retorno à análise após a resposta e os filtros de histórico para aprovadas/recusadas. Nenhuma dependência foi adicionada e nenhuma regra de negócio foi alterada.

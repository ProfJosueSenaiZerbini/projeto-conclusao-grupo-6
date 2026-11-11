# Melhoria 32 — Histórico separado de solicitações de exceção

## Objetivo

Evitar confusão entre pedidos ainda aguardando análise e decisões já tomadas pela equipe, preservando o histórico administrativo e a justificativa registrada.

## Alterações

Na seção **Exceções de categorias** do painel Administrador, foram adicionadas duas subabas: **Pendentes** e **Aprovados e recusados**. A fila pendente continua listando apenas solicitações com status `pendente`. A nova aba mostra os pedidos já decididos, com estado, datas de envio e decisão, dados da alteração solicitada, justificativa da equipe e conversa registrada quando existente.

Após aprovar ou recusar um pedido, o redirecionamento abre diretamente a aba de decisões. Os registros não são apagados: permanecem nas tabelas de solicitações, exceções, histórico e auditoria conforme aplicável. O novo comportamento separa visualmente os estados e mantém rastreabilidade, sem alterar a regra de aprovação, a autorização de uso único ou o prazo de 60 dias.

O carregamento do histórico reutiliza o filtro de privacidade existente para as respostas de atuação compartilhadas com o revisor; não expõe respostas privadas novas. As solicitações aparecem ordenadas pelas decisões mais recentes.

## Arquivos alterados

- `src/app/models/bancoDados.ts` — consulta de solicitações pendentes ou decididas, com status, justificativa e data de revisão.
- `src/app/controllers/controladorCompatibilidade.ts` — preparação das duas coleções e encaminhamento pós-decisão para a aba histórica.
- `views/pages/admin-revisao.ejs` — subabas, lista de decisões e estados vazios acessíveis.
- `public/css/configuracoes.css` — estilos dos estados aprovado/recusado, adaptação móvel e tema escuro.
- `scripts/testar-admin-ui.mjs` — regressões de ausência dos pedidos na fila pendente, presença no histórico e redirect após decisão.

## Validação

- `npm run check` — TypeScript aprovado.
- `npm run build` — build aprovado.
- `npm run test:db` — migrações, cooldown, governança, taxonomia e privacidade aprovados.
- `npm run test:admin-ui` — cenários de aprovação/recusa, redirect, fila pendente e aba histórica aprovados.
- `node --check scripts/testar-admin-ui.mjs` — sintaxe aprovada.

## Limites

A aba histórica exibe decisões de exceções de categoria; não implementa exclusão física nem controles para apagar o histórico. Isso é intencional para preservar a trilha de auditoria e evitar que aprovações deixem de ter justificativa rastreável.

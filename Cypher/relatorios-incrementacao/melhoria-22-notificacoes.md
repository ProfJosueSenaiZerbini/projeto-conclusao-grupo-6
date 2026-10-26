# Melhoria 22 — Núcleo e interface de notificações

## Escopo realizado

A Cypher passou a ter notificações persistentes no SQLite e um centro visual reutilizável na barra superior. A implementação não cria notificações fictícias para preencher a interface. Os registros são gerados apenas depois de ações reais concluídas.

O schema foi atualizado da versão 7 para a versão 8 com a tabela `notificacoes`, índices por destinatário/data e destinatário/estado de leitura, vínculo por usuário e chave de origem para evitar duplicações acidentais.

## Ações que geram notificações

A criação e a atualização de obras geram notificações para o próprio usuário. A criação e a atualização de Beats também geram notificações, assim como a criação e a atualização de eventos pelo organizador responsável. Cada registro contém tipo, título, mensagem, URL segura definida pelo servidor, entidade relacionada, estado de leitura e data.

## Interface

A barra superior recebeu um partial reutilizável com botão de sino, contador de não lidas, popover de notificações recentes, estado vazio, destaque visual para não lidas e link para `/notificacoes`. O popover fecha com Escape, clique fora e usa `aria-expanded` e `aria-controls`.

A página `/notificacoes` mostra o histórico, diferencia itens lidos e não lidos, permite marcar individualmente e permite marcar todas como lidas. A visualização foi adicionada ao tema estrutural existente, com adaptação para telas menores e temas claro/escuro.

## Segurança e autorização

Todas as consultas filtram pelo usuário destinatário. Marcar uma notificação como lida só altera registros pertencentes ao usuário da sessão. Os endpoints da página, da leitura individual e da leitura coletiva foram incluídos no middleware de autorização. A rota estática de leitura coletiva foi posicionada antes da rota dinâmica de ID para evitar colisão de roteamento.

## Validações

O projeto passou por `npm run check`, `npm run build` e `node --check public/js/interacoes.js`. Em banco temporário, o schema iniciou na versão 8, uma obra real gerou uma notificação, `/notificacoes` respondeu HTTP 200 e a ação de marcar todas como lidas respondeu com redirecionamento HTTP 302 e reduziu o total de não lidas para zero.

# Melhoria 37 — Camada do cabeçalho e notificações

## Problema observado

Ao abrir o centro de notificações, seu painel usava `z-index: 30`, mas a barra superior não tinha uma camada explícita. Como `.topbar` aplica `backdrop-filter`, ela forma um contexto de empilhamento; o `z-index` do popover só ordenava elementos dentro desse contexto e não protegia o cabeçalho contra o conteúdo posterior da página. Assim, títulos/cards podiam ser pintados acima do painel, especialmente quando a largura CSS efetiva mudava com zoom.

## Correção

- Em `public/css/estrutura.css`, a `.topbar` passou a ter `position: relative` e `z-index: 35`, criando uma camada previsível acima do conteúdo e mantendo o popover contido no cabeçalho.
- O nível 35 preserva a hierarquia global: popover 30 abaixo do cabeçalho; overlay móvel 41 acima do cabeçalho; sidebar móvel 42 acima do overlay; modal 50 e toast 100 também acima do cabeçalho.
- Em `scripts/testar-admin-ui.mjs`, foi adicionado um teste de contrato CSS para impedir regressões dessa hierarquia.

## Validação

A compilação (`npm run build`), teste de banco e migrações, teste de políticas/privacidade e teste de integração administrativa passaram.

Também foi feita verificação headless com Chromium, usando as folhas CSS reais e um painel de notificação sobre conteúdo de administrador. O hit-test confirmou que o popover vence o conteúdo e que o overlay móvel permanece sobre a barra superior nos viewports CSS efetivos de 1920, 1100, 900, 560 e 500 px (o último foi solicitado com janela nominal de 390 px; o Chromium headless deste ambiente aplicou largura útil de 500 px). A mudança não adiciona dependências e não altera a lógica de notificações.

# Melhoria 31 — Correção da sobreposição entre Perfil e CypherID

## Problema identificado

No perfil próprio, o hero/cartão principal invadia visualmente a faixa CypherID. A inspeção do layout real no Chromium confirmou uma colisão vertical de 8–10 px entre 768 px e 1440 px. Em larguras móveis não havia colisão efetiva, mas o espaçamento dependia de margens negativas distintas por breakpoint.

## Alteração

Em `public/css/perfil.css`, removi a margem superior negativa do CypherID: `-22px` no estilo base e `-8px` na regra móvel passaram a zero. Mantive a indentação lateral do cartão. O espaçamento vertical agora vem do `gap` do grid, preservando a composição visual sem sobrepor os cartões.

## Validação

Após a alteração, medi novamente os limites dos elementos no Chromium e confirmei ausência de sobreposição e de rolagem horizontal nas larguras 1440, 1024, 900, 768, 700, 390 e 360 px. As folgas verticais observadas foram 14 px em 1440/1024 px, 12 px em 900/768 px e 11 px em 700/390/360 px.

Também foram aprovados `npm run check`, `npm run build` e `npm run test:admin-ui`. As capturas desktop e móvel foram inspecionadas para verificar que o espaçamento permaneceu coerente com o layout existente.

## Escopo preservado

A correção limita-se ao espaçamento do cartão CypherID no perfil. Não altera conteúdo, regras de negócio, dados, navegação, identidade visual ou formulários de edição.

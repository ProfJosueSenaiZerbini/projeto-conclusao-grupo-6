# Melhoria 34 — Mês visível nos cards de Oportunidades

## Problema

A listagem de eventos renderizava a data abreviada de `Intl.DateTimeFormat` dividindo a string por espaços. Em pt-BR, o formato abreviado produzido incluía a preposição `de` (por exemplo, `12 de mar.`), então o card mostrava `12` e `de` em vez do mês.

## Alteração

Em `src/app/controllers/controladorEventos.ts`, a formatação agora extrai explicitamente as partes `day` e `month` de `formatToParts` e gera `12 MAR`, sem depender da separação textual localizada. O card da coluna esquerda passa assim a mostrar dia e mês; o atributo usado pelo modal também mantém o mês legível. Datas não conformes ao formato ISO esperado continuam sendo retornadas sem transformação.

Em `scripts/testar-admin-ui.mjs`, a fixture usa a data `2026-03-12` e a integração verifica que o card mostra `12` e `MAR` na área `.event-date-large`.

## Validação

- `npm run check` — TypeScript aprovado.
- `npm run build` — build aprovado.
- `npm run test:admin-ui` — teste de integração HTTP aprovado, incluindo a asserção para 12 MAR.
- `node --check scripts/testar-admin-ui.mjs` — sintaxe aprovada.

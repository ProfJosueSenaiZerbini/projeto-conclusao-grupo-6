# Melhoria 13 — Auditoria e harmonização visual do frontend

**Data:** 24 de outubro de 2026  
**Escopo:** revisar o frontend do Cypher com foco em alinhamento, contraste, responsividade, estados com poucos resultados e coerência entre temas.

## Correções realizadas

### Oportunidades

- O grid de eventos passou a declarar explicitamente `min-width: 0` e `align-content: start`, evitando distribuição estranha do conteúdo quando existe somente um evento.
- A lista com um único resultado recebe a classe `events-list-single` para manter o card ocupando corretamente a coluna disponível.
- O conteúdo do card recebeu altura mínima equilibrada, sem depender de espaços vazios acidentais.
- O texto de ação do card pode truncar sem empurrar os demais elementos para fora do layout.
- Quando uma aba não possui eventos, agora aparece um estado vazio específico informando que não há eventos naquela categoria e orientando o usuário a escolher outra aba ou limpar os filtros.
- O filtro por abas passou a contar os cards visíveis e controlar o estado vazio dinamicamente.
- O estado vazio dinâmico só é renderizado quando existem eventos na consulta inicial, evitando duplicação com o estado vazio do servidor.

### Tema escuro e contraste

- Foram adicionados overrides específicos para abas, cards, filtros, metadados, links de gerenciamento e feedbacks da página de Oportunidades.
- Bordas, superfícies e textos secundários receberam tons mais legíveis no tema escuro.
- Estados de sucesso e erro deixaram de depender de fundos claros incompatíveis com o tema escuro.
- O estado vazio de filtro recebeu superfície, borda, ícone e texto compatíveis com o modo escuro.

### Responsividade e acessibilidade visual

- O card de evento mantém espaçamento mínimo em telas pequenas.
- O hint de abertura não força largura excessiva no card.
- O estado vazio usa hierarquia visual, texto explicativo e ícone, sem depender apenas de cor.
- A interação existente por teclado e `aria-pressed` dos filtros foi preservada.

## Arquivos alterados

- `views/pages/oportunidades.ejs`
- `public/js/interacoes.js`
- `public/css/oportunidades.css`
- `public/css/tema.css`
- `ANALISE-PROJETO.md`

## Alterações estruturais no banco

**Nenhuma.**

Nesta melhoria não foram criadas, removidas ou alteradas tabelas, colunas, índices, constraints ou versões do schema. O banco permanece no schema SQLite v6.

## Validações

- `npm run format` — concluído.
- `npm run format:views` — concluído.
- `npm run check` — concluído sem erros.
- `npm run build` — concluído.
- Smoke HTTP de `/events` — redirecionamento esperado para `/login` sem sessão.
- Smoke HTTP de `/login` — status 200.
- Aplicação iniciada em `http://localhost:3000` após recompilação local do `better-sqlite3`.
- Verificação de whitespace/diff — sem alterações inválidas nos arquivos editados.

## Pendências visuais futuras

A auditoria desta etapa priorizou Oportunidades, filtros, cards e temas. Ainda podem ser feitas rodadas específicas para formulários, dashboard, perfil, banco de Beats, navegação superior e notificações quando esse domínio for implementado.

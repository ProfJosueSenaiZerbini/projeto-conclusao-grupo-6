# Melhoria 15 — Refino do cadastro no tema escuro

**Data:** 24 de outubro de 2026  
**Escopo:** corrigir a baixa legibilidade das categorias e dos campos observada na tela de cadastro em tema escuro.

## Problema identificado

As opções de categoria continham um `span` com cor oliva definida por uma regra genérica do tema claro. Essa regra tinha precedência visual sobre a cor herdada do card e deixava os nomes das categorias quase invisíveis contra o fundo verde escuro.

## Correções realizadas

Os nomes das categorias agora usam um tom claro esverdeado no tema escuro, enquanto o indicador de seleção usa um verde-lima claro. O título “Suas categorias” e sua explicação receberam hierarquia própria, com contraste diferente para título e texto auxiliar.

Os campos do formulário receberam bordas mais visíveis, fundo ligeiramente separado do painel, placeholders mais claros e foco com halo verde-lima discreto. A correção preserva a paleta Jamaica e não transforma o cadastro em uma interface branca ou excessivamente brilhante.

## Arquivos alterados

- `public/css/autenticacao.css`
- `public/css/tema.css`
- `ANALISE-PROJETO.md`

## Alterações estruturais no banco

**Nenhuma.** Não foram criadas, removidas ou alteradas tabelas, colunas, índices, constraints ou migrações. O schema permanece na versão 6.

## Validações

- `npm run format` — concluído.
- `npm run format:views` — concluído.
- `npm run check` — concluído sem erros.
- `npm run build` — concluído.

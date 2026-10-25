# Melhoria 14 — Contraste dos temas, autenticação e sidebar

**Data:** 24 de outubro de 2026  
**Escopo:** corrigir inversões de contraste nos botões, com prioridade para login e cadastro, revisar combinações de texto e fundo no frontend e harmonizar o sidebar com a área principal.

## Problema identificado

No tema escuro, o token `--ink` é claro porque representa o texto principal. Algumas classes de botão, porém, usavam esse mesmo token como fundo e `--white` como texto. Isso invertia a semântica visual: superfícies claras podiam receber texto claro e superfícies escuras podiam receber texto escuro.

## Correções realizadas

A regra visual agora é explícita: botões verdes ou amarelos, que são superfícies claras e vibrantes da paleta inspirada na bandeira da Jamaica, usam texto preto/verde muito escuro. Botões de fundo preto ou verde profundo usam texto claro.

Foram corrigidos globalmente os botões `button-lime`, `button-yellow`, `button-dark` e `button-outline`. Também foram adicionados ajustes específicos para os botões do painel de autenticação, incluindo login, cadastro, acesso demonstrativo e ações auxiliares.

Na autenticação, também foram harmonizados os estados de opção selecionada, botão outline, hover, campos e mensagens, preservando o verde profundo, o verde-lima, o amarelo e o preto como cores principais.

O sidebar claro passou a usar um verde profundo ligeiramente menos agressivo. No tema escuro, sua superfície foi definida como `#0b120c`, enquanto a área principal permanece em tom próximo de `#111710`. Assim, o sidebar fica discretamente mais escuro que o conteúdo, sem criar uma ruptura visual dramática. O item ativo continua em verde-lima com texto escuro de alto contraste.

## Contraste calculado

As combinações principais foram verificadas por luminância relativa:

| Combinação | Contraste aproximado |
|---|---:|
| Texto escuro sobre verde-lima | 14,34:1 |
| Texto escuro sobre amarelo | 13,11:1 |
| Texto claro sobre botão escuro | 17,30:1 |
| Texto escuro sobre superfície clara | 18,43:1 |
| Texto claro sobre outline escuro | 15,78:1 |

## Arquivos alterados

- `public/css/tema.css`
- `public/css/autenticacao.css`
- `public/css/estrutura.css`
- `ANALISE-PROJETO.md`

## Alterações estruturais no banco

**Nenhuma.** Esta melhoria alterou somente CSS e documentação. Não foram criadas, removidas ou alteradas tabelas, colunas, índices, constraints ou migrações. O schema permanece na versão 6.

## Validações

- `npm run format` — concluído.
- `npm run format:views` — concluído.
- `npm run check` — concluído sem erros.
- `npm run build` — concluído.
- Verificação de contraste das combinações principais — concluída.

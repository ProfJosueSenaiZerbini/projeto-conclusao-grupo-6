# Melhoria 33 — Contraste do hover na navbar lateral

## Objetivo

Manter perceptível qual item da navegação lateral está selecionado e melhorar a legibilidade quando o cursor passa sobre ele.

## Alteração

Em `public/css/estrutura.css`, adicionei um estado de hover/foco específico para links ativos da sidebar. No tema claro, o preenchimento passa de verde-limão para verde escuro com texto claro; um contorno interno verde-limão de 2 px mantém a distinção visual do item selecionado. No tema escuro, o mesmo princípio usa um preenchimento um pouco mais claro que o fundo da sidebar, texto claro e contorno verde-limão.

O ajuste limita-se à navbar lateral; não altera as abas do painel administrativo nem o comportamento de navegação.

## Validação

Inspecionei o estado computado em Chromium após aguardar a transição CSS, no tema claro e no escuro. O hover ativo apresentou, respectivamente, fundos RGB `38, 53, 31` e `52, 74, 45`, texto claro e contorno interno RGB `213, 239, 116`. A instância usada foi isolada e conectada a banco temporário.

## Arquivos

- `public/css/estrutura.css` — estilos de hover/foco para links ativos da navbar nos dois temas.

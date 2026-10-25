# Melhoria 17 — refino visual, temas e responsividade

**Data:** 24 de outubro de 2026  
**Escopo:** interface, CSS e views EJS  
**Banco:** nenhuma alteração; schema permanece na versão 6

## Objetivo

Corrigir os pontos visuais indicados nas referências: sidebar escuro mesmo no tema claro, excesso de repetição na tela de configurações, cards sem personalidade suficiente, estados vazios pouco destacados e comportamento irregular em telas estreitas.

## Alterações realizadas

### Sidebar e temas

O sidebar agora possui uma superfície própria para cada tema:

- tema claro: verde muito claro, texto escuro, bordas suaves e hover claro;
- tema escuro: verde profundo, texto claro e contraste preservado;
- item ativo continua usando lime, com texto escuro nos dois temas;
- reputação, usuário, logo, workspace e navegação acompanham o tema;
- sombra e overlay mobile foram ajustados para não parecerem um bloco preto permanente.

### Perfil

O cartão de destaque lateral recebeu uma composição mais viva, com gradiente lime/amarelo, círculos decorativos discretos e sombra suave. O objetivo é tirar a sensação de bloco vazio sem inserir imagem pesada ou poluir o conteúdo.

Estados vazios do perfil passaram a usar superfície elevada e borda sólida suave. A interação dos links de obras foi mantida, mas o hover agora cria uma leitura mais clara da linha ativa.

### Configurações

A numeração ficava repetida no índice lateral e dentro de cada seção. A numeração permanece no índice, que funciona como navegação, e os títulos internos agora usam apenas o nome da área:

- Conta;
- Perfil profissional;
- Privacidade e visibilidade;
- Descoberta;
- Aparência;
- Ajuda e sobre.

O índice recebeu uma moldura leve, sem competir com os cartões de conteúdo. Os botões de tema passaram a indicar visualmente a escolha atual com lime e sombra discreta.

### Banco de Beats

Os cards receberam:

- elevação suave e movimento mínimo no hover;
- arte com gradientes e linhas mais consistentes;
- rodapé alinhado ao fim do card;
- melhor comportamento em celular;
- distinção entre registros demonstrativos (`DEMO`) e beats reais (`CYPHER`);
- correção textual de `por <produtor>`.

A funcionalidade de player continua demonstrativa, conforme o escopo atual do projeto.

### Obras

O resumo de obras em andamento ganhou uma textura visual leve para evitar a aparência de caixa vazia. Filtros e estados sem registros receberam superfícies mais coerentes com os dois temas.

Em telas médias, os filtros passam para duas colunas; em telas pequenas, passam para uma coluna e o botão ocupa toda a largura.

### Responsividade

Foram ajustados:

- espaçamento lateral em telas estreitas;
- largura e quebra dos botões de perfil;
- identificação pública do perfil em celular;
- títulos grandes em viewport pequeno;
- ações dos cards de beats;
- filtros do catálogo;
- sombra do sidebar móvel.

## Arquivos alterados

- `public/css/estrutura.css`
- `public/css/perfil.css`
- `public/css/banco-beats.css`
- `public/css/obras.css`
- `public/css/configuracoes.css`
- `public/css/responsivo.css`
- `views/pages/configuracoes.ejs`
- `views/pages/banco-beats.ejs`

## Validação

- `npm run check`: passou;
- `npm run build`: passou;
- `node --check public/js/interacoes.js`: passou;
- servidor inicializou com SQLite temporário;
- `/login` e `/register`: 200;
- perfil público inexistente: 404 esperado;
- todos os CSS alterados foram servidos com 200;
- nenhuma alteração em rotas, controllers, models, validators ou schema SQLite.

## Direção visual mantida

A melhoria preserva a identidade do Cypher: verde profundo, lime, amarelo, tipografia editorial e linguagem de plataforma profissional da cena musical underground. O tema claro não é uma inversão genérica do escuro; ele possui uma navegação verde clara própria, mantendo a mesma personalidade visual.

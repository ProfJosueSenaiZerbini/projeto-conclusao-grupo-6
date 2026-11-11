# Melhoria 47 — Catálogo visual no cadastro e na edição

## Escopo executado

A etapa 8 levou o catálogo profissional canônico para a interface de cadastro e edição de perfil. A seleção visual agora é organizada pelos sete grupos oficiais e apresenta as 36 profissões estáveis do catálogo, sem depender da lista curta de categorias históricas.

Os grupos são: Música, Dança, Artes visuais, Audiovisual, Produção técnica, Gestão e produção e Comunicação e cultura.

## Cadastro

A tela `/register` agora apresenta cada grupo como uma seção própria e cada profissão como uma opção selecionável com seu rótulo canônico. A navegação progressiva existente continua funcionando: a pessoa informa os dados da conta, seleciona uma ou mais profissões e responde apenas aos questionários correspondentes às profissões selecionadas.

Os questionários são montados a partir dos IDs do catálogo e renderizados para as 36 profissões. A interface continua usando o JavaScript existente para esconder questionários não selecionados, navegar pergunta a pergunta, controlar progresso e serializar respostas e visibilidades.

## Edição de perfil

A seção de atuação profissional passou a usar a mesma estrutura agrupada do cadastro. A solicitação excepcional de mudança de categorias também usa os sete grupos, evitando que a tela de edição tenha uma taxonomia visual diferente da tela de entrada.

Os rótulos históricos permanecem aceitos somente no backend para leitura de perfis já existentes e para não quebrar fixtures ou dados antigos. Eles não são oferecidos como novas opções na interface. A classificação de conta organizador reconhece tanto o rótulo canônico `Organizador(a) de eventos` quanto o alias histórico.

## Estilo

Foram adicionados estilos específicos para grupos e subgrades de profissões em `autenticacao.css` e `perfil.css`. A organização visual mantém a seleção em cartões, melhora a leitura por grupo e preserva o layout responsivo já existente.

## Testes

- A rota de cadastro renderizou HTTP 200 com os sete grupos: `musica`, `danca`, `artes-visuais`, `audiovisual`, `producao-tecnica`, `gestao-producao` e `comunicacao-cultura`.
- `npm run check` — passou.
- `npm run build` — passou.
- `npm run test:admin-ui` — passou.
- `npm run test:questionnaires` — passou.
- `npm run test:profile-relations` — passou.
- `npm run test:relations` — passou.
- `npm run test:db` — passou.

## Próximo passo

A próxima etapa deve finalizar o onboarding progressivo e a edição contextual, refinando o comportamento visual de seleção, estados vazios, contagem de profissões selecionadas e experiência de respostas por grupo sem alterar as regras server-side já protegidas.

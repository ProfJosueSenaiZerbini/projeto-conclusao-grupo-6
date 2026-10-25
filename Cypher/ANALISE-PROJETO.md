# Análise técnica do projeto Cypher

**Pacote analisado:** `cypher-etapa-08.zip`  
**Estado analisado:** Etapas 0–8 concluídas; schema SQLite v6.  
**Data da análise:** 15 de outubro de 2026.

## 1. Visão geral

Cypher é uma aplicação web para profissionais da cena musical underground. A stack é:

- Node.js 20+;
- TypeScript em modo estrito;
- Express 4;
- EJS para renderização server-side;
- SQLite local via `better-sqlite3`;
- JavaScript vanilla no navegador;
- CSS modular por área, com tema claro/escuro e responsividade;
- arquitetura MVC sem framework adicional.

Contas reais mantêm um UUID interno e também recebem um ID Cypher público imutável no formato `CYP-{INICIAIS}{NÚMERO}`. O acesso fantasma usa `CYP-FANTASMA`; contas demonstrativas restantes usam códigos `CYP-DEMO####` e não consomem a sequência real.

O servidor inicia o SQLite antes de aceitar requisições, carrega fixtures demonstrativas de forma idempotente e depois registra as rotas Express.

## 2. Estrutura e responsabilidades

```text
cypher/
├── src/aplicacao.ts                 # bootstrap Express, ícones, middleware e listen
├── src/app/routes/rotasCypher.ts    # mapa de rotas HTTP
├── src/app/controllers/             # respostas EJS/JSON por domínio
│   ├── controladorCypher.ts         # fachada de compatibilidade
│   ├── controladorCompatibilidade.ts # implementação histórica isolada
│   ├── controladorAutenticacao.ts
│   ├── controladorDashboard.ts
│   ├── controladorPerfis.ts
│   ├── controladorObras.ts
│   ├── controladorEventos.ts
│   ├── controladorBeats.ts
│   ├── controladorConfiguracoes.ts
│   └── controladorCompartilhado.ts
├── src/app/validators/              # validações puras por domínio
├── src/app/models/                  # persistência, domínio e autenticação
│   ├── bancoDados.ts                # schema, migrações e queries SQLite
│   ├── autenticacaoCypher.ts        # scrypt, tokens e ciclo de sessão
│   ├── modeloCypher.ts              # fachada do domínio + fixtures
│   └── modeloPerfil.ts              # categorias e status profissionais
├── views/pages/                     # páginas EJS
├── views/partials/                  # cabeçalho, barras e shell compartilhado
│   └── componentes/estado-vazio.ejs # estados vazios acessíveis e responsivos
├── public/css/                      # base, componentes, áreas, tema e responsivo
├── public/js/interacoes.js          # modais, menu, tema, filtros e campos dinâmicos
├── scripts/                         # formatação EJS/CSS
└── data/cypher.sqlite               # criado em runtime; ignorado pelo Git
```

A fachada `CypherModel` evita que as views conheçam o SQLite diretamente. O controller chama o model, transforma os dados em formato de apresentação e renderiza a view.

As rotas são compostas por entry points separados por domínio. `controladorCypher.ts` permanece como fachada para imports históricos, enquanto `controladorCompatibilidade.ts` isola a implementação anterior durante a migração incremental. As regras puras extraídas ficam em `src/app/validators/`; autorização, chamadas ao model e respostas HTTP continuam nos controllers.

## 3. Inicialização e ciclo de uma requisição

1. `src/aplicacao.ts` chama `inicializarDadosDemonstrativos()`.
2. `modeloCypher.ts` monta pessoas, eventos, beats e obras de demonstração.
3. `bancoDados.ts` cria o diretório/arquivo SQLite, ativa `foreign_keys` e `busy_timeout`, aplica schema/migrações e semeia fixtures.
4. Express configura `trust proxy = 1`, body parsers, arquivos estáticos, EJS e as rotas.
5. `middlewareAutorizacao` resolve o cookie `cypher_session` contra a tabela `sessoes` antes das rotas protegidas.
6. O controller busca dados do usuário e do domínio, valida entradas e renderiza EJS.
7. O browser executa `public/js/interacoes.js` para comportamento visual e interações sem persistência adicional.

## 4. Rotas atuais

| Método | Rota | Estado | Função |
|---|---|---|---|
| GET | `/login`, `/register` | funcional | telas de autenticação |
| POST | `/login` | funcional | autenticação e criação de sessão |
| POST | `/register` | funcional | cadastro de usuário/perfil |
| POST | `/logout` | funcional | revogação da sessão |
| POST | `/categories/analyze` | demonstrativo | pré-análise simulada de categoria |
| GET | `/`, `/dashboard` | funcional + dados demo | visão geral |
| GET | `/search` | funcional | busca persistida de perfis públicos |
| GET | `/events` | funcional | descoberta de eventos reais e demonstrativos, com filtros |
| GET/POST | `/events/new` | funcional | criação de evento por organizador |
| GET/POST | `/events/:id/edit` | funcional | edição do próprio evento |
| POST | `/events/:id/delete` | funcional | exclusão do próprio evento |
| GET/POST | `/works`, `/works/new` | funcional | catálogo e criação de obras |
| GET/POST | `/works/:id/edit` | funcional | edição própria, com autorização por proprietário |
| POST | `/works/:id/delete` | funcional | exclusão própria |
| GET | `/beats` | funcional | descoberta de beats demonstrativos e reais |
| GET/POST | `/beats/new` | funcional | cadastro persistente de beat |
| GET/POST | `/beats/:id/edit` | funcional | edição própria, com autorização por proprietário |
| POST | `/beats/:id/delete` | funcional | exclusão própria |
| GET | `/central` | funcional como conteúdo | FAQ/Cypher Central |
| GET/POST | `/profile` | funcional | edição do próprio perfil |
| GET/POST | `/settings` e `/settings/privacy` | funcional | preferências e privacidade |
| POST | `/settings/delete-account` | funcional com pré-condições | encerramento da própria conta |
| GET | `/p/:identificador` | funcional | perfil público, respeitando privacidade |

As rotas protegidas são verificadas tanto no middleware global quanto, em operações sensíveis, no controller. Contas demonstrativas podem navegar, mas recebem `403` em operações de escrita.

## 5. Banco de dados e integridade

O schema atual é a versão **6**. As tabelas são:

- `usuarios`: identidade, e-mail, hash de senha, tipo de conta, flag de demonstração, ID público e número sequencial;
- `perfis`: dados profissionais, categorias/gêneros/equipamentos serializados como JSON, status e flags de visibilidade;
- `obras`: catálogo do proprietário, metadados, letra, códigos, data, link e estado de publicação;
- `creditos`: créditos ligados a usuário ou menções textuais sem perfil;
- `eventos`: estrutura preparada para eventos, atualmente apenas fixtures;
- `beats`: beats demonstrativos e registros reais com dados técnicos, condições de uso e modo de venda exclusiva;
- `ofertas_beats`: uma ou mais ofertas ativas por Beat, com tipo de licença, preço opcional em centavos e descrição;
- `sessoes`: hash SHA-256 do token, usuário e expiração.

A tabela `sequencias` controla o próximo número de contas reais dentro da transação de criação. Exclusões não liberam números para reutilização.

Relacionamentos relevantes:

- perfil pertence a usuário e é removido em cascata;
- obra pertence a usuário com `ON DELETE RESTRICT`;
- crédito pertence a obra com `ON DELETE CASCADE`;
- crédito ligado a usuário usa `ON DELETE SET NULL` para preservar o nome textual após exclusão;
- eventos e beats também bloqueiam exclusão do usuário enquanto forem próprios.

As migrações são incrementais e condicionais. A v2 adicionou categorias e sessões; a v3 adicionou equipamentos/privacidade; a v4 adicionou gênero, letra, data de lançamento e link de escuta das obras; a v5 adicionou o ID público e a sequência de contas reais; a v6 adicionou a tabela `ofertas_beats` e a flag `venda_exclusiva` nos Beats. Beats existentes recebem uma oferta legada derivada da licença e das condições anteriores, sem preço.

Fixtures são marcadas com `demonstracao = 1`, atualizadas por conflito apenas quando continuam demonstrativas e não substituem registros reais.

## 6. Autenticação e autorização

- Cadastro exige nome, e-mail, senha e categoria válida.
- E-mail é normalizado para minúsculas e possui índice único case-insensitive para contas reais.
- Senha usa `scrypt` nativo, sal aleatório de 16 bytes e parâmetros armazenados no hash.
- Login cria token aleatório de 32 bytes em base64url.
- Somente SHA-256 do token vai para o banco.
- Sessão dura 24 horas e uma sessão anterior é revogada no novo login do mesmo navegador.
- Cookie é `HttpOnly`; usa `SameSite=Lax` em HTTP e `SameSite=None; Secure` quando `req.secure` é verdadeiro.
- O atalho OG Emicê exige `CYPHER_ALLOW_OG_ACCESS=true` e nunca funciona em produção.
- O e-mail de acesso não é exposto no perfil público.

## 7. Perfil, descoberta e privacidade

O perfil pessoal armazena nome artístico, cidade, biografia, contato, categorias, gêneros, equipamentos e disponibilidade. As opções de status são derivadas das categorias e revalidadas no servidor.

Novas contas começam com:

- perfil público desativado;
- localização oculta;
- contato oculto.

A busca `/search` consulta somente contas pessoais publicadas, exclui o próprio usuário, não seleciona dados privados e filtra por texto, categoria, gênero e localização pública. `/p/:identificador` retorna 404 para perfil privado, conta interna ou slug inválido.

## 8. Obras e créditos

O CRUD de obras é persistente, transacional e limitado ao proprietário autenticado. Os tipos são `Obra`, `Música`, `Beat`, `Single`, `EP`, `Álbum`, `Mixtape` e `Outro`. Gênero, status e papel principal usam listas permitidas.

O formulário de obras agora começa com uma seleção visual contextual entre Música, Single, EP, Álbum, Beat e Outro. A view continua única e reutilizável, enquanto `interacoes.js` adapta orientações, títulos de seção e visibilidade de campos já existentes. O tipo escolhido continua sendo enviado pelo campo persistido original, preservando compatibilidade com rotas, controller e registros anteriores. A etapa não adiciona ainda campos de capa, áudio, licença detalhada, samples ou tracklist.

Validações principais:

- título: 2–120 caracteres;
- descrição: até 500;
- letra: até 5.000;
- BPM: inteiro de 30–300;
- ISRC/ISWC: até 20 cada;
- data: ISO válida;
- link: HTTP/HTTPS até 500 caracteres;
- até 20 créditos;
- créditos de perfis precisam de handle válido e perfil público existente;
- menções sem perfil preservam nome e não têm `usuario_creditado_id`;
- créditos começam não confirmados.

A lista do catálogo completo calcula estatísticas a partir dos registros reais do usuário. O catálogo é filtrável por status, tipo, gênero e papel, com ordenação preservada por query parameters. Obras próprias são agrupadas por estado e tipo; obras de terceiros com crédito aparecem em Participações sem ações de edição. O perfil privado mostra até cinco obras recentes. O perfil público consulta somente obras reais publicadas com situação `Lançado`; a letra é pública nesse contexto, enquanto BPM, ISRC, ISWC e demais dados técnicos permanecem fora da consulta pública. Edição e exclusão de obra de outro usuário retornam 404.

## 9. Eventos e oportunidades

A tabela `eventos` já existente passou a atender também registros reais, sem nova migração de schema: fixtures usam `demonstracao = 1` e eventos criados por contas usam `demonstracao = 0`. A descoberta consulta ambos os conjuntos, mas somente o proprietário de um evento real recebe ações de edição e exclusão.

Somente contas cujo `tipo_conta` é `organizador` — definido no cadastro pela categoria `Organizador de eventos` — podem criar e gerenciar eventos. Os campos são título, categoria, data, horário, local, organizador, situação, cor visual, descrição, formato, inscrição, destaque/prêmio e etiquetas. Os filtros de categoria, localização, formato e período, bem como a ordenação, são enviados por query parameters. A ação `Demonstrar interesse` continua visual e pertence a uma etapa posterior.

## 10. Frontend e apresentação

O cabeçalho inclui CSS base, stylesheet específico da página, tema e responsividade. `base.css`, `componentes.css` e `estrutura.css` formam a fundação; arquivos como `obras.css`, `perfil.css`, `configuracoes.css`, `oportunidades.css` e `banco-beats.css` tratam cada área; `tema.css` contém regras do modo escuro.

`interacoes.js` implementa:

- toast demonstrativo;
- filtros locais;
- FAQ;
- menu lateral mobile;
- modais de evento, beat e obra;
- seleção de tema via `localStorage`;
- atualização visual de categorias/status;
- pré-análise assíncrona de categoria;
- inclusão/remoção dinâmica de créditos e menções.

O JavaScript usa `textContent` para montar conteúdo de modais e valida links antes de exibi-los. A renderização EJS usa escape padrão (`<%=`) nos dados textuais.

## 11. O que já foi validado

Executado no projeto extraído, em banco temporário isolado:

- `npm ci`: passou;
- `npm run check`: passou;
- `npm run build`: passou;
- `node --check public/js/interacoes.js`: passou;
- `npm audit --omit=dev --audit-level=moderate`: zero vulnerabilidades reportadas;
- HTTP público: `/login` e `/register` retornam 200;
- rotas privadas sem sessão redirecionam para `/login`;
- arquivos estáticos CSS/JS retornam 200;
- banco inicializado com usuários, perfis, obras, créditos, eventos e beats demonstrativos;
- fluxo real isolado de cadastro, login, descoberta, criação, edição e exclusão de beat passou;
- fluxo real isolado de cadastro, login, dashboard, perfil, criação de obra e logout passou;
- após logout, o dashboard volta a redirecionar para `/login`.

A execução gerou apenas o aviso conhecido da dependência transitiva `prebuild-install`.

## 12. Limitações e pontos de atenção para próximas alterações

### Funcionalidades ainda demonstrativas

- upload de áudio, capas, player real, compra e checkout de beats;
- interesse em oportunidades;
- solicitações de conexão;
- contato com produtores;
- confirmação/rejeição de créditos;
- player e upload de áudio;
- pré-análise de categorias;
- destaque/hit do mês e parte dos dados da visão geral.

### Hardening técnico ainda não implementado

- não há proteção CSRF para os POSTs;
- não há rate limiting ou atraso progressivo para tentativas de login;
- não há recuperação de senha ou verificação de e-mail;
- não há headers de segurança dedicados, como CSP e HSTS;
- JSON armazenado em colunas de perfil/fixtures é lido com `JSON.parse` sem fallback explícito para corrupção do arquivo;
- a confiança em `X-Forwarded-Proto` depende da topologia esperada de proxy (`trust proxy = 1`);
- o banco local exige estratégia de backup caso o projeto seja usado fora do protótipo.

### Cuidados de domínio

- conta só pode ser excluída depois que obras, eventos e beats próprios forem removidos ou transferidos;
- créditos em obras de terceiros permanecem textuais após a exclusão da conta;
- a propriedade deve continuar derivada da sessão, nunca de IDs enviados pelo navegador;
- dados demonstrativos não devem ser tratados como dados reais em novas features;
- beats reais usam `ON DELETE RESTRICT`; a exclusão de conta continua exigindo remoção ou transferência dos beats próprios;
- o interesse em oportunidades ainda não possui tabela ou endpoint persistente.

## 13. Próximo ponto natural do plano

O próximo ponto natural é a **Etapa 7 — ofertas de instrumentais**. O CRUD básico já foi implementado; a próxima decisão deve tratar licenças múltiplas, preço, arquivos e player sem misturar compra com cadastro.

A implementação atual preserva:

1. schema/migração incremental;
2. operações transacionais no model;
3. validação no controller;
4. autorização por proprietário;
5. separação entre fixtures e registros reais;
6. smoke tests com banco temporário;
7. atualização do README e de um novo relatório de etapa.

Nenhum arquivo-fonte do pacote original foi alterado nesta análise; a cópia de trabalho está em `/home/ubuntu/cypher-review/cypher`.


## 14. Auditoria visual frontend — 24 de outubro de 2026

Foi realizada uma rodada de harmonização visual com foco na página de Oportunidades, nos filtros por categoria, nos cards de eventos, no comportamento quando há apenas um resultado e na legibilidade dos temas claro e escuro. O filtro por abas agora apresenta um estado vazio específico quando nenhuma oportunidade corresponde à categoria selecionada. O grid também foi estabilizado para evitar distribuição visual inadequada em listas curtas, e os cards mantêm espaçamento mínimo coerente em telas menores.

Foram adicionados overrides de tema escuro para superfícies, bordas, textos secundários, filtros, feedbacks, links de gerenciamento e estados vazios da página de Oportunidades. A interação existente por teclado, `aria-pressed`, modais e autorização não foi alterada.

**Alterações estruturais no banco:** nenhuma. Esta melhoria alterou somente EJS, JavaScript, CSS e documentação. O schema permanece na versão 6; não foram criadas ou removidas tabelas, colunas, índices ou constraints.

O relatório detalhado está em `relatorios-incrementacao/melhoria-13-auditoria-frontend-visual.md`.


## 15. Correção de contraste e harmonização do sidebar — 24 de outubro de 2026

Foi corrigida uma inversão semântica nos botões dos temas claro e escuro. O token `--ink` representa o texto principal e não deve ser usado diretamente como fundo de botões sem uma regra complementar. Foram definidas regras explícitas para que superfícies verde-lima e amarelas usem texto escuro, enquanto superfícies pretas e verde-profundas usem texto claro. A correção foi aplicada globalmente e reforçada nas telas de login e cadastro.

O sidebar também foi harmonizado. No tema escuro, ele utiliza um verde quase preto discretamente mais profundo que a área principal, mantendo a separação visual sem contraste agressivo. O item ativo usa verde-lima e texto escuro de alto contraste. A paleta continua baseada em verde profundo, verde-lima, amarelo e preto, preservando a referência visual jamaicana.

**Alterações estruturais no banco:** nenhuma. O schema permanece na versão 6.

O relatório detalhado está em `relatorios-incrementacao/melhoria-14-contraste-temas-autenticacao.md`.


## 16. Refino do cadastro no tema escuro — 24 de outubro de 2026

Após a revisão visual da tela de cadastro, foi corrigida a herança de cor dos textos das categorias. Uma regra genérica de `span` estava aplicando um verde-oliva escuro sobre os cards escuros, reduzindo significativamente a legibilidade. Foram adicionados seletores específicos para os nomes das categorias, indicadores de seleção, título da seção, texto auxiliar, bordas, placeholders e estados de foco dos campos.

**Alterações estruturais no banco:** nenhuma. O schema permanece na versão 6.

O relatório detalhado está em `relatorios-incrementacao/melhoria-15-refino-cadastro-tema-escuro.md`.


## 17. Visão geral e padronização de gradientes — 24 de outubro de 2026

A Visão geral recebeu uma correção de contraste no card principal. O texto de “Descobrir. Conectar. Criar.” e a área de “Próximo passo” agora usam texto escuro sobre a superfície verde-lima, enquanto o selo numérico usa verde profundo com texto lime. O logo do sidebar recebeu apenas um reforço visual sutil.

As iniciais de perfis e usuários foram padronizadas em um gradiente amarelo–verde da paleta Jamaica. No tema claro, o gradiente é claro e usa texto escuro; no tema escuro, utiliza uma versão mais profunda e texto claro. As datas exibidas em “Na sua rota” seguem o mesmo padrão, garantindo consistência entre avatares e tiles de data.

**Alterações estruturais no banco:** nenhuma. O schema permanece na versão 6.

O relatório detalhado está em `relatorios-incrementacao/melhoria-16-visao-geral-gradientes-jamaica.md`.

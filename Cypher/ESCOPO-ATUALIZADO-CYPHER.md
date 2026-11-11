# CYPHER — ESCOPO DO PRODUTO E ESTADO ATUAL

**Fotografia do projeto:** repositório e documentação disponíveis nesta tarefa, com estado funcional analisado em 31 de outubro de 2026 e compilação/testes verificados em 2 de novembro de 2026. Este arquivo consolida a proposta do produto e o que se observou na implementação atual; não é um inventário de código linha a linha.

## Como ler os status

- **Implementado:** há fluxo identificável sustentado por interface/rota, validação e persistência ou por testes existentes. A compilação e as suítes listadas no encerramento passaram nesta revisão; isso não equivale a teste ponta a ponta de todos os comportamentos.
- **Parcial:** uma parte do comportamento existe, mas faltam componentes, condições ou cobertura previstos.
- **Stand-by:** proposta preservada para evolução; não foi localizado fluxo funcional equivalente nos caminhos auditados.
- **Incremento atual:** capacidade implementada durante a evolução do Cypher que complementa o produto, sem ser tratada como funcionalidade concluída apenas por existir interface.
- **Diretriz conceitual:** propósito, público ou valor esperado; não é, por si só, uma funcionalidade verificável.

“Não localizado” significa que o fluxo não foi encontrado nos módulos examinados e não afirma ausência em toda versão ou arquivo que não foi inspecionado. A análise desta fotografia foi estática: os testes existentes foram lidos, mas não foram executados nesta revisão.

## 1. Identidade e propósito do produto

### Visão do produto

O Cypher é uma plataforma de conexão e profissionalização voltada à cena underground do rap. Reúne artistas independentes, rappers/MCs, beatmakers, produtores musicais, DJs, empresários, produtores culturais e organizadores de batalhas e eventos. A proposta é funcionar como infraestrutura de oportunidades, organização profissional e conexões da cena — não como concorrente de serviços de streaming nem como rede social generalista.

**Status: Diretriz conceitual preservada.** A aplicação atual contém perfis, busca, obras, Beats, eventos e áreas de conteúdo que materializam partes dessa proposta. A rede persistente, recomendações por colaboração e algumas oportunidades comerciais continuam parciais ou em stand-by, detalhadas adiante.

### Problema que o produto procura reduzir

Artistas independentes podem ter dificuldade para obter visibilidade, formar networking, encontrar oportunidades de apresentação, conhecer processos de registro musical e acessar profissionais do setor. O Cypher procura reduzir essas barreiras ao concentrar descoberta de pessoas, projetos, obras, eventos e conhecimento profissional.

**Status: Diretriz conceitual.** A busca de perfis, o catálogo de obras e Beats, a divulgação de eventos e a central/FAQ cobrem partes do problema; não há evidência de que todas as oportunidades ou a rede de conexões estejam integradas em um único ciclo completo.

### Público-alvo

O núcleo atual é profissional: rappers, MCs, artistas independentes, beatmakers, produtores musicais, DJs, empresários, produtores culturais, organizadores de batalhas e eventos, showcases e demais colaboradores da cena.

**Status: Parcial.** Existem categorias profissionais e de organização de eventos. Uma conta específica para fãs, ouvintes e apoiadores — público geral não profissional — não foi confirmada no fluxo de cadastro examinado; sua expansão está preservada na seção 12.

### Objetivos de produto

1. Facilitar conexões profissionais — **Parcial:** busca de perfis existe; rede declarada e conexões persistentes não foram confirmadas.
2. Aumentar a visibilidade de artistas underground — **Parcial:** perfis públicos e busca existem, subordinados às configurações de privacidade; recomendação por colaborações não foi confirmada.
3. Centralizar oportunidades de shows e eventos — **Parcial:** cadastro, descoberta e interesse em eventos existem; agenda cultural regional e ciclo completo de presença não foram confirmados.
4. Auxiliar na organização profissional de obras musicais — **Parcial/implementado:** obras, dados fornecidos de registro e créditos persistem; validação colaborativa e portfólio inteligente permanecem pendentes.
5. Capacitar artistas com conteúdos educativos — **Parcial:** há FAQ/Central com busca local; tutorial e cobertura ampla de conteúdo não foram confirmados.

### Diferenciais pretendidos

O diferencial é profissionalizar a atuação do artista, gerar oportunidades reais e organizar a cena underground, indo além de uma rede social ou de um serviço de streaming.

**Status: Parcial.** A base profissional de perfis, obras, eventos e Beats está presente; a geração de oportunidades por conexões verificadas, reputação, contratação e recomendações ainda não forma o ciclo completo descrito abaixo.

## 2. Cadastro, perfil e informações profissionais

### Cadastro por categoria profissional e perfil artístico

**Status: Implementado, com incrementos atuais.** O cadastro atual é um fluxo progressivo em três etapas: conta, categorias e questionário. O servidor valida a conta, as categorias disponíveis e as respostas; a criação de usuário e perfil é transacional. A proposta de cadastro por categoria está materializada, enquanto etapas, pré-validação e questionários são decisões de implementação adicionais.

Evidências principais: `views/pages/cadastro.ejs`; `src/app/routes/rotasCypher.ts`; `src/app/controllers/controladorCompatibilidade.ts`; `src/app/models/bancoDados.ts`; `src/app/models/questionarioAtuacao.ts`; `scripts/testar-admin-ui.mjs`.

### Perfil técnico profissional

**Status: Parcial.** O perfil permite informar categorias, gêneros/estilos, status e equipamentos/ferramentas em campos existentes; também há questionários por categoria. Não foi confirmada correspondência estruturada e completa de todos os campos técnicos a seguir:

- **Beatmakers e produtores:** DAW principal, DAWs secundárias, plugins favoritos e estilos produzidos. Exemplos de DAW previstos: FL Studio, Ableton Live, Logic Pro e Luna.
- **Engenheiros de áudio:** softwares utilizados, especialidades e serviços oferecidos.
- **Artistas:** estilos musicais, frequência de lançamentos e interesse em colaborações.
- **Equipamentos profissionais:** microfones — Shure SM58, Shure SM7B e Audio-Technica AT2020; interfaces — Focusrite Scarlett e Universal Audio Volt; monitores — Yamaha HS5 e KRK Rokit; além de controladoras, MPCs, teclados e equipamentos de gravação.

Um campo genérico de texto ou uma resposta de questionário não é automaticamente equivalente a um campo estruturado, persistido e exibido para cada profissão. As respostas de atuação são autodeclarações: não certificam experiência nem concedem permissões profissionais.

Evidências principais: `src/app/models/questionarioAtuacao.ts`; `src/app/validators/validarPerfil.ts`; `src/app/models/modeloPerfil.ts`; `src/app/models/bancoDados.ts`; `views/partials/componentes/questionario-atuacao.ejs`.

### Busca e descoberta de profissionais

**Status: Parcial.** A rota `/search` pesquisa perfis públicos por texto e permite filtros por categoria, gênero e localização. A busca exclui a própria conta e trata diferenças de caixa e acentuação. Isso apoia visibilidade e descoberta regional básica, mas não cria por si só uma relação profissional persistente, uma rede de colaboradores ou recomendações baseadas em histórico de colaboração.

Evidências principais: `src/app/routes/rotasCypher.ts`; `src/app/controllers/controladorCompatibilidade.ts`; `src/app/models/bancoDados.ts`; `views/pages/busca-pessoas.ejs`.

### Incrementos atuais de perfil, conta e acesso

As capacidades abaixo complementam o escopo funcional e estão presentes na implementação examinada:

- **Edição de perfil por seções — Incremento implementado:** áreas Pessoal, Profissional, Portfólio, Privacidade e Conta, com salvamento independente e indicadores de rascunho. Evidências: `views/partials/componentes/editar-perfil-secoes.ejs` e código de perfil associado.
- **Privacidade — Incremento implementado:** controles para perfil público, exibição de localização e contato profissional; visibilidade das respostas de atuação; perfil novo inicia privado. O e-mail de login não é publicado como contato. Evidências: `views/partials/componentes/preferencias-privacidade-perfil.ejs`, `src/app/models/bancoDados.ts`, `scripts/testar-politicas-perfil.mjs`.
- **Categorias profissionais propostas — Incremento implementado:** novas categorias podem ser submetidas para moderação; decisão e justificativa ficam registradas. Aprovar uma categoria não altera automaticamente a categoria ativa do solicitante nem concede permissão especial. Evidências: `src/app/controllers/controladorConfiguracoes.ts`, `src/app/models/bancoDados.ts`, `views/pages/admin-revisao.ejs`, `scripts/testar-admin-ui.mjs`.
- **Gêneros/estilos propostos — Incremento implementado:** existe fluxo moderado para propor valores não catalogados. Gênero da obra e gênero/estilo do perfil são contextos distintos e não devem ser confundidos. Evidências: modelo, controller e painel administrativo; relatório `melhoria-24-categorias-generos-revisao.md`.
- **Cooldown e exceções de categoria — Incremento implementado:** mudanças obedecem a prazo de 60 dias; solicitação antecipada requer justificativa e pode ser aprovada ou recusada. Autorizações aprovadas são de uso único; decisões, justificativas e snapshots de auditoria são persistidos. Evidências: `src/app/models/bancoDados.ts`, `src/app/controllers/controladorCompatibilidade.ts`, `views/partials/componentes/editar-perfil-secoes.ejs`, `views/pages/admin-revisao.ejs`; relatórios `melhoria-27-fluxo-solicitacao-excecao-categoria.md` e `melhoria-32-historico-solicitacoes-excecao.md`.
- **“Outro/Outros” contextual — Incremento implementado nos fluxos auditados:** quando uma opção Outro é selecionada, aparece o campo correspondente para detalhar o valor, com obrigatoriedade contextual conforme a validação. A informação é persistida nos contextos de obra/evento com campos como `tipo_detalhe`, `genero_detalhe`, `funcao_detalhe` e `categoria_detalhe`. Os pontos de interface auditados incluem cadastro/perfil, obras e eventos; não presumir que textos livres sejam intercambiáveis entre contextos.
- **Conta e sessão — Incremento implementado:** autenticação de senha com `scrypt` e sal; sessão com token aleatório cujo hash é armazenado; cookie `HttpOnly`, validade de 24 horas, middleware de rotas privadas e revogação no logout. Recuperação de senha e verificação de e-mail não foram confirmadas. Evidências: `src/app/models/autenticacaoCypher.ts`, `src/app/controllers/controladorCompatibilidade.ts`, `src/app/routes/rotasCypher.ts`.
- **Encerramento de conta — Incremento implementado com restrições:** exige senha atual e confirmação literal; pode ser impedido se houver obras, eventos ou Beats próprios a resolver. Não foi localizado teste ponta a ponta específico para esse fluxo. Evidências: `src/app/validators/validarConta.ts`, `src/app/models/bancoDados.ts`, `views/pages/configuracoes.ejs`.

## 3. Obras, créditos e trajetória profissional

### Gestão de obras musicais

**Status: Implementado para cadastro e gerenciamento de obras próprias.** Usuários podem cadastrar, consultar, editar e excluir obras próprias. O formulário/modelo contempla título, letra, participantes, gênero, BPM, situação da obra, dados de composição, informações de registro e campos adicionais como tipo, descrição, data e link. ISRC e ISWC são armazenados quando fornecidos pelo usuário; o sistema não emite nem registra esses códigos em entidades externas.

Operações são restringidas ao proprietário; exclusão de conta/obra trata referências próprias conforme regras do sistema.

Evidências principais: `src/app/controllers/controladorObras.ts`; `src/app/validators/validarObra.ts`; `src/app/models/bancoDados.ts`; `views/pages/obras.ejs`; `views/pages/cadastro-obra.ejs`; `src/app/routes/rotasCypher.ts`.

### Registro de colaboradores e créditos

**Status: Parcial.** Ao cadastrar obra, podem ser registrados créditos associados a perfis ou nomes textuais de pessoas sem conta. Os papéis previstos são: artista principal; participação/feat; beatmaker; produtor(a); compositor; letrista; responsável pela mixagem; responsável pela masterização; DJ; outros colaboradores. Os créditos registram nome, função/papel e participação conforme o formulário. Créditos ligados a perfil dependem de conta elegível; menções textuais não recebem ID de usuário. Créditos começam não verificados.

O registro inicial está implementado, mas reivindicação posterior de menção, associação confiável a conta, confirmação/rejeição pelo participante e histórico confirmado ainda não foram confirmados. Uma menção textual não prova que a pessoa citada consentiu ou validou o crédito.

Evidências principais: `views/pages/cadastro-obra.ejs`; `src/app/validators/validarCredito.ts`; `src/app/models/bancoDados.ts` (tabela `creditos`); `public/js/interacoes.js`; `README.md`.

### Menções de profissionais sem conta e associação futura

**Status: Parcial/Stand-by.** O sistema armazena a menção textual (nome artístico, função e participação) sem perfil associado. A possibilidade de, quando essa pessoa criar uma conta com nome correspondente, sugerir vinculação das participações é prevista como evolução; não foi localizado matching ou reivindicação funcional. Igualdade de nomes não é autorização suficiente para associação automática: homônimos, consentimento e decisão manual precisam ser tratados.

### Histórico de créditos e participações

**Status: Parcial.** Obras próprias e participações creditadas aparecem em consultas e perfis. O catálogo/perfil não comprova que o histórico cubra todas as obras e atividades profissionais. Há risco de tratar créditos não verificados como trajetória confirmada. O histórico esperado deve poder contemplar obras cadastradas, álbuns, EPs, singles, participações especiais e produções realizadas; atualmente não foi confirmada validação pelos colaboradores nem cobertura integral de eventos, Beats, cyphers, batalhas e workshops.

Evidências principais: `src/app/models/bancoDados.ts`; `views/pages/obras.ejs`; `views/pages/perfil.ejs`; `views/pages/perfil-publico.ejs`.

### Rede de Colaboradores

**Status: Stand-by.** A proposta é permitir que, durante cadastro ou edição de perfil, o usuário indique opcionalmente profissionais com quem trabalhou ou mantém contato na cena e os encontre por nome artístico ou nome de usuário. Relações possíveis: artista, beatmaker, produtor(a), DJ, engenheiro de áudio, empresário, organizador de eventos, estúdio e outros colaboradores. A rede deve apoiar networking e identificação de colaborações reais; também pode ajudar a sugerir vínculos de créditos pendentes e reduzir ambiguidades entre nomes artísticos parecidos.

A busca geral de perfis e os créditos em obras existem, mas não foi confirmada entidade/rota de rede declarada pelo usuário ou conexão persistente. Um crédito de obra não substitui a rede de relacionamento.

### Recomendações por colaboração

**Status: Stand-by.** Recomendações devem partir de colaborações musicais, não de uma rede social genérica. Exemplo de uso: um beatmaker trabalhou com Pedro; Pedro trabalhou com Ana; Ana procura um beatmaker; o Cypher pode sugerir a conexão. A proposta pode evoluir para recomendações de profissionais, conexões e oportunidades de projetos a partir do histórico compartilhado. Não foi confirmado grafo de colaborações ou recomendador desse tipo.

### Portfólio Profissional Inteligente

**Status: Stand-by, com histórico de obras parcial.** A pessoa deve escolher um modo de gestão:

- **Modo Manual:** usuário decide quais trabalhos entram e saem do portfólio.
- **Modo Inteligente:** sistema identifica novas participações registradas e atualiza o portfólio respeitando as preferências da pessoa.

O modo Inteligente pode agregar participações em músicas, EPs, álbuns e singles; créditos como beatmaker, produtor, compositor, letrista, DJ, mixagem, masterização e outras funções; Beats publicados; participação em eventos, cyphers, batalhas e workshops; e outras atividades profissionais registradas. Não foi confirmada preferência persistida, agregação automática abrangente ou seleção/remoção de itens como especificado.

No modo Manual, uma opção independente de **Notificações de Atualização de Portfólio** deve permitir que o usuário receba — se desejar — sugestão de adicionar uma atividade (por exemplo, “Gostaria de adicionar o seu projeto: ‘XXX’ ao seu portfólio?”). A central de notificações genéricas atual não substitui essa configuração, sugestão e ação específicas; não foram confirmadas.

O portfólio deve ter duas áreas distintas:

- **Trabalhos Confirmados:** participações registradas por créditos/colaborações e validadas conforme regra confiável.
- **Trabalhos Destacados:** seleção manual de obras e projetos para vitrine, sem apagar o histórico completo.

Não foi confirmada seleção de destaques, os dois modos ou as duas seções; a confirmação de crédito é dependência importante para chamar um trabalho de validado.

## 4. Colaboração profissional e Banco de Beats

### Encontrar colaboradores, formar projetos e contratar profissionais

**Status: Parcial.** A proposta é permitir que usuários encontrem artistas, beatmakers, produtores e DJs para feats, projetos musicais e equipes de trabalho. O resumo funcional também abrange contratação de artistas/profissionais. Atualmente existem busca de perfis, créditos em obras, eventos e catálogo de Beats, mas não foi confirmado fluxo persistente próprio para anunciar vagas, solicitar colaboração, contratar ou acompanhar a negociação. Busca de perfil, crédito feito após um projeto e pedido de contratação são operações distintas.

### Banco de Beats

**Status: Parcial.** Beatmakers podem disponibilizar Beats no Cypher. Cada Beat deve comportar nome, BPM, tom, gênero, descrição, arquivo de demonstração, tags e licença. Na implementação há catálogo e CRUD de Beats com metadados persistidos — como título, BPM, tom, gênero, duração, descrição e condições/ofertas básicas — e operações de edição/exclusão sob controle do proprietário. O cadastro de Beat exige categoria `Beatmaker`. Não foi confirmado upload/armazenamento de áudio de demonstração nem campo/tag pesquisável completo.

Evidências principais: `src/app/controllers/controladorBeats.ts`; `src/app/models/modeloPerfil.ts`; `src/app/models/bancoDados.ts` (tabelas `beats` e `ofertas_beats`); `views/pages/banco-beats.ejs`; `views/pages/cadastro-beat.ejs`.

### Player de áudio, prévias e disponibilidade

**Status: Stand-by.** Cada Beat deve poder ser ouvido em um player integrado usando prévias, trechos de demonstração, tags de produtor e/ou marca d’água sonora para divulgar sem disponibilizar o arquivo original completo. São necessários limites de trecho, proteção do original, armazenamento e autorização de acesso. Não foi identificado áudio/streaming ou player operacional no fluxo examinado.

Os estados de disponibilidade previstos são **Disponível para Compra**, **Disponível para Free Use** e **Vendido**. Devem orientar o catálogo e as ações do usuário. Na implementação há ofertas com preço/descrição e marcador de exclusividade, mas isso não equivale aos três estados, venda concluída ou bloqueio de novas vendas após aquisição.

### Incremento atual de ofertas de Beats

**Incremento implementado parcialmente em relação ao ciclo comercial completo.** O Beat pode ter múltiplas ofertas de licença, preço opcional e descrição; uma marcação de venda exclusiva é validada no servidor. Esses mecanismos ampliam o cadastro de licença, mas não implementam compra, checkout, entrega de arquivo, transição automática para Vendido ou confirmação de pagamento.

Evidências: controllers e models de Beats citados acima; relatórios `melhoria-11-ofertas-multiplas-beats.md` e `melhoria-12-venda-exclusiva-beats.md`.

## 5. Oportunidades, eventos e reputação

### Divulgação e descoberta de eventos

**Status: Parcial/implementado para eventos reais.** Organizadores podem criar eventos e gerenciar os próprios registros. A aplicação persiste título, categoria, data, horário, local, organizador, situação, descrição, formato, inscrição, destaque/prêmio, etiquetas e modo de participação. A página de oportunidades lista eventos reais e oferece filtros por categoria, localização, formato e período, ordenação e detalhes.

As categorias necessárias incluem batalhas, shows, cyphers, workshops, festivais e seletivas. Valores explícitos observados incluem Batalha, Cypher, Workshop, Show e Outro; Festival e Seletiva não foram confirmados como categorias próprias com filtro. Poder escrever um deles como Outro não garante classificação, consulta e descoberta próprias.

Evidências principais: `src/app/controllers/controladorEventos.ts`; `src/app/validators/validarEvento.ts`; `src/app/models/bancoDados.ts` (tabela `eventos`); `views/pages/cadastro-evento.ejs`; `views/pages/oportunidades.ejs`; `public/js/interacoes.js`.

### Interesse e histórico de participação

**Status: Parcial.** Artistas podem demonstrar interesse ou solicitar inscrição em eventos elegíveis, cancelar a solicitação e acompanhar status operacionais; o organizador pode acompanhar pessoas interessadas e atualizar estados como interessado, inscrito, confirmado ou rejeitado. Essa persistência contribui para um histórico, mas não comprova comparecimento físico, atividade realizada ou histórico completo de transições. A integração de participação em eventos, cyphers, batalhas e workshops ao portfólio também não foi confirmada.

### Agenda cultural regional

**Status: Parcial/Stand-by.** A busca de perfis e os eventos possuem filtros por localização, mas não foi identificado recurso distinto de agenda cultural regional com curadoria/agregação. É necessário definir se o filtro geográfico atende a intenção ou se a agenda deve reunir oportunidades e eventos locais de forma própria.

### Reputação

**Status: Stand-by.** A reputação deve aumentar com participação em eventos, avaliações recebidas e profissionalismo demonstrado, criando confiança entre profissionais, contratantes e colaboradores e apoiando visibilidade/oportunidades. Há inscrição e estados de participação; não foi confirmado cálculo persistente que use avaliações, profissionalismo ou presença realizada. Um número visual em interface não comprova regra de reputação completa.

Evidências principais: `src/app/models/bancoDados.ts` (interesses de eventos); `src/app/controllers/controladorEventos.ts`; `views/partials/barra-lateral.ejs`.

## 6. Capacitação, FAQ e conteúdos

### Tutorial e central permanente de conhecimento

**Status: Parcial/Stand-by.** Deve existir tutorial opcional para novos usuários e uma central de conhecimento consultável permanentemente, com orientação sobre ISRC, ISWC, direitos autorais, composição, produção musical e boas práticas profissionais. Não foi confirmado onboarding/tutorial em etapas ou cobertura completa desses temas.

### FAQ

**Status: Parcial/implementado.** Há FAQ textual com busca local e perguntas sobre o que são ISRC e ISWC, como conseguir shows e como funciona a reputação, entre outras. A área cobre consulta rápida, mas não comprova biblioteca ampla de capacitação; links exibidos para artigos recentes apontam atualmente à mesma rota `/central`, segundo a view examinada.

Evidências principais: `src/app/models/modeloCypher.ts`; `views/pages/central.ejs`; `public/js/interacoes.js`; rota `/central` em `src/app/routes/rotasCypher.ts`.

### Hub de conhecimento avançado

**Status: Stand-by.** Um hub avançado consta como expansão. Ele complementaria, mas não se confunde com o FAQ atual ou com a central básica; formato, conteúdo, autoria e manutenção ainda precisam ser definidos.

## 7. Ciclo de valor do Cypher

O fluxo de produto esperado é contínuo e deve permitir que cada etapa gere valor para a seguinte:

1. **Descoberta de oportunidades:** encontrar eventos, batalhas, shows, vagas de colaboração e Beats. **Status: Parcial** — eventos e Beats têm catálogo; vagas e alguns meios de descoberta permanecem pendentes.
2. **Formação de conexões:** estabelecer contatos com beatmakers, produtores, DJs, artistas e organizadores por interesses e objetivos. **Status: Parcial** — há busca de perfis; conexões persistentes não foram confirmadas.
3. **Desenvolvimento de projetos:** iniciar músicas, EPs, álbuns, cyphers, apresentações e colaborações. **Status: Parcial** — cadastro de obras, Beats e eventos existe; fluxo de criação/colaboração com etapas próprias não foi confirmado.
4. **Registro e organização profissional:** registrar obras, créditos, colaborações, ISRC, ISWC e informações de carreira. **Status: Parcial/implementado** — obras e dados informados persistem; confirmação de créditos e portfólio integrado ainda faltam.
5. **Construção de reputação:** participar de eventos, entregar projetos e receber avaliações positivas. **Status: Stand-by/parcial** — existem estados de interesse/inscrição; presença, avaliações e cálculo de reputação não foram confirmados.
6. **Geração de novas oportunidades:** histórico, reputação e networking consolidados devem aumentar oportunidades de colaboração, contratação e participação em eventos. **Status: Stand-by** — não há evidência do ciclo integrado de recomendação e contratação.

O ciclo está parcialmente materializado por módulos separados; não se deve descrevê-lo como autossustentável enquanto etapas de conexão, validação, reputação e recomendação permanecerem incompletas.

## 8. Escalabilidade e expansões

As possibilidades abaixo permanecem registradas como horizonte de produto; estar listadas não significa que estejam decididas para implementação ou em desenvolvimento.

| Expansão | Estado observado |
|---|---|
| Marketplace de Beats | **Parcial:** catálogo e ofertas existem; negociação/compra/checkout não foram confirmados. |
| Contratação de serviços musicais | **Stand-by:** busca existe; contratação persistente não foi confirmada. |
| Dashboards culturais | **Stand-by:** indicadores culturais/regionais não foram confirmados; dashboard atual tem conteúdo demonstrativo. |
| Recomendações inteligentes | **Stand-by:** não foi confirmado recomendador de profissionais/oportunidades por colaboração. |
| Venda de ingressos | **Stand-by:** não foi confirmado fluxo de venda ou emissão de ingresso. |
| Ferramentas avançadas de networking | **Stand-by:** busca existe, rede persistente e recursos avançados não foram confirmados. |

## 9. Futuras ideias e expansões preservadas

| Proposta | Estado observado no projeto |
|---|---|
| Sistema de vagas para artistas e produtores | **Stand-by:** não foi confirmada publicação, candidatura e gestão persistente de vagas. |
| Portfólio automático | **Stand-by:** histórico parcial de obras/créditos existe; modo inteligente e agregação automática abrangente não foram confirmados. |
| Currículo artístico em PDF | **Stand-by:** não foi localizado fluxo de geração de documento PDF do currículo artístico. |
| Sistema de split de obras | **Stand-by:** percentuais/divisão de direitos ou receitas entre participantes não foram confirmados. |
| Agenda cultural regional | **Parcial/Stand-by:** filtro por localização existe; agenda curada/agregada não foi confirmada. |
| Certificações internas | **Stand-by:** não foi confirmado mecanismo de cursos, avaliação ou certificação. Questionários de perfil são autodeclarações e não certificações. |
| Dashboard de crescimento | **Parcial:** há visão geral, porém parte dos dados é fixa/demonstrativa; indicadores pessoais e de evolução confiáveis não foram confirmados. |
| Recomendações inteligentes | **Stand-by:** recomendações por histórico/rede de colaboração não foram confirmadas. |
| Avaliação mútua entre artistas e contratantes | **Stand-by:** avaliação bidirecional e critérios de profissionalismo não foram confirmados. |
| Hub de conhecimento avançado | **Stand-by:** não foi confirmado além de FAQ/Central limitada. |
| Integração com distribuidoras | **Stand-by:** integração operacional não foi confirmada. Guardar códigos ISRC/ISWC não é integração de distribuição. |
| Estatísticas culturais regionais | **Stand-by:** painéis de dados culturais regionais não foram confirmados. |
| Gerador automático de release | **Stand-by:** ferramenta para compor/exportar release artístico não foi confirmada. |

## 10. Expansão para público geral

**Status: Stand-by.** Uma futura modalidade pode admitir fãs, ouvintes e apoiadores sem perfil profissional. As capacidades desejadas são:

- seguir artistas e profissionais;
- acompanhar lançamentos e eventos;
- favoritar Beats e obras;
- comprar ingressos;
- apoiar financeiramente artistas independentes;
- descobrir talentos regionais.

O propósito é ampliar alcance cultural e aproximar artistas da audiência sem enfraquecer o núcleo de profissionalização. Não foi confirmada conta dedicada ao público geral nem os fluxos de seguir, favoritar, comprar ingresso e apoiar financeiramente no fluxo de cadastro/conta examinado.

## 11. Incrementos atuais do produto e da plataforma

Estes recursos fazem parte do sistema observado e complementam as capacidades de produto descritas acima. O fato de estarem implementados não os converte em substitutos de requisitos pendentes que tenham objetivo diferente.

- **Painel administrativo — Incremento implementado:** rota protegida por allowlist de e-mails do servidor (`CYPHER_ADMIN_EMAILS`); navegação interna por páginas/áreas, em vez de painel único dependente de âncoras; revisão de gêneros/categorias e exceções; filas separadas de pendentes e decisões (aprovados/recusados), busca e expansão de resultados. Aprovar uma categoria não concede capacidade profissional automaticamente. Evidências: `src/app/routes/rotasCypher.ts`; `src/app/controllers/controladorCompatibilidade.ts`; `src/app/controllers/controladorConfiguracoes.ts`; `views/pages/admin-revisao.ejs`; `scripts/testar-admin-ui.mjs`.
- **Notificações genéricas — Incremento implementado:** atividades podem gerar notificações persistentes por usuário, com ações para marcar como lidas e inserção idempotente. Isso não implementa, por si, sugestão configurável de atualização do portfólio. Evidências: `src/app/controllers/controladorNotificacoes.ts`; `src/app/models/bancoDados.ts`; `views/pages/notificacoes.ejs`.
- **Visão geral — Incremento implementado com divergência:** há atalhos e blocos de resumo, mas alguns indicadores são fixos ou demonstrativos e não foram confirmados como dados reais/contextualizados por conta. Evidências: `views/pages/visao-geral.ejs`; `src/app/controllers/controladorCompatibilidade.ts`; `src/app/models/modeloCypher.ts`; `src/app/models/bancoDados.ts`.
- **Navegação, responsividade e acessibilidade pontual — Incremento implementado:** partials compartilhados, menu responsivo, rota ativa, atributos ARIA e suporte a `prefers-reduced-motion`; há componente de estado vazio. Isso não representa auditoria ou conformidade WCAG completa. Evidências: `views/partials/barra-lateral.ejs`; `views/partials/barra-superior.ejs`; `views/partials/fim-pagina.ejs`; `views/partials/componentes/estado-vazio.ejs`; `public/js/interacoes.js`; `public/css/responsivo.css`.
- **Persistência e migrações — Implementado:** aplicação usa SQLite, schema v20 e migrações aditivas/transacionais, com verificações de integridade referencial e idempotência. Tabelas cobrem usuários, perfis, obras, créditos, eventos, interesses, Beats, ofertas, sessões, notificações, governança e as estruturas preparatórias `profissoes_usuario`/`vertentes_profissionais_usuario`. A nova estrutura normaliza as categorias atuais para o catálogo canônico. Evidências: `src/app/models/bancoDados.ts`; `src/app/models/modeloProfissionalPersistido.ts`; `scripts/testar-banco.mjs`; `scripts/testar-persistencia-profissional.mjs`; `README.md`.

## 12. Visão consolidada do estado atual

### Capacidades com fluxo funcional observado

Cadastro progressivo por categoria; autenticação e sessões; perfil profissional com edição por seções; políticas de privacidade; busca de perfis públicos; CRUD de obras e Beats; registro de créditos e menções textuais; cadastro e gestão de eventos; descoberta, filtros e manifestação de interesse; revisão administrativa de propostas; fluxo de exceções de categoria; notificações genéricas; persistência SQLite e migrações.

### Capacidades parciais ou divergentes

Perfil técnico completo por profissão; rede e contratação; validação dos créditos e Menções Fantasma; histórico de trajetória abrangente; portfólio; presença efetiva em eventos; reputação; agenda regional; taxonomia de festivais e seletivas; arquivo e player de áudio; tags/watermark; estados comerciais de Beats; FAQ/central de conhecimento; dashboard pessoal; acessibilidade e regressão visual amplamente testadas.

### Capacidades em stand-by

Recomendador por colaboração; portfólio Manual/Inteligente e suas notificações; Trabalhos Confirmados/Destacados; confirmação ou rejeição colaborativa; currículo PDF; split de obras; certificações internas; avaliação mútua; integração com distribuidoras; venda de ingressos; apoio financeiro; recursos para público geral; estatísticas culturais regionais; gerador de release.

### Segurança, qualidade e validação

Há mecanismos atuais de autenticação, sessão, privacidade, proteção de rotas e regras de propriedade. A análise identificou cobertura de testes para banco/migrações, políticas de perfil e interface administrativa, mas não uma suíte ponta a ponta abrangendo todos os fluxos, acessibilidade e regressão visual. Os testes existentes foram inspecionados, não executados nesta atualização documental. Recuperação de senha, verificação de e-mail e proteção contra abuso precisam de confirmação adicional antes de uso real.

## 13. Decisões e verificações pendentes

1. Quais expansões de networking, portfólio, recomendação, público geral, mercado de Beats e conteúdo educativo entram na próxima fase?
2. Quais campos técnicos são obrigatórios para cada categoria e quais podem continuar como texto livre?
3. Como uma pessoa reivindica, confirma ou rejeita um crédito? Como tratar homônimos, consentimento e disputas?
4. A Rede de Colaboradores será declarada pelos usuários, derivada de créditos confirmados ou uma combinação?
5. Como distinguir interesse, inscrição, confirmação, presença realizada e atividade concluída em eventos?
6. O modo Manual/Inteligente, Trabalhos Confirmados/Destacados e as notificações de atualização de portfólio são requisitos da próxima versão?
7. Festival e seletiva precisam de categorias e filtros próprios? Que comportamento define uma agenda cultural regional?
8. Beats terão contato externo ou compra/checkout? Como funcionam Free Use, Vendido, exclusividade e prévias protegidas?
9. Quais indicadores de dashboard devem ser reais e contextualizados por conta, e quais são apenas demonstrativos?
10. Qual conteúdo, formato e navegação são esperados para tutorial, FAQ e hub de conhecimento?
11. Quais critérios de acessibilidade, segurança de conta e cobertura automatizada definem aceite para a versão final?

## 14. Limites da fotografia

Foram consultados `README.md`, `ANALISE-PROJETO.md`, relatórios incrementais, rotas, controllers, models, validators, views e scripts. Foi identificada documentação histórica com informação de schema/fixtures que diverge do código corrente; para o estado do sistema prevalecem a implementação e os testes identificados em schema v20. A análise de funcionalidades foi estática; a validação desta etapa passou `npm run check`, `npm run build`, `npm run test:persistence`, `npm run test:db` e `npm run test:admin-ui`. Essas suítes não constituem teste ponta a ponta de todos os fluxos. Afirmações de ausência ficam restritas aos caminhos examinados.

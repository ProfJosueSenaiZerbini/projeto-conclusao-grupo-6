# Prompt de implementação — Oficialização de cargos, permissões e dados reais da Cypher

## Contexto obrigatório

Você deve modificar o projeto Cypher existente, preservando sua organização, arquitetura MVC, convenções de nomenclatura, indentação, fluxo de inicialização e separação entre `src`, `views`, `public` e `scripts`. Não reestruture o projeto, não migre para MySQL e não substitua o SQLite nesta etapa.

A base atual usa TypeScript, Express, EJS, JavaScript vanilla, CSS modular e SQLite via `better-sqlite3`. O schema atual é o **SQLite v7**.

Antes de alterar qualquer arquivo, leia e cruze:

- `README.md`;
- `ANALISE-PROJETO.md`;
- `documentacao/PROMPT-MESTRE-MELHORIAS-CYPHER.md`;
- `src/app/models/bancoDados.ts`;
- `src/app/models/modeloCypher.ts`;
- `src/app/models/modeloPerfil.ts`;
- `src/app/controllers/controladorCompatibilidade.ts`;
- `src/app/controllers/controladorBeats.ts`;
- `src/app/controllers/controladorEventos.ts`;
- `src/app/routes/rotasCypher.ts`;
- views, partials, CSS e JavaScript relacionados a cadastro, perfil, Beats e eventos.

Não invente funcionalidades fora deste escopo. Se algum comportamento necessário não estiver definido, preserve o comportamento atual e documente a decisão antes de implementá-la.

---

## Problema que deve ser resolvido

Atualmente, a criação de conta permite selecionar categorias profissionais, mas essas categorias ainda não formam uma matriz completa de permissões.

As categorias atualmente existentes são:

- `Rapper / MC`;
- `Beatmaker`;
- `Produtor musical`;
- `DJ`;
- `Empreendedor`;
- `Organizador de eventos`;
- `Outros`.

As categorias são armazenadas no perfil como JSON. O projeto também possui `usuarios.tipo_conta`, mas esse campo só diferencia, na prática, `profissional` e `organizador`. No cadastro e na atualização de perfil, a presença de `Organizador de eventos` define `tipo_conta = organizador`; as outras categorias continuam agrupadas como `profissional`.

O projeto já possui status profissionais derivados das categorias, como disponibilidade para eventos, produção, colaborações e recebimento de inscrições. Porém, esses status não substituem uma matriz de autorização para criar ou gerenciar recursos.

Atualmente:

- somente organizadores podem criar, editar e excluir eventos;
- eventos demonstrativos são carregados como fixtures e possuem `demonstracao = 1`;
- eventos reais criados por usuários possuem `demonstracao = 0`;
- a Etapa 1 criou persistência de interesses na tabela `interesses_eventos`;
- o fluxo atual ainda permite que um usuário real demonstre interesse em eventos demonstrativos, embora esses eventos sejam estáticos e não tenham um organizador real controlável;
- o Banco de Beats pode ser acessado por contas autenticadas e o controller bloqueia contas demonstrativas, mas não exige a categoria `Beatmaker` ou outra categoria profissional específica;
- os botões e links da interface ainda não refletem uma matriz completa de cargos;
- esconder um botão, isoladamente, não é considerado controle de acesso suficiente.

O objetivo é fazer com que os cargos escolhidos na conta tenham consequência funcional real, sem apagar dados existentes e sem transformar categorias em uma nova estrutura duplicada sem necessidade.

---

## Objetivo da etapa

Implementar uma camada coerente de cargos e permissões baseada nas categorias profissionais já salvas no perfil.

A implementação deve:

1. usar as categorias persistidas como fonte de verdade dos cargos profissionais;
2. manter `tipo_conta` apenas para compatibilidade e para o conceito já existente de organizador, caso isso seja necessário no código atual;
3. criar helpers centralizados de autorização, em vez de espalhar comparações de strings pelos controllers;
4. aplicar a mesma regra no frontend e no backend;
5. proteger rotas contra acesso direto por URL e requisições manuais;
6. impedir operações incompatíveis com o cargo oficial da conta;
7. tratar múltiplas categorias como permissões cumulativas;
8. manter os dados existentes quando uma pessoa alterar ou remover uma categoria;
9. impedir que interesses em oportunidades demonstrativas sejam tratados como interesses em eventos reais;
10. deixar claro para o usuário quando uma oportunidade é apenas demonstrativa;
11. preservar o funcionamento das contas demonstrativas sem permitir gravações reais;
12. não implementar notificações, compras, mensagens, upload de mídia ou migração para MySQL nesta etapa.

---

## Fonte de verdade e compatibilidade

Primeiro confirme como o projeto atual lê e grava `categorias_json`, `tipo_conta`, `role`, `funcao` e os status profissionais.

Não crie uma coluna nova de cargo se as categorias já forem suficientes para representar os cargos. Só altere o schema se a análise demonstrar que a autorização não pode ser implementada de forma segura com os dados já existentes.

Se for necessário criar uma estrutura nova, ela deve ser justificada no relatório, possuir migração SQLite incremental e manter compatibilidade com bancos no schema 7.

A regra preferencial é:

- `perfis.categorias_json` define os cargos profissionais selecionados;
- `usuarios.tipo_conta` continua sendo um agrupamento de compatibilidade (`profissional` ou `organizador`);
- a autorização especializada consulta as categorias normalizadas por helpers do domínio;
- categorias múltiplas concedem a união das permissões correspondentes;
- remover uma categoria impede novas criações incompatíveis, mas não deve apagar automaticamente obras, Beats, eventos ou interesses existentes.

Para dados já existentes, não executar backfill destrutivo e não mudar categorias silenciosamente.

---

## Matriz mínima de permissões a implementar

A matriz abaixo deve ser implementada com base nas categorias atualmente existentes. Se a análise de código encontrar uma regra já diferente e necessária para preservar compatibilidade, documente a diferença e use a regra menos destrutiva.

### Permissões gerais

Qualquer conta real autenticada pode:

- acessar o próprio perfil;
- editar seus dados permitidos;
- consultar recursos públicos e oportunidades disponíveis;
- cadastrar e administrar suas obras conforme as regras já existentes;
- demonstrar interesse somente em eventos reais elegíveis;
- cancelar o próprio interesse;
- consultar o próprio estado de interesse.

Contas demonstrativas podem navegar e visualizar a experiência, mas não podem criar, editar, excluir ou registrar operações persistentes reais.

### `Rapper / MC`

Permitir as funções gerais já existentes relacionadas a obras, créditos, colaborações e participação em eventos reais.

Não conceder automaticamente permissão para:

- cadastrar Beats como produtor;
- criar eventos;
- administrar eventos de terceiros;
- alterar o status de interessados em eventos de terceiros.

### `Beatmaker`

Permitir:

- acessar o Banco de Beats;
- cadastrar Beats;
- editar e excluir apenas os próprios Beats;
- administrar ofertas dos próprios Beats, respeitando as regras já existentes.

A conta deve continuar podendo visualizar Beats conforme o comportamento atual, mas a criação e a administração de Beats devem exigir a categoria adequada.

### `Produtor musical`

Avaliar a compatibilidade com a mesma capacidade de criação e administração de Beats concedida ao `Beatmaker`, pois o projeto já trata produção musical como categoria profissional relacionada à criação e ofertas de instrumentais.

Essa equivalência deve ser explicitamente documentada. Não conceder capacidades de organizador de eventos apenas por ser produtor musical.

### `DJ`

Permitir as funções gerais relacionadas a obras e participação em eventos reais.

Não conceder automaticamente:

- criação de Beats, salvo se a conta também possuir `Beatmaker` ou `Produtor musical`;
- criação de eventos, salvo se também possuir `Organizador de eventos`.

### `Organizador de eventos`

Permitir:

- criar eventos reais;
- editar e excluir somente os próprios eventos reais;
- consultar interessados nos próprios eventos reais;
- alterar o status dos interessados nos próprios eventos;
- administrar inscrições e participações vinculadas aos próprios eventos, usando os endpoints já existentes da Etapa 1.

A condição deve ser verificada no backend pela sessão e pela propriedade do evento. Nunca confiar em um `usuarioId` enviado pelo navegador para definir propriedade.

### `Empreendedor`

Manter acesso às funções gerais do perfil, descoberta e oportunidades profissionais, sem conceder automaticamente criação de Beats ou criação de eventos.

### `Outros`

Manter acesso às funções gerais compatíveis com o perfil, sem conceder permissões especializadas que não estejam associadas a outra categoria selecionada.

### Múltiplas categorias

Se a conta possuir duas ou mais categorias, as permissões devem ser cumulativas.

Exemplos obrigatórios:

- `Beatmaker` + `Organizador de eventos`: pode criar Beats e eventos;
- `Rapper / MC` + `Beatmaker`: pode administrar obras e Beats;
- `DJ` + `Organizador de eventos`: pode atuar nas funções de DJ e administrar eventos;
- `Outros` + `Beatmaker`: deve receber a permissão de Beatmaker, sem ser tratado apenas como `Outros`.

Não substituir a lista de categorias por um único cargo arbitrário.

---

## Eventos demonstrativos e interesses

A Etapa 1 criou persistência de interesses, mas eventos demonstrativos não representam oportunidades reais criadas por usuários.

Corrigir essa incoerência com as seguintes regras:

- eventos com `demonstracao = 1` devem ser claramente identificados como demonstrativos;
- o backend deve recusar a criação de interesse em evento demonstrativo;
- o backend deve recusar alteração de status de interesse em evento demonstrativo;
- o frontend não deve mostrar o botão de interesse como se a ação fosse real em evento demonstrativo;
- a interface pode mostrar uma mensagem explicando que a oportunidade é apenas uma demonstração;
- somente eventos com `demonstracao = 0` e proprietário real podem receber interesses persistentes;
- eventos reais devem continuar visíveis para descoberta quando existirem;
- se não houver eventos reais, a tela deve informar isso sem criar registros falsos;
- não apagar automaticamente os registros de interesse já existentes sem antes definir uma migração segura;
- se o banco atual possuir interesses em eventos demonstrativos, decidir e documentar uma limpeza/migração não destrutiva, preferencialmente marcando-os como cancelados ou removendo apenas esses registros demonstrativos, conforme a regra de integridade adotada.

Não usar fixtures para simular inscrições ou participações reais.

---

## Banco de Beats

O Banco de Beats deve deixar de ser apenas visualmente aberto para todas as contas reais.

Implementar:

- ocultação do botão `Cadastrar beat` para contas sem permissão;
- bloqueio de `GET /beats/new` para contas sem permissão;
- bloqueio de `POST /beats/new` para contas sem permissão;
- bloqueio de edição e exclusão quando a conta não tiver permissão ou não for proprietária;
- preservação da regra que impede contas demonstrativas de gravar dados;
- mensagens de autorização coerentes na interface;
- nenhuma alteração na propriedade dos Beats já existentes.

As rotas de listagem e visualização devem permanecer compatíveis com o comportamento atual, salvo se a análise demonstrar que a exposição de algum recurso precisa ser restringida por privacidade ou propriedade.

---

## Eventos e navegação

Implementar o mesmo princípio para eventos:

- mostrar `Cadastrar evento` somente para quem possui `Organizador de eventos`;
- proteger `GET /events/new` no controller;
- proteger `POST /events/new` no controller;
- proteger edição e exclusão por cargo, sessão e propriedade;
- manter acesso de descoberta para usuários autenticados;
- não permitir que um usuário altere evento de outra conta alterando parâmetros da URL;
- não permitir que uma conta perca acesso de forma silenciosa a recursos próprios sem uma política documentada;
- se uma conta remover o cargo de organizador, bloquear novos eventos, mas preservar uma forma segura de administrar ou encerrar eventos próprios já existentes para evitar dados órfãos.

A política para eventos próprios de uma conta que perdeu o cargo deve ser implementada de forma explícita e testada. Não apagar eventos automaticamente.

---

## Perfil e alteração de cargos

O formulário de cadastro já permite selecionar múltiplas categorias. A etapa deve garantir que:

- as categorias selecionadas sejam revalidadas no servidor;
- categorias inválidas nunca gerem permissões;
- o perfil exiba os cargos selecionados de maneira clara;
- a alteração das categorias recalculе as permissões futuras;
- a alteração não apague obras, Beats, eventos, créditos ou interesses já existentes;
- o `tipo_conta` continue coerente com a presença ou ausência de `Organizador de eventos`;
- a atualização de perfil não permita manipular `tipo_conta` diretamente pelo navegador;
- os status profissionais continuem sendo derivados e validados pelas categorias;
- a mudança de categorias seja coberta por testes.

Não transformar o campo textual `role` ou `funcao` em fonte de autorização se ele puder ser alterado sem validação de categoria.

---

## Arquitetura esperada

Preservar a organização atual:

- regras puras de cargo podem ficar em `modeloPerfil.ts` ou em um módulo de autorização de domínio coerente com a estrutura existente;
- controllers devem chamar helpers/model, não duplicar listas de categorias;
- routes devem permanecer no router atual;
- views devem receber flags de permissão já calculadas pelo controller;
- JavaScript deve cuidar somente de comportamento visual e interação, nunca de segurança;
- CSS deve preservar tema, responsividade e organização por área;
- não criar uma aplicação paralela ou uma segunda camada de autenticação.

Criar helpers com nomes claros, por exemplo, somente se forem coerentes com o padrão real do projeto:

- `temCategoria(usuario, categoria)`;
- `podeCriarBeat(usuario)`;
- `podeGerenciarEventos(usuario)`;
- `podeDemonstrarInteresse(usuario, evento)`;
- `podeAtualizarInteresse(usuario, evento)`.

Os nomes finais devem seguir as convenções existentes.

---

## Segurança e autorização

Toda operação de escrita deve validar no backend:

- existência de sessão;
- conta não demonstrativa;
- categoria necessária;
- propriedade do recurso;
- estado real do recurso;
- parâmetros normalizados;
- relação entre usuário da sessão e usuário/entidade informados.

Não considerar suficiente:

- esconder botão com EJS;
- desabilitar botão com JavaScript;
- confiar em `data-*` do HTML;
- confiar em `usuarioId` enviado em formulário;
- verificar somente `tipo_conta` quando a permissão depende de categoria específica.

As respostas de erro devem seguir o padrão atual do projeto, sem expor informações desnecessárias.

---

## Migração e dados existentes

Antes de alterar o schema, verificar se a etapa pode ser implementada apenas com `categorias_json` e `tipo_conta` existentes.

Se não houver necessidade de nova tabela ou coluna, documentar explicitamente que a etapa não altera o schema.

Se houver necessidade de migração:

- incrementar o schema de forma condicional;
- preservar todos os dados válidos;
- não alterar manualmente `user_version` fora do bootstrap;
- não apagar bancos existentes;
- testar migração a partir de um banco schema 7;
- atualizar documentação e relatório incremental.

A migração dos interesses em eventos demonstrativos deve ser tratada separadamente da migração estrutural, com justificativa e validação de contagens.

---

## Testes obrigatórios

Criar ou executar testes suficientes para provar:

1. conta `Beatmaker` consegue abrir o cadastro de Beat;
2. conta `Rapper / MC` sem `Beatmaker` recebe bloqueio ao tentar criar Beat por URL;
3. conta `Produtor musical` segue a regra definida para Beats;
4. conta `Organizador de eventos` consegue criar evento real;
5. conta sem `Organizador de eventos` não consegue abrir nem enviar criação de evento;
6. usuário não proprietário não consegue editar ou excluir evento;
7. múltiplas categorias concedem a união correta das permissões;
8. conta demonstrativa não consegue executar gravações;
9. evento demonstrativo não aceita novo interesse persistente;
10. evento real aceita interesse de usuário real;
11. usuário consegue cancelar interesse em evento real;
12. organizador consegue atualizar status somente em interesse do próprio evento real;
13. usuário comum não consegue alterar status de interesse por URL;
14. remover uma categoria bloqueia novas operações incompatíveis sem apagar dados existentes;
15. os botões de interface acompanham as permissões calculadas no servidor;
16. `npm run check` continua aprovado;
17. `npm run build` continua aprovado;
18. `node --check public/js/interacoes.js` continua aprovado;
19. o formatador EJS continua funcionando;
20. a aplicação inicia com banco temporário e banco schema 7 existente.

---

## Documentação obrigatória

Atualizar somente o que for necessário, preservando relatórios históricos:

- `README.md`;
- `ANALISE-PROJETO.md`;
- relatório novo em `relatorios-incrementacao/`.

Documentar:

- fonte de verdade dos cargos;
- matriz final de permissões;
- tratamento de múltiplas categorias;
- tratamento de contas demonstrativas;
- tratamento de eventos demonstrativos;
- política para recursos existentes após remoção de cargo;
- rotas protegidas;
- migrações, se existirem;
- testes executados;
- limitações que permanecerem.

---

## Restrições finais

Não implementar nesta etapa:

- MySQL;
- notificações;
- sino ou central de notificações;
- mensagens privadas;
- compras ou checkout;
- upload de áudio ou capa;
- player real;
- reputação automática;
- confirmação externa de presença;
- novas categorias não existentes no cadastro;
- exclusão automática de dados por mudança de cargo.

Ao terminar, entregue:

1. resumo objetivo das alterações;
2. lista de arquivos modificados;
3. resultado dos testes;
4. confirmação sobre alteração ou não do schema;
5. limitações restantes;
6. ZIP completo sem `node_modules`, `.env`, banco local e logs, incluindo `dist` atualizado caso o projeto o utilize para `npm start`.

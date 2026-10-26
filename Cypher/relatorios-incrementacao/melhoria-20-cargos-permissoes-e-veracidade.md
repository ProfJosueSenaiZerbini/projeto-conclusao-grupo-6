# Melhoria 20 — Cargos, permissões e veracidade das interações

## Objetivo

Alinhar as categorias profissionais já existentes no cadastro da Cypher com as permissões dos fluxos de Beats e eventos, sem criar um sistema novo de cargos, sem migrar para MySQL e sem alterar o schema SQLite v7.

## Diagnóstico

As categorias profissionais já eram armazenadas no perfil como JSON e podiam ser múltiplas. O campo `usuarios.tipo_conta` continuava limitado aos agrupamentos `profissional` e `organizador`, sendo definido pela presença de `Organizador de eventos`. Isso era suficiente para o fluxo de eventos, mas não representava capacidades específicas como `Beatmaker`.

O controller de Beats bloqueava contas demonstrativas, mas permitia que qualquer conta real acessasse o cadastro. O controller de eventos já restringia criação a organizadores, porém a verificação dependia diretamente de `tipo_conta`. A persistência de interesses também permitia registrar interesse em fixtures demonstrativas, embora elas não representassem oportunidades operacionais reais.

## Alterações realizadas

Foi criada uma camada simples de helpers no modelo de perfil para consultar categorias e verificar as capacidades de criação de Beats e eventos. A categoria `Beatmaker` passou a ser exigida para criar novos Beats. A categoria `Produtor musical` não foi transformada automaticamente em `Beatmaker`, pois o escopo adicional orienta não presumir essa equivalência sem uma regra de negócio comprovada.

A categoria `Organizador de eventos` passou a ser consultada diretamente para autorizar a criação de novos eventos, mantendo `tipo_conta` por compatibilidade. A administração de eventos reais próprios existentes continua possível mesmo se a categoria for removida posteriormente, evitando que os dados fiquem órfãos; a criação de novos eventos é bloqueada sem a categoria.

O botão de cadastro de Beat passou a aparecer somente para contas reais com `Beatmaker`. O acesso direto a `GET /beats/new` e o envio direto a `POST /beats/new` também são bloqueados para contas sem essa categoria. Consulta do Banco de Beats permanece disponível, e Beats próprios antigos não são apagados ou transferidos por alteração de categoria.

Como a alteração atingiu o domínio de eventos e Beats, as fixtures demonstrativas dessas duas áreas foram removidas. O bootstrap deixou de recriá-las e também limpa registros antigos marcados como demonstrativos, preservando registros reais. Novos interesses não podem ser registrados em eventos demonstrativos nem em eventos encerrados. As contagens de interessados operacionais continuam protegidas contra qualquer legado remanescente.

A atualização de status de participação passou a rejeitar eventos demonstrativos, eventos encerrados, participações canceladas e transições incompatíveis. O participante não recebe uma rota para confirmar a própria participação; essa operação continua reservada ao responsável autorizado pelo evento real.

## Compatibilidade e banco

Não houve alteração do schema. A implementação usa `perfis.categorias_json`, `usuarios.tipo_conta` e `eventos.demonstracao` já existentes. Registros legados de eventos e Beats demonstrativos são removidos no bootstrap, juntamente com ofertas vinculadas e interesses associados por cascata; registros reais não são removidos.

## Validações executadas

Foram executados:

- `npm run check`;
- `npm run build`;
- `node --check public/js/interacoes.js`;
- formatação pelo Prettier nos arquivos de código;
- formatação dos templates pelo utilitário EJS do projeto;
- acesso de `Beatmaker` a `/beats/new` com resposta 200;
- bloqueio de `Rapper / MC` e `Organizador de eventos` em `/beats/new`;
- acesso de organizador a `/events/new` com resposta 200;
- bloqueio de usuário sem organizador em `/events/new`;
- limpeza de fixtures antigas, confirmando zero eventos e Beats demonstrativos e preservando registros reais;
- criação de evento real por organizador;
- registro de interesse de outro usuário em evento real;
- criação de Beat real por `Beatmaker`;
- rejeição de tentativa direta de criação de Beat por conta sem `Beatmaker`.

O schema permaneceu na versão 7. Não houve alteração de dados do banco do usuário; os testes usaram `/tmp/cypher-cargos.sqlite`.

## Limitações mantidas

A categoria `Produtor musical` ainda não concede automaticamente a criação de Beats. Essa decisão evita inventar uma regra não comprovada no projeto e pode ser revista em etapa própria.

Ainda não existem compra, checkout, upload de áudio, player real, mensagens, notificações ou métricas históricas detalhadas de participação. Eventos e Beats demonstrativos não são mais utilizados nesses módulos; a experiência depende de registros reais criados por contas autorizadas.

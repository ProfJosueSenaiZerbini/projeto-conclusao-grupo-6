# PROMPT DE IMPLEMENTAÇÃO — SEGUIDORES, AMIZADES E MENSAGENS NO CYPHER

Você está trabalhando no projeto **Cypher**, uma plataforma profissional voltada à cena underground do rap. Implemente no sistema existente uma camada social com **seguidores, amizades e conversas/mensagens privadas persistentes**, preservando a arquitetura, os dados, as regras atuais e a identidade visual do projeto.

## 1. Contexto técnico obrigatório

O projeto usa Node.js, TypeScript, Express, EJS, SQLite com `better-sqlite3`, arquitetura MVC, JavaScript sem framework no frontend e CSS modular com temas claro/escuro. O schema atual é v16 e usa migrações aditivas. Antes de editar, leia o `README.md`, `ESCOPO-ATUALIZADO-CYPHER.md`, `package.json`, as rotas, controllers, models, views, partials, CSS/JS e scripts de teste pertinentes. Confirme no código a versão real do schema e siga os padrões existentes; não presuma nomes de funções, tabelas, middlewares ou mecanismos de segurança sem inspecioná-los.

A aplicação já possui perfis públicos/privados, filtros de privacidade, sessões e notificações persistentes. **Notificações não são mensagens** e não devem ser reaproveitadas como se armazenassem conversas. A busca pública de perfis também não equivale a uma relação de seguir ou amizade.

Preserve as regras de negócio e garantias atuais, incluindo cooldown de 60 dias para alteração de categorias, solicitações de exceção, snapshots/auditoria, filtros de privacidade e salvamento independente das seções do perfil. Não altere o funcionamento de obras, créditos, eventos, Beats ou contas fora do necessário para integrar os novos recursos.

## 2. Objetivo do recurso

Criar uma experiência de conexões entre profissionais com três relações distintas:

1. **Seguir:** unilateral. A pessoa A pode seguir B sem que B precise seguir A.
2. **Amizade:** bilateral, iniciada por solicitação e efetivada somente após aceite.
3. **Mensagens:** conversas privadas individuais, com histórico persistente e acesso limitado aos participantes.

Seguir não cria amizade; amizade não cria automaticamente um follow. Nenhuma dessas relações prova que os usuários trabalharam juntos. Não misture amizade/follow com créditos profissionais nem com a futura Rede de Colaboradores.

## 3. Política funcional padrão do MVP

Implemente estes comportamentos, salvo se o sistema já possuir uma decisão equivalente documentada:

- Um usuário autenticado pode seguir e deixar de seguir outro usuário elegível. Não pode seguir a si mesmo. Relações duplicadas devem ser impossíveis mesmo sob requisições repetidas ou concorrentes.
- Solicitações de amizade têm estados claros: pendente, aceita ou recusada/cancelada, com solicitante, destinatário, datas e transições válidas. Só o destinatário aceita ou recusa; o solicitante pode cancelar enquanto estiver pendente. Não permitir solicitação duplicada nem duas solicitações pendentes em direções opostas para o mesmo par. Uma amizade existente deve poder ser removida por qualquer participante sem deixar uma relação ativa inconsistente.
- Um usuário pode iniciar uma **solicitação de mensagem** com uma pessoa que ainda não é sua amiga. Enquanto estiver pendente, o destinatário pode aceitar ou recusar; o remetente não pode enviar mensagens sucessivas para contornar a solicitação. Após aceita, a conversa passa a permitir troca normal. A aceitação do pedido de mensagem **não** cria amizade automaticamente.
- Amigos podem iniciar conversas diretas sem pedido prévio. Caso já exista conversa direta entre o par, reutilize-a em vez de criar outra.
- Usuários podem restringir quem pode enviar pedidos de mensagem por meio de configuração simples de privacidade se isso se integrar com segurança ao modelo atual. No mínimo, respeite bloqueios, contas inválidas e as regras de visibilidade existentes.
- **Bloqueio:** bloquear impede follow, pedido/aceite de amizade, novos pedidos de mensagem e envio/recebimento de mensagens entre as partes enquanto vigente. Não exponha a uma parte dados privados da outra. Desbloquear não recria automaticamente amizades ou follows removidos. Defina a política de relações preexistentes de forma consistente e teste-a.
- Inclua ação de denúncia/relato de usuário ou mensagem, persistida para moderação administrativa, se isso puder ser feito dentro do escopo sem criar uma tela administrativa insegura. Se não houver um fluxo seguro e completo nesta etapa, registre-o como pendência e não crie um botão sem operação real.

## 4. Persistência: mensagens não desaparecem

As mensagens devem permanecer no banco após logout, encerramento do navegador e reinicialização do servidor. Não implemente mensagens temporárias, TTL, exclusão automática ou limpeza silenciosa. No MVP, oferecer **arquivar/ocultar conversa somente para a própria caixa** é preferível a apagar mensagens. Ocultar não apaga a cópia nem o histórico do outro participante. Se exclusão global for considerada, não a implemente sem uma regra explícita, confirmação e tratamento simétrico claramente informado.

Use tabelas e índices que sigam os padrões do projeto, com chaves estrangeiras e restrições de unicidade. Modele de forma apropriada, sem impor esses nomes se a convenção atual indicar outros:

- follows com `seguidor_id`, `seguido_id`, data e restrição única do par;
- solicitação/amizade com participantes, autor, estado e timestamps, garantindo um único estado ativo por par, independentemente da ordem dos IDs;
- conversas diretas e participantes, assegurando uma única conversa direta para o mesmo par;
- mensagens com conversa, remetente, conteúdo de texto, data/hora e estado de persistência;
- estado de leitura/última leitura por participante e estado individual de arquivamento/ocultação;
- bloqueios e denúncias, conforme o escopo de segurança aprovado.

Adicione migração **aditiva, transacional, idempotente e compatível com a versão vigente**, provavelmente schema v17 após confirmar o estado atual. Não recrie tabelas existentes, não apague dados, não faça downgrade destrutivo e **não use `REPLACE`, `INSERT OR REPLACE` nem estratégias que apaguem/recriem registros** para simular upsert. Prefira `INSERT ... ON CONFLICT DO NOTHING` ou atualização explícita que preserve os dados, conforme o caso e a versão SQLite usada pelo projeto. Mantenha integridade referencial e os comportamentos atuais de inicialização/migração.

A persistência não é uma promessa de backup: documente que a retenção depende do banco hospedado e de cópias de segurança. Não inclua banco real, segredo, `.env` ou dados sensíveis no ZIP de entrega.

## 5. Caixa de entrada e experiência de conversa

Implemente uma primeira versão responsiva, coerente com os padrões EJS, JavaScript e CSS atuais:

- página de **Mensagens** com lista de conversas, identidade/perfil do interlocutor, trecho da última mensagem, data/hora, estado de leitura e contador de não lidas;
- área separada de **Solicitações** para pedidos de mensagem não aceitos, com aceitar/recusar;
- conversa individual com histórico em ordem cronológica e carregamento paginado ou por cursor, sem buscar todas as mensagens de uma vez;
- campo de composição com limite de tamanho validado no cliente e no servidor, feedback de envio e estados vazios/erro/carregamento;
- atualizar automaticamente novas mensagens com polling moderado e configurável, se não existir infraestrutura de tempo real já adotada. Não introduza WebSocket, serviço externo ou dependência nova sem justificar necessidade, custo de operação e compatibilidade com a arquitetura atual;
- navegação para o perfil público conforme permissões, indicador de mensagens não lidas e entrada acessível pela navegação existente;
- experiência adequada a telas pequenas, teclado e leitores de tela, mantendo os temas claro/escuro, os estilos contrastantes e a identidade visual underground/Jamaica do Cypher. Reutilize partials/componentes e tokens CSS existentes em vez de duplicar blocos de estilo.

No MVP, mensagens são texto simples. Não implemente imagens, áudio, anexos, grupos, chamadas, criptografia ponta a ponta ou busca avançada sem autorização/escopo separado. Não renderize HTML enviado pelo usuário; escape conteúdo EJS e evite XSS.

## 6. Segurança e privacidade — critérios obrigatórios

- Em **toda** operação, derive o usuário atual da sessão validada no servidor; nunca confie em `user_id`, participante, remetente ou proprietário fornecido pelo navegador.
- Confirme no servidor que a pessoa pertence à conversa antes de listar, abrir, paginar, enviar, marcar como lida, arquivar ou denunciar.
- Impedir enumeração de conversas e mensagens por alteração de IDs na URL ou no corpo da requisição. Respostas a recursos inacessíveis devem seguir o padrão seguro já usado pelo projeto.
- Reutilize a proteção CSRF, validação, tratamento de erros, sessão e autorização já existentes. Não exponha conteúdo de mensagem em notificações públicas, HTML de perfis ou logs comuns.
- Validar limite e conteúdo da mensagem no servidor, impedir texto vazio, normalizar entradas de forma segura e limitar frequência/tentativas para reduzir spam. Não revelar se uma conta privada existe em respostas públicas mais do que o necessário ao fluxo autenticado.
- Aplicar as políticas de perfil público/privado e bloqueio sem contornar filtros já existentes.
- Prever prevenção contra duplicatas e condições de corrida com transações/índices, e usar consultas preparadas.
- Não registrar conteúdo privado em logs; não usar conteúdo da mensagem como HTML; não armazenar tokens/segredos dentro dos registros de mensagens.

## 7. Arquitetura e limites da mudança

Siga o MVC e a organização já existente: rotas Express, controller, model, validators, views EJS, partials, JS modular e CSS modular. Separe operações de relacionamento de operações de mensagem. Mantenha controllers de tamanho razoável; extraia funções/módulos quando houver responsabilidade real compartilhada, sem introduzir uma nova arquitetura, framework ou hierarquia desnecessária.

Use rótulos e mensagens de interface em português brasileiro, conforme o restante do produto. Reutilize o componente de estado vazio e padrões de navegação. Não reescreva a autenticação ou o sistema de notificações; integre apenas o indicador de não lidas se isso puder ser feito sem misturar notificações com mensagens.

## 8. Implementação em etapas

Trabalhe em pequenas etapas e valide cada uma:

1. **Inspeção e plano:** mapear os padrões atuais de rotas, sessão, validação, migrações, componentes, privacidade e testes. Apresentar um plano curto, arquivos afetados, riscos e decisão de esquema antes de alterar.
2. **Banco e modelos:** migração aditiva; operações de follows, solicitações/amizades, bloqueios, conversas, mensagens, leitura e arquivamento com transações e restrições adequadas.
3. **Serviços HTTP:** rotas/controllers/validators protegidos para cada operação; validar autorização no servidor e erros previsíveis.
4. **Interfaces:** lista de conversas, solicitações e chat individual; responsividade, acessibilidade, estados vazios e atualização periódica segura.
5. **Integração:** ligação com navegação e contador de não lidas; verificar que privacidade, notificações e perfil existentes continuam corretos.
6. **Testes, documentação e entrega:** rodar build e suítes existentes, acrescentar testes automatizados próprios, atualizar documentação e criar relatório incremental individual. Gerar ZIP completo atualizado após a mudança significativa, incluindo fonte, build e documentação, sem `node_modules`, `.env`, credenciais ou banco local.

## 9. Testes obrigatórios e critérios de aceite

Acrescente testes no padrão existente para provar, no mínimo:

- migração de banco novo e atualização da versão anterior para a nova; repetição da migração sem duplicatas; preservação das tabelas/dados anteriores e recusa segura de schema futuro;
- seguir/deixar de seguir, impedir auto-follow, duplicatas e solicitação duplicada em ordens opostas;
- solicitar, aceitar, recusar, cancelar e remover amizade, validando apenas transições autorizadas;
- pedido de mensagem para não amigo, aceitação/recusa, bloqueio do envio enquanto pendente e envio permitido após aceite; aceitar pedido não cria amizade;
- reutilização de uma conversa direta entre o mesmo par e ausência de conversa duplicada em chamadas repetidas;
- persistência do histórico após reinicialização/novo acesso e ordenação/paginação corretas;
- leitura/não lida e contador por participante; arquivamento individual sem apagar o histórico do outro;
- isolamento: usuário externo à conversa não pode ler, enviar, marcar como lida ou arquivar, mesmo manipulando IDs;
- bloqueio aplicado em ambas as direções e efeito consistente sobre relações existentes;
- validação de mensagem vazia, limite de tamanho, spam/rate limit, XSS e conteúdo não confiável;
- privacidade de perfis e controle de acesso, além de navegação responsiva/estados de teclado para os novos fluxos.

Critérios finais:

1. Mensagens privadas persistem e não desaparecem automaticamente.
2. Só participantes autorizados conseguem acessar uma conversa.
3. Follow, amizade e crédito profissional são entidades distintas.
4. Pedidos de amizade e mensagem têm estados e transições compreensíveis.
5. Bloqueios e controles de privacidade são respeitados no servidor.
6. O sistema continua inicializando no mesmo stack e preserva migrações/dados prévios.
7. Build e testes existentes e novos passam; qualquer teste indisponível ou falha é relatado, não ocultado.
8. UI funciona em tema claro/escuro e telas pequenas, sem degradar a identidade visual atual.
9. Relatório incremental documenta a implementação; ZIP contém fonte, build e documentação atualizados.

## 10. Limites e registro da entrega

Não implemente funcionalidades fora do escopo do MVP listado. Se encontrar contradição com uma regra existente, pare a alteração conflitante, descreva a evidência e proponha a decisão mínima necessária; não remova regras de negócio silenciosamente. Preserve os fluxos atuais de perfil, categoria, exceção, auditoria, privacidade, obras, eventos, Beats e notificações.

Ao concluir, informe: comportamento entregue; tabelas/migração; rotas e telas; política final de pedidos e bloqueios; arquivos alterados; resultados exatos de build/testes; limitações conhecidas; caminho do relatório incremental e do ZIP atualizado. Não declare criptografia ponta a ponta, backup, tempo real ou retenção absoluta se não tiverem sido implementados e verificados.

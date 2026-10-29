# Melhoria 25 — Revisão de categorias profissionais

## Objetivo

Tornar persistente e operacional a solicitação de categorias profissionais que não existem nas opções, em paralelo ao fluxo já existente de revisão de gêneros musicais. Reorganizar a área da equipe para que a navegação lateral apresente **Administrador**, com as **Análises** e demais ferramentas exclusivas agrupadas dentro dessa área.

## Fluxo implementado

Uma pessoa pode sugerir um nome durante o cadastro ao escolher “Outros” ou, já autenticada, pela seção “Sugerir nova categoria profissional” na edição do perfil. A solicitação do perfil é independente da edição das categorias ativas: continua disponível durante o bloqueio de 60 dias e não modifica categorias, status nem capacidades da conta. O cadastro também não grava o texto livre no nome/função do perfil.

A nova solicitação fica em `propostas_categorias` com estado `pendente`, autoria e data. Nomes de categorias base ou já aprovadas não criam novas propostas; nomes já pendentes são deduplicados globalmente por comparação normalizada. Valores livres que existiam em perfis reais antes desta mudança são retirados do campo público e encaminhados para análise durante a migração.

Na área administrativa, a equipe pode aprovar ou rejeitar cada proposta com justificativa entre 5 e 500 caracteres. A decisão registra estado, instante, identificador/e-mail do revisor e motivo. Apenas propostas aprovadas passam a integrar as opções de cadastro, edição de perfil e validação no servidor. A lista combina valores base com os nomes aprovados, elimina duplicidades normalizadas e continua sem confiar em valores enviados pelo cliente.

Uma categoria aprovada é uma entrada da taxonomia, não uma permissão: não habilita Beats, obras, eventos, administração ou qualquer capacidade especial. A aprovação não altera automaticamente as categorias atuais do solicitante, não consome exceção administrativa e não reinicia o prazo de 60 dias. Categorias personalizadas podem receber apenas os status genéricos de disponibilidade; os status especializados continuam ligados às categorias base correspondentes.

## Painel e autorização

A entrada lateral “Análises” foi renomeada para **Administrador** e continua visível somente a contas cujo e-mail esteja em `CYPHER_ADMIN_EMAILS`. Dentro de `/admin/revisao`, a navegação interna separa “Análises” (fila de gêneros e novas categorias) de “Exceções de categorias” (autorização única e auditada de mudança antes do prazo). A autorização continua baseada exclusivamente na allowlist do servidor, nunca em categoria profissional, tipo de conta ou campo controlado pelo cliente.

## Banco e migração

O schema passa de v12 para v14. A tabela `propostas_categorias` armazena solicitações e decisões com chave estrangeira para a conta que sugeriu. A tabela `categorias_profissionais_aprovadas` conserva os nomes liberados, motivo e identidade/e-mail do revisor sem depender da existência da conta autora. Índices parciais impedem duplicidade comum entre propostas pendentes e aprovadas; a camada transacional também compara nomes normalizados, incluindo acentos, antes de inserir ou aprovar. Não foi usado `REPLACE` SQL nem substituição destrutiva de linhas.

Na migração, valores personalizados legados em perfis reais com categoria “Outros” são convertidos em propostas pendentes, a função pública volta a refletir as categorias selecionadas e `outra_categoria` é limpa. Assim, nomes antigos também passam por revisão, em vez de continuarem publicados automaticamente.

## Rotas

- `POST /profile/categorias/sugerir`: cria solicitação autenticada de inclusão de categoria profissional.
- `POST /categories/analyze`: mantém compatibilidade como endpoint JSON autenticado e agora grava uma solicitação real, sem pré-análise simulada.
- `POST /admin/revisao/categorias-profissionais/:id`: aprova/rejeita com justificativa e auditoria.
- `POST /admin/revisao/excecoes-categorias/:id`: autoriza uma mudança excepcional de categoria, preservando sua separação da moderação da taxonomia.

## Verificações executadas

- `npm run test:db`: banco novo, migrações v5/v7/v11/v12/v13 → v14, backfill das propostas legadas e das aprovações v13 para o catálogo permanente, reinicialização idempotente, integridade referencial e recusa de schema futuro.
- `npm run test:db`: ciclo comportamental de cooldown e exceção, moderação de gêneros, cadastro com “Outros”, proposta pendente, aprovação/rejeição de categoria, deduplicação de caixa/espaços, persistência da categoria após exclusão da conta autora, disponibilidade dinâmica e prova de que categorias novas não concedem capabilities.
- `npm run check` e `npm run build`: TypeScript e build de produção.
- Smoke test HTTP em banco temporário: cadastro gera proposta pendente, painel restrito lista e aprova, categoria aprovada aparece no formulário público e solicitação pelo perfil é persistida; conta não-admin recebe 403 e não vê o item Administrador na navegação.
- `node --check public/js/interacoes.js`: sintaxe do JavaScript do navegador.

## Decisões explícitas

A aprovação publica o nome como opção global, mas não muda automaticamente o perfil do solicitante. Para selecionar essa categoria no próprio perfil, a pessoa usa o fluxo normal de edição, que continua sujeito ao prazo de 60 dias ou à exceção autorizada. Isso evita que o processo de moderação contorne a política de alteração de categorias.

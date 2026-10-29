# Melhoria 27 — Solicitação e decisão de exceção ao cooldown de categorias

## Objetivo

Permitir que uma pessoa profissional solicite uma alteração excepcional de categorias antes do fim do prazo de 60 dias. O pedido é analisado por um administrador autorizado; a aprovação libera uma alteração única e a recusa é registrada com justificativa. O prazo continua sendo aplicado no SQLite e não pode ser contornado pela interface.

## Fluxo

1. Durante o período de bloqueio, a pessoa encontra no formulário de edição do perfil um campo para justificar o pedido (10 a 500 caracteres).
2. O sistema registra a solicitação como pendente, sem liberar a edição e sem reiniciar ou reduzir o cooldown. Cada conta pode manter no máximo uma solicitação pendente.
3. Na página `/admin/revisao/excecoes`, administradores incluídos em `CYPHER_ADMIN_EMAILS` avaliam o motivo original e registram a justificativa da decisão (5 a 500 caracteres).
4. A aprovação cria — ou associa, se já houver — uma autorização administrativa de uso único. A autorização só é consumida junto com a mudança efetiva de categorias, na mesma transação que grava a auditoria.
5. A recusa não cria autorização. A pessoa vê o motivo registrado e pode enviar um novo pedido se ainda estiver dentro do prazo.
6. Solicitações abertas são decididas pela fila própria; a concessão direta continua disponível para outros casos, mas fica bloqueada enquanto houver pedido pendente para a conta.

## Persistência e compatibilidade

O schema avança de v14 para v15 com a tabela `solicitacoes_excecao_categorias`. Ela conserva o motivo enviado, estado (`pendente`, `aprovado` ou `rejeitado`), horários, identidade/e-mail do revisor, justificativa da decisão e vínculo à autorização gerada. Uma chave estrangeira preserva a autorização de uso único existente; exclusão da conta remove seus pedidos conforme a política atual de retenção por conta. Um índice parcial garante um único pedido pendente por pessoa. A criação da tabela e dos índices é idempotente e acontece na transação de inicialização, sem reescrever categorias ou remover dados já existentes.

## Rotas acrescentadas

- `POST /profile/categorias/solicitar-excecao`: exige sessão, rejeita contas demonstrativas e valida o motivo no controller e as condições de elegibilidade no model.
- `POST /admin/revisao/solicitacoes-excecao/:id`: exige sessão e e-mail na allowlist; só aceita ações `aprovar` e `rejeitar` com justificativa.

As decisões são transacionais e condicionadas a `status = 'pendente'`, impedindo que um mesmo pedido seja decidido duas vezes. A aprovação também valida novamente o prazo no servidor/SQLite e libera no máximo uma alteração.

## Interface e acessibilidade

O perfil informa se o pedido está aguardando análise ou se uma solicitação anterior foi recusada, exibindo a justificativa administrativa. O painel apresenta a fila separada da lista de contas para concessão direta, com os dois comandos identificados por texto, campo de justificativa associado a um rótulo e feedback de resultado. O formulário reutiliza tokens e componentes existentes e se adapta às telas menores; não foi adicionada dependência visual ou de execução.

## Validação

A suíte `npm run test:db` cobre a migração explícita v14→v15, unicidade de pedidos pendentes, duplicidade, recusa sem autorização, novo pedido após recusa, aprovação auditada, liberação e consumo único do override. `npm run test:admin-ui` cobre envio HTTP de usuário, motivo curto inválido, apresentação do pedido, recusa e aprovação pela allowlist, atualização dos estados visíveis no perfil e bloqueio da decisão por não-administrador. Também são executados o check TypeScript, build e compilação dos templates EJS.

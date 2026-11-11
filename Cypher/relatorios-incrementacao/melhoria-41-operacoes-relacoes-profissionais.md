# Melhoria 41 — Operações das relações profissionais

## Objetivo

Implementar as operações de leitura e escrita das novas relações profissionais adicionadas no schema v17, sem alterar o fluxo legado de categorias, sem apagar histórico e sem permitir vertentes para profissões não elegíveis.

## Operações implementadas

As operações foram adicionadas a `src/app/models/bancoDados.ts`.

### Profissões por usuário

`listarProfissoesUsuarioCypher(usuarioId, opcoes)`:

- retorna profissões ativas por padrão;
- pode retornar também vínculos inativos com `incluirInativas: true`;
- preserva `profissaoId`, `valorOriginal`, `origem`, `estado` e timestamps;
- ordena pela data de seleção.

`salvarProfissoesUsuarioCypher(usuarioId, entradas)`:

- aceita múltiplas profissões no mesmo salvamento;
- valida IDs contra o catálogo central;
- rejeita profissão duplicada na entrada;
- rejeita valor original vazio;
- reativa vínculo inativo existente sem criar duplicata;
- cria novo vínculo quando necessário;
- marca como `inativa` a profissão que deixou de ser selecionada;
- preserva o registro e seu histórico, sem `DELETE` ou `REPLACE`;
- sincroniza a associação das vertentes na mesma transação.

Os valores sem `profissaoId` continuam suportados para compatibilidade futura com valores legados ou personalizados, usando `valorOriginal` como chave de recuperação.

### Vertentes profissionais por usuário

`listarVertentesProfissionaisUsuarioCypher(usuarioId, opcoes)`:

- retorna somente escolhas ativas e associadas por padrão;
- pode retornar o histórico completo com `incluirInativas: true`;
- expõe separadamente `ativa` e `associacaoAtiva`.

`salvarVertentesProfissionaisUsuarioCypher(usuarioId, vertentes)`:

- valida cada valor contra a lista fixa de 16 vertentes;
- rejeita qualquer vertente não autorizada;
- exige ao menos uma profissão ativa entre `rapper`, `mc` e `freestyler`;
- ativa ou reativa escolhas existentes;
- marca escolhas removidas como inativas sem apagá-las;
- mantém a associação compartilhada em uma linha por usuário e vertente.

`sincronizarVertentesProfissionaisUsuarioCypher(usuarioId)`:

- verifica profissões elegíveis ativas no servidor;
- marca `associacaoAtiva = 1` quando há Rapper, MC ou Freestyler ativo;
- marca `associacaoAtiva = 0` quando a última profissão elegível é removida;
- não altera `ativa`, preservando a seleção para futura reativação.

## Regras de segurança e integridade

A elegibilidade é derivada da tabela `profissoes_usuario` e não de payload de interface. Portanto, uma requisição não pode obter permissão para vertentes apenas enviando `vertenteId`.

A camada usa transações do `better-sqlite3`, atualizações explícitas e IDs gerados por `randomUUID()`. Não usa `REPLACE`, `INSERT OR REPLACE`, exclusão/recriação ou conversão textual de categorias existentes.

A operação de profissões não altera `perfis.categorias_json`, permissões de Beats/eventos, cooldown, auditoria ou respostas atuais. A integração com controllers e telas permanece para a etapa de fluxo de cadastro/edição.

## Cenários cobertos

O teste `scripts/testar-relacoes-profissionais.mjs` comprova:

1. seleção múltipla de Rapper, MC e Beatmaker;
2. persistência de Trap e Drill;
3. remoção parcial de Rapper mantendo MC e vertentes ativas;
4. remoção da última profissão elegível mantendo as vertentes selecionadas, mas com associação inativa;
5. rejeição de nova seleção de vertentes sem profissão elegível;
6. reativação de Rapper e recuperação das vertentes sem criar novos registros;
7. preservação do histórico de profissões inativadas.

## Validação executada

```text
npm run check
  passou

npm run build
  passou

npm run test:relations
  passou — seleção, inativação, preservação e reativação

npm run test:persistence
  passou — 16 vertentes e elegibilidade

npm run test:catalog
  passou — 7 grupos e 36 profissões

npm run test:compatibility
  passou — compatibilidade segura/ambígua/personalizada

npm run test:db
  passou — migrações, v17, integridade, idempotência e políticas

npm run test:admin-ui
  passou — regressão administrativa, busca, obras, eventos e permissões
```

## Próxima etapa

A próxima unidade deverá conectar essas operações ao cadastro e à edição de perfil, definir a persistência das respostas por `usuario_id + profissao_id` e adaptar os questionários sem misturar respostas de profissões diferentes. A autorização de cada controller deverá continuar verificando o proprietário da conta antes de chamar as operações.

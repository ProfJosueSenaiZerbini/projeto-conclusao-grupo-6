# Melhoria 40 — Persistência por usuário–profissão e vertentes profissionais

## Objetivo

Executar a etapa de definição estrutural da persistência profissional, separando:

1. a relação entre usuário e profissão;
2. as respostas futuras vinculadas a cada profissão;
3. as vertentes profissionais compartilhadas de Rapper, MC e Freestyler;
4. os gêneros de obras, que continuam no armazenamento existente e não são reutilizados como vertentes profissionais.

## Schema

O schema SQLite foi atualizado de v16 para **v17** com migração aditiva, transacional e idempotente. Nenhum registro existente foi convertido ou removido.

### `profissoes_usuario`

Tabela preparada para uma relação individual usuário–profissão:

- `id`: identificador do vínculo;
- `usuario_id`: chave estrangeira para `usuarios` com `ON DELETE CASCADE`;
- `profissao_id`: ID estável do catálogo novo, podendo ficar nulo para valor sem mapeamento seguro;
- `valor_original`: rótulo/valor persistido original, preservado sem renomeação;
- `origem`: `catalogo`, `legado` ou `personalizado`;
- `estado`: `ativa`, `inativa` ou `pendente`;
- `selecionada_em`, `desativada_em` e `atualizada_em`.

Há índices por usuário, estado e profissão, além de índice único parcial para impedir dois vínculos ativos do mesmo usuário com o mesmo `profissao_id`.

A coluna `profissao_id` não possui FK textual para evitar que o schema duplique a fonte central de IDs antes da decisão final de catálogo persistido. A validação do ID será feita no serviço de domínio quando os fluxos de cadastro/edição forem conectados.

### `vertentes_profissionais_usuario`

Tabela preparada para a seleção compartilhada de vertentes:

- `id`: identificador do registro;
- `usuario_id`: chave estrangeira para `usuarios` com `ON DELETE CASCADE`;
- `vertente_id`: ID textual da lista autorizada de 16 vertentes;
- `ativa`: indica se a escolha está ativa;
- `associacao_ativa`: indica se a associação profissional elegível está ativa;
- `criada_em`, `desativada_em` e `atualizada_em`;
- unicidade por usuário e vertente.

A combinação de `ativa = 0` e `associacao_ativa = 0` preserva o histórico quando o usuário remove a última profissão elegível. A reativação poderá recuperar a escolha sem recriar o registro.

As vertentes são armazenadas uma vez por usuário, não uma vez por profissão. Isso representa a regra do prompt de que Rapper, MC e Freestyler compartilham um único seletor. A elegibilidade será derivada das profissões ativas, e não de uma permissão concedida pela tabela de vertentes.

## Catálogo de vertentes

Foi criado `src/app/models/modeloProfissionalPersistido.ts` com exatamente 16 vertentes:

```text
Boom bap
Gangsta rap
G-Funk
R&B
Gospel
Jazz rap
Trap
Grime
Drill
Plug
PluggnB
Rage
Melodic rap
Detroit rap
Jersey Club Rap
Trap soul
```

Também foram definidos os únicos IDs profissionais elegíveis para o seletor:

```text
rapper
mc
freestyler
```

A função `profissaoPodeSelecionarVertentes()` rejeita Beatmaker, Produtor(a), DJ, Organizador(a) de eventos e qualquer profissão fora dos três IDs elegíveis. A função `vertenteProfissionalPermitida()` rejeita valores atuais como `Rap` e `Outro`, evitando confusão com gêneros de obras e com o seletor legado.

## Preservação e limites

Esta etapa não faz backfill de `perfis.categorias_json` para `profissoes_usuario`. Isso é intencional: os valores `Produtor musical`, `Rapper / MC`, `Outros` e categorias personalizadas ainda possuem compatibilidade ambígua ou governança própria.

A tabela existente `respostas_atuacao_categoria` também não foi substituída. As respostas atuais continuam sendo lidas e gravadas pelo fluxo vigente. A migração por profissão e a futura tabela de respostas por `profissao_id` ficam para a unidade posterior, depois da definição dos contratos de questionário e da conversão segura.

Nenhuma permissão foi ligada à nova tabela. As regras atuais de Beatmaker e Organizador de eventos continuam dependentes dos valores e validators existentes no servidor.

## Testes e validações

Foi criado `scripts/testar-persistencia-profissional.mjs`, com verificações de:

- exatamente 16 vertentes;
- unicidade das vertentes;
- elegibilidade exclusiva de `rapper`, `mc` e `freestyler`;
- rejeição de profissões não elegíveis;
- rejeição de `Rap` e `Outro` como vertentes profissionais.

O teste de banco foi atualizado para verificar:

- schema v17 em banco novo;
- presença das duas tabelas novas;
- migração de bases v5, v7, v11, v12, v13, v14, v15 e v16;
- idempotência da inicialização;
- ausência de backfill automático;
- integridade referencial;
- recusa de schema futuro.

Comandos executados com sucesso:

```text
npm run check
npm run build
npm run test:persistence
npm run test:catalog
npm run test:compatibility
npm run test:db
npm run test:admin-ui
```

## Próxima etapa

A próxima unidade deve implementar as operações de leitura/escrita dessas relações e definir a tabela/contrato de respostas vinculadas a `usuario_id + profissao_id`, sem misturar dados de profissões diferentes. Também deverá decidir como os valores seguros da matriz de compatibilidade serão materializados para usuários existentes, mantendo os valores ambíguos e personalizados consultáveis.

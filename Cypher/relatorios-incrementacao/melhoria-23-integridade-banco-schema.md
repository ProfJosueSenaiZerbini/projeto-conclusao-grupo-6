# Melhoria 23 — Integridade do banco e coerência do schema

## Objetivo

Corrigir as falhas do bootstrap SQLite, esclarecer o schema suportado e reduzir risco de migrações parciais. Os testes usam bancos temporários; nenhum banco persistente do usuário foi aberto ou alterado.

## Correções aplicadas

- Removida a migração que executava `REPLACE(...)` e tentava gravar em `perfis.role`, coluna que não existe no schema físico. O nome físico é `perfis.funcao`; `role` permanece apenas como alias em alguns resultados da aplicação.
- `Empresário` permanece como valor canônico das categorias no código. A inicialização não reescreve categorias por substituição de texto.
- Versão do schema suportada atualizada para 11.
- DDL, migrações condicionais, preenchimento de identificadores, índices, migração de ofertas, limpeza de fixtures e seed são executados dentro de uma transação SQLite. `user_version` só é atualizado depois das etapas estruturais e de dados concluírem.
- Em caso de falha, a transação é revertida, a referência global ao banco é limpa e a conexão é fechada.
- Garantia das colunas posteriores de perfil, obras, Beats e eventos por inspeção de `PRAGMA table_info`, com execução apenas quando ausentes.
- Backfill de IDs públicos/números sequenciais ausentes, sem sobrescrever valores existentes, incluindo bancos cujo `user_version` não reflita perfeitamente o estado físico.
- Índices únicos explícitos para IDs públicos não nulos e números sequenciais de contas reais em bancos atualizados.
- Documentação principal atualizada para apontar a versão 11 e o relatório histórico atualizado para distinguir o schema corrente dos trechos históricos.

## Verificações

Adicionado o comando `npm run test:db`, que testa em diretório temporário:

1. Inicialização de banco novo e presença das tabelas atuais.
2. Campo físico `funcao`, sem coluna `role`.
3. Índices de unicidade de identificadores.
4. Migração simulada v5→v11, recriando estruturas posteriores de interesses, ofertas, notificações, Beats e eventos.
5. Migração simulada v7→v11 com ausência da tabela de notificações.
6. Preservação das contagens semeadas durante as migrações.
7. Reinicialização idempotente em v11.

Também foram executados `npm run check` e `npm run build` após as mudanças.

## Limites e observações

- A migração não tenta converter textos antigos de categoria via `REPLACE`. O banco de teste não contém contas reais e o projeto ainda está em desenvolvimento, conforme decisão de produto registrada.
- IDs duplicados já existentes impedem a criação do índice único e fazem a migração falhar atomicamente em vez de escolher silenciosamente qual valor preservar.
- O histórico de versões 9 e 10 não está detalhado nos relatórios anteriores. A versão 11 passa a ser o marco documentado pelo código e por este relatório.

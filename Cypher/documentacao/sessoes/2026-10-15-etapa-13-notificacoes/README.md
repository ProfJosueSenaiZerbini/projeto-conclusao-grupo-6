# Sessão de mudança — Etapa 13: notificações persistentes

**Data:** 15 de outubro de 2026  
**Escopo autorizado:** Etapas 1 e 2 do Prompt mestre de evolução do Cypher.  
**Status:** concluído e validado.

## Limites respeitados

- Não houve implementação de mensagens.
- Não houve implementação de compras ou checkout.
- Não foram criadas notificações artificiais no banco da aplicação.
- A arquitetura MVC, a fachada `CypherModel`, os controllers por domínio e o entry point ES existente foram preservados.
- A migração foi incremental e compatível com bancos existentes.

## Arquivos alterados

### Banco e domínio

- `src/app/models/bancoDados.ts`
- `src/app/models/modeloCypher.ts`

### Controllers e rotas

- `src/app/controllers/controladorCompatibilidade.ts`
- `src/app/controllers/controladorNotificacoes.ts`
- `src/app/routes/rotasCypher.ts`
- `src/aplicacao.ts`

### Views

- `views/partials/barra-superior.ejs`
- `views/pages/notificacoes.ejs`

### Frontend

- `public/js/app.js`
- `public/js/notificacoes.js`
- `public/css/notificacoes.css`
- `public/css/tema.css`

### Documentação

- `ANALISE-PROJETO.md`
- `relatorios-incrementacao/melhoria-13-notificacoes-persistentes.md`
- este manifesto

## Banco

- Schema anterior: v6.
- Schema atual: v7.
- Tabela criada: `notificacoes`.
- Índices criados: `indice_notificacoes_usuario_data` e `indice_notificacoes_usuario_lida`.
- Backfill: não realizado.
- Cascata: notificações são removidas com a conta destinatária via `ON DELETE CASCADE`.

## Rotas

- `GET /notificacoes`
- `POST /notificacoes/:id/lida`
- `POST /notificacoes/marcar-todas-lidas`

## Verificações

- TypeScript/check: aprovado.
- Build: aprovado.
- Sintaxe JavaScript: aprovada.
- Migração em banco temporário: aprovada.
- Sessão e redirecionamento sem autenticação: aprovados.
- Renderização do sino e histórico: aprovada.
- Leitura individual e em massa: aprovadas.
- Isolamento entre usuários: aprovado.

O relatório detalhado está em `relatorios-incrementacao/melhoria-13-notificacoes-persistentes.md`.

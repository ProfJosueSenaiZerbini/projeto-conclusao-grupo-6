# Melhoria 19 — Interesses e participações em eventos

## Objetivo

Transformar o botão demonstrativo `Demonstrar interesse` em um fluxo persistente no SQLite, sem alterar a organização MVC do Cypher.

## Implementado

- Nova tabela `interesses_eventos`, com relação única entre evento e usuário.
- Estados persistidos: `interessado`, `inscrito`, `confirmado`, `rejeitado` e `cancelado`.
- Índices para consultas por evento e por usuário.
- Migração automática do schema SQLite 6 para 7.
- Endpoint `POST /events/:id/interest` para demonstrar interesse.
- Endpoint `POST /events/:id/interest/cancel` para cancelar interesse.
- Endpoint `POST /events/:id/interests/:usuarioId/status` para organizadores atualizarem o status.
- Contagem de interessados na listagem e no detalhe do evento.
- Lista de interessados nos eventos próprios do organizador.
- Controle de status por usuário no painel do organizador.
- Reativação de um interesse cancelado sem criar duplicidade.
- Proteção das novas rotas pelo middleware de sessão existente.
- Contas demonstrativas não podem gravar interesse.

## Arquivos alterados

- `src/app/models/bancoDados.ts`
- `src/app/models/modeloCypher.ts`
- `src/app/controllers/controladorEventos.ts`
- `src/app/controllers/controladorCompatibilidade.ts`
- `src/app/routes/rotasCypher.ts`
- `views/pages/oportunidades.ejs`
- `public/js/interacoes.js`
- `public/css/oportunidades.css`
- `README.md`
- `ANALISE-PROJETO.md`

## Compatibilidade

A aplicação continua usando SQLite via `better-sqlite3`. Bancos existentes no schema 6 recebem a tabela nova quando a aplicação é inicializada e passam para o schema 7. Nenhum registro anterior de usuário, obra, beat ou evento é removido.

Antes de executar no Windows, recomenda-se manter uma cópia do banco:

```powershell
Copy-Item .\data\cypher.sqlite .\data\cypher.sqlite.backup -Force
```

## Validações

- `npm run check`: aprovado.
- `npm run build`: aprovado.
- `node --check public/js/interacoes.js`: aprovado.
- Formatador EJS executado.
- Smoke test HTTP autenticado executado com banco temporário.
- Demonstrar interesse retornou redirect e apareceu como `interessado` na página seguinte.
- Cancelamento retornou redirect e deixou o registro com status `cancelado`.
- Schema verificado no banco temporário: `7`.

## Limites mantidos

O histórico visual de participações confirmadas ainda não calcula métricas detalhadas por categoria e período. Notificações, confirmação externa de presença e reputação baseada em participação ficam para etapas posteriores.

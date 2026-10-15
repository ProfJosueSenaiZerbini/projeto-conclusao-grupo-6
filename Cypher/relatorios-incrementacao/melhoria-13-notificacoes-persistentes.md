# Melhoria 13 — Núcleo persistente de notificações

**Data:** 15 de outubro de 2026  
**Escopo:** Etapas 1 e 2 do prompt mestre de evolução: persistência, autorização, sino, popover e histórico de notificações.  
**Estado:** concluído para a primeira entrega funcional; geração automática a partir dos domínios existentes permanece na Etapa 3.

## Resultado

O Cypher agora possui um núcleo real para armazenar e consultar notificações por usuário. O shell autenticado exibe um botão de sino reutilizável, com contador real de não lidas e popover sem navegação. Também foi criada a página `/notificacoes` para o histórico completo.

O usuário pode:

- abrir e fechar o popover do sino;
- visualizar notificações recentes;
- distinguir itens não lidos;
- marcar uma notificação como lida;
- marcar todas como lidas;
- acessar o histórico completo;
- ver um estado vazio real quando não existem registros.

O popover fecha por clique fora e pela tecla `Escape`. O botão usa `aria-label`, `aria-expanded` e `aria-controls`, e o painel utiliza elementos nativos de botão, link e formulário.

## Alterações estruturais no banco

1. **Tabela criada:** `notificacoes`.
2. **Tabelas removidas:** nenhuma.
3. **Colunas adicionadas em tabelas existentes:** nenhuma.
4. **Colunas removidas:** nenhuma.
5. **Tipos ou restrições alterados:** nenhum.
6. **Índices criados:**
   - `indice_notificacoes_usuario_data` em `(usuario_destino_id, criada_em)`;
   - `indice_notificacoes_usuario_lida` em `(usuario_destino_id, lida, criada_em)`.
7. **Nova versão do schema:** v7, anteriormente v6.
8. **Migração de bancos existentes:** a inicialização cria a tabela e os índices com `CREATE TABLE IF NOT EXISTS` e `CREATE INDEX IF NOT EXISTS`, depois atualiza `PRAGMA user_version` para 7.
9. **Backfill/conversão:** nenhum. Bancos existentes começam sem notificações; não foram criados registros artificiais.
10. **Exclusão, cascata e integridade:** `usuario_destino_id` referencia `usuarios(id) ON DELETE CASCADE`. Ao excluir uma conta, as notificações destinadas a ela são removidas pelo SQLite. O servidor filtra todas as consultas pelo usuário autenticado.

Estrutura da tabela:

```sql
id TEXT PRIMARY KEY
usuario_destino_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
tipo TEXT NOT NULL
titulo TEXT NOT NULL
mensagem TEXT NOT NULL DEFAULT ''
url TEXT NOT NULL DEFAULT ''
entidade_tipo TEXT NOT NULL DEFAULT ''
entidade_id TEXT NOT NULL DEFAULT ''
lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1))
criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
lida_em TEXT
```

## Backend

A fachada `CypherModel` passou a expor operações para:

- criar uma notificação;
- listar notificações com limite seguro;
- contar não lidas;
- marcar uma notificação própria como lida;
- marcar todas as notificações próprias como lidas.

Foram adicionadas as rotas protegidas:

```text
GET  /notificacoes
POST /notificacoes/:id/lida
POST /notificacoes/marcar-todas-lidas
```

A tentativa de marcar uma notificação pertencente a outro usuário retorna sucesso falso e não altera o registro. A URL de cada item vem do servidor; o navegador não pode trocar o destinatário nem a referência persistida.

## Frontend

Arquivos principais:

- `views/partials/barra-superior.ejs`: partial reutilizável do sino e popover;
- `views/pages/notificacoes.ejs`: histórico completo;
- `public/js/notificacoes.js`: comportamento ES modular;
- `public/css/notificacoes.css`: estilos da página;
- `public/css/tema.css`: estilos globais do popover nos temas claro e escuro;
- `public/js/app.js`: registro do módulo no entry point existente.

A interface não apresenta mensagens fictícias e não cria qualquer tabela ou fluxo de mensagens. Mensagens continuam em stand-by.

## Testes realizados

- `npm run check` — passou;
- `npm run build` — passou;
- `node --check public/js/notificacoes.js` — passou;
- formatação oficial de TypeScript, JavaScript, CSS e EJS — passou;
- migração em banco temporário novo — passou;
- confirmação de `user_version = 7` e dos dois índices — passou;
- acesso sem sessão a `/notificacoes` — redireciona para `/login`;
- cadastro e login de dois usuários — passou;
- renderização do sino no dashboard — passou;
- renderização do histórico — passou;
- marcação individual — passou;
- marcação de todas — passou;
- autorização entre usuários — passou;
- persistência verificada diretamente no SQLite — passou.

## Limites desta etapa

Ainda não existem geradores automáticos ligados à criação/edição de Beats, obras, eventos ou perfis. Isso pertence à Etapa 3 e deverá ser implementado separadamente, escolhendo apenas eventos com destinatário real. Não foram criadas notificações artificiais para preencher o painel.

Também não foram implementados:

- mensagens ou conversas;
- compra ou checkout;
- API desnecessária para o popover;
- paginação complexa;
- notificações de domínio sem destinatário real.

## Próxima etapa recomendada

A próxima alteração relevante deverá ser a **Etapa 3 — geradores de notificações nos domínios existentes**, mediante nova autorização. Ela deve conectar somente ações reais e evitar duplicações.

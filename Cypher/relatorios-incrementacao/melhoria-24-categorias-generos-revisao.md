# Melhoria 24 — prazo de categorias, gêneros moderados e área da equipe

## Objetivo

Implementar as regras solicitadas no perfil: permitir a troca de categorias profissionais em ciclos de 60 dias; possibilitar autorização excepcional por uma pessoa da equipe com motivo registrado; trocar a lista de gêneros livre por escolhas canônicas e uma opção “Outro” submetida a análise; e deixar Configurações imediatamente após Meu perfil, com as demais telas depois.

## Decisões aplicadas

- A fonte de verdade do prazo é `perfis.ultima_alteracao_categorias_em`, persistida em UTC e verificada no backend dentro da mesma transação que grava o perfil. A seleção inicial feita no cadastro inicia o prazo; salvar outros campos sem mudar categorias não o reinicia. Uma tentativa bloqueada reverte toda a operação, em vez de salvar parcialmente o restante do perfil.
- Depois de 60 dias, uma alteração volta a ser permitida. Antes disso, o servidor exige uma exceção não utilizada. A exceção é de uso único, precisa de uma justificativa e é consumida somente quando a mudança de categoria efetivamente grava. A nova mudança inicia um novo prazo.
- `auditoria_categorias` registra categorias anteriores e novas, data, motivo e vínculos à conta de equipe/exceção. `excecoes_categorias` conserva e-mail, responsável e justificativa, mesmo se a conta administrativa for removida posteriormente.
- Gêneros canônicos ficam disponíveis por seleção. O texto enviado por “Outro” é armazenado em `propostas_generos` com estado pendente e não é publicado no perfil. A equipe aprova ou rejeita com justificativa; a aprovação acrescenta o valor aprovado à lista de gêneros do perfil.
- `/admin/revisao` e seus POSTs exigem sessão autenticada e e-mail presente em `CYPHER_ADMIN_EMAILS`, variável de ambiente separada por vírgulas. A atribuição não usa categorias, cargo ou campos enviados pelo navegador. Sem a configuração, o usuário não tem acesso ao painel.
- A equipe pode avaliar uma conta quando houver razões concretas; inatividade, sozinha, não é tratada como prova de fraude nem causa bloqueio, suspensão ou punição automática.
- A navegação Recursos agora mostra Meu perfil, Configurações, Cypher Central e Notificações nessa ordem; a tela de Análises aparece depois delas somente para a allowlist da equipe.

## Banco e migração

O schema passou de v11 para v12. A inicialização garante a nova coluna e cria três tabelas e seus índices:

- `propostas_generos`, com fila de moderação, revisão e referência opcional ao revisor;
- `excecoes_categorias`, com no máximo uma exceção não consumida por conta;
- `auditoria_categorias`, com histórico de mudanças antes/depois.

Os índices parciais evitam propostas duplicadas pendentes da mesma pessoa e múltiplas exceções pendentes. As migrações continuam transacionais; não há normalização destrutiva de dados existentes nem `REPLACE` SQL.

## Arquivos principais

- `src/app/models/bancoDados.ts`: schema, transação de perfil, bloqueio, exceções, auditoria e revisão de gêneros;
- `src/app/controllers/controladorCompatibilidade.ts`: allowlist, validação, feedback da tela e ações administrativas;
- `src/app/routes/rotasCypher.ts` e fachadas dos controllers: endpoints protegidos;
- `views/pages/perfil.ejs`: opções de gêneros, prazo e estados acessíveis;
- `views/pages/admin-revisao.ejs`: interface privada da equipe;
- `views/partials/barra-lateral.ejs`: ordem de navegação e link condicional;
- `public/js/interacoes.js`, `public/css/perfil.css` e `public/css/configuracoes.css`: interação e apresentação;
- `scripts/testar-banco.mjs` e `scripts/testar-politicas-perfil.mjs`: regressão do schema e das regras.

## Verificações executadas

`npm run test:db` cobre banco novo, migração v5→v12, migração v7→v12 e migração v11→v12, reinicialização idempotente, proteção contra schema futuro, tabelas/colunas, integridade referencial, cooldown, tentativa antecipada, exceção única consumida e auditada, revisão de gênero e liberação depois de 60 dias. `npm run check` valida TypeScript. As views EJS de perfil, equipe e navegação lateral foram compiladas com o parser EJS. Uma prova HTTP em banco temporário também cobriu o prazo inicial, 403 para não-admin, concessão de exceção, novo cooldown e aprovação de gênero pelo painel.

## Configuração da equipe

Configure a variável no ambiente onde a aplicação inicia; por exemplo:

```bash
CYPHER_ADMIN_EMAILS="equipe@example.com,outro-admin@example.com"
```

As contas correspondentes precisam estar cadastradas e usar seus próprios logins. Não se deve colocar essa configuração em arquivo público ou em variável exposta ao navegador.

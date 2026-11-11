# Melhoria 44 — Base factual sem dados demonstrativos

## Decisão

O Cypher passa a iniciar sem qualquer dado demonstrativo. Não existe mais conta convidada, conta técnica, acesso fantasma, botão de acesso especial ou carregador de fixtures. O preenchimento inicial será feito somente pelas funcionalidades reais de cadastro e operação, conforme as próximas decisões de produto.

## Limpeza executada

Foram removidos do fluxo de inicialização: perfis e usuários demonstrativos; obras, créditos, eventos, interesses, Beats e ofertas demonstrativos; sessões e notificações vinculadas; relações profissionais, vertentes, propostas, exceções e auditorias vinculadas a usuários demonstrativos; o usuário OG Emicê e o código `CYP-FANTASMA`; a geração de códigos `CYP-DEMO####`; a variável `CYPHER_ALLOW_OG_ACCESS`; o formulário `guest` da tela de login; e as funções de carga e consulta exclusiva de fixtures.

O bootstrap do banco executa uma limpeza idempotente de resíduos antigos marcados com `demonstracao = 1` antes de aceitar requisições. A versão do schema foi elevada para 19. Nenhuma linha nova marcada como demonstração é criada.

## Estado inicial esperado

Em um banco novo, as tabelas de usuários, perfis, obras, créditos, eventos, interesses, Beats, ofertas, notificações, profissões e vertentes começam com zero registros. A visão geral não apresenta hit, data, conexão, obra, evento ou pessoa fictícios; mostra apenas estado vazio e contagens reais.

## Inventário para as próximas etapas

A base está deliberadamente vazia. Devem ser definidos futuramente, por funcionalidade factual:

1. fluxo de cadastro e primeiro perfil real;
2. regras e telas para criação de obras e créditos reais;
3. regras e telas para eventos e interesses reais;
4. regras e telas para Beats, ofertas e estados comerciais reais;
5. indicadores do dashboard calculados exclusivamente a partir dessas entidades;
6. conteúdo institucional e FAQ, separado de qualquer dado de usuário.

## Validação

- `npm run check`
- `npm run build`
- `npm run test:db`
- `npm run test:catalog`
- `npm run test:profile-relations`
- `npm run test:relations`
- `npm run test:admin-ui`
- verificação direta do SQLite: schema v19 e zero registros nas tabelas factuais principais.

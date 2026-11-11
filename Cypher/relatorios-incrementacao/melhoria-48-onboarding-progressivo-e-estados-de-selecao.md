# Melhoria 48 — Onboarding progressivo e estados de seleção

## Escopo executado

A etapa 9 refinou o comportamento do cadastro progressivo e da edição profissional depois da integração do catálogo completo. O objetivo foi tornar a seleção das profissões compreensível antes do início dos questionários e evitar estados enganosos quando nenhuma profissão está selecionada.

## Seleção por grupo

Cada grupo do catálogo agora exibe um contador visual de profissões selecionadas. O formulário também informa o total geral, com mensagens distintas para zero, uma ou várias profissões selecionadas. A contagem é atualizada tanto no cadastro quanto na edição e acompanha alterações feitas pelo teclado ou pelo mouse.

## Progressão do cadastro

Quando não há profissão selecionada, a área de questionários passa a mostrar “Nenhuma pergunta disponível” e orienta a pessoa a voltar para a etapa de seleção. O progresso não apresenta mais o estado incorreto “Pergunta 1 de 1” nesse cenário, e os botões de avanço e finalização permanecem ocultos até existir uma seleção válida.

Quando há seleção, a navegação continua mostrando apenas as perguntas das profissões escolhidas, mantendo a ordem por profissão e o progresso total de respostas. A serialização continua separando respostas e visibilidades por rótulo canônico, que é resolvido no servidor pelos IDs estáveis.

## Edição de perfil

A edição profissional reutiliza os mesmos contadores, estados vazios e atualização de cartões. Os questionários de profissões não selecionadas continuam ocultos, enquanto respostas já existentes são restauradas individualmente por profissão. Alterações em informações pessoais não interferem no estado das respostas profissionais.

## Testes

- `npm run check` — passou.
- `npm run build` — passou.
- `npm run test:admin-ui` — passou.
- `npm run test:questionnaires` — passou.
- `npm run test:profile-relations` — passou.
- `npm run test:relations` — passou.
- `npm run test:db` — passou.

## Próxima etapa

O catálogo, o contrato de questionários, a validação server-side, a seleção agrupada e o onboarding progressivo estão implementados. A próxima etapa pode avançar para a consolidação visual final, cobertura de testes de interação no navegador e revisão geral dos textos e estados de acessibilidade.

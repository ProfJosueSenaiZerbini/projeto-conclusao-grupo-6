# Melhoria 28 — Cadastro progressivo em três etapas

## Objetivo

Reorganizar o cadastro para reduzir a quantidade de informações mostradas de uma só vez, sem remover validações, alterar o banco ou separar as respostas de atuação de suas categorias profissionais.

## Fluxo implementado

O cadastro está dividido em três etapas: **Conta**, **Categorias** e **Questionários**. A pessoa informa os dados essenciais da conta, seleciona suas categorias profissionais e, na última etapa, percorre as perguntas progressivamente, uma por vez. O fluxo mostra a categoria e a pergunta atual, permite navegar entre perguntas e mantém um indicador de progresso.

As respostas continuam no formato associado a cada categoria e passam pelas validações de cadastro já existentes. O componente de questionário compartilhado funciona tanto no cadastro progressivo quanto no formulário de edição de atuação profissional.

## Correção de renderização

O template de cadastro dependia de `questionariosAtuacao`. A preparação dos dados da rota/controlador foi alinhada ao template para que o GET do cadastro renderize as perguntas sem o `ReferenceError: questionariosAtuacao is not defined` relatado anteriormente.

## Arquivos centrais

- `src/app/controllers/controladorAutenticacao.ts`
- `src/app/controllers/controladorCompatibilidade.ts`
- `views/pages/cadastro.ejs`
- `views/partials/componentes/questionario-atuacao.ejs`
- `public/js/questionario-atuacoes.js`
- `public/css/autenticacao.css`
- `scripts/testar-admin-ui.mjs`

## Compatibilidade e limites

A implementação usa Node.js, TypeScript, Express, EJS e JavaScript nativo existentes. Não adiciona dependências nem migração de banco. Os cargos e permissões não são concedidos pela interface de cadastro; as categorias e as respostas permanecem submetidas às validações do servidor.

## Validação executada

- `GET /register` é exercitado no teste de integração, que verifica resposta HTTP 200, as três etapas e a renderização dos questionários.
- `POST /register/validate` continua testado para dados válidos, inválidos e duplicados, incluindo a garantia de que a pré-validação não cria conta.
- `npm run check` e `npm run build` — TypeScript e build aprovados.
- `npm run test:db` e `npm run test:admin-ui` — persistência e integração HTTP aprovadas.

# Melhoria 46 — Validação server-side no cadastro e edição profissional

## Escopo executado

A etapa 7 reforçou o fluxo existente de cadastro progressivo e edição de perfil no servidor, sem confiar nos campos ocultos, na navegação JavaScript ou na seleção apresentada pelo navegador.

## Alterações

### Payload de questionários

O parser `atuacoesRecebidas` agora rejeita, de forma atômica:

- categoria de resposta que não foi enviada como seleção atual;
- categoria de visibilidade que não foi selecionada;
- campos desconhecidos dentro da resposta;
- campos pertencentes a outra profissão;
- valores fora das opções do catálogo;
- visibilidades fora de `publico`, `colaboradores` e `privado`.

Isso impede que uma requisição manual salve respostas para profissões não selecionadas ou carregue dados de outra etapa do cadastro.

### Ownership

As operações de persistência profissional agora confirmam no próprio model que o `usuarioId` pertence a uma conta real e não demonstrativa antes de gravar ou ler:

- `salvarProfissoesUsuarioCypher`;
- `salvarVertentesProfissionaisUsuarioCypher`;
- `salvarRespostasAtuacaoProfissaoCypher`;
- `listarRespostasAtuacaoProfissaoCypher`.

Quando o titular não existe ou não é uma conta real, o model retorna `USUARIO_NAO_ENCONTRADO` por erro controlado. As rotas continuam fornecendo o ID a partir da sessão autenticada, nunca de um campo editável do formulário.

### Seções independentes

O salvamento de dados pessoais continua separado do salvamento profissional. A etapa profissional mantém as respostas atuais quando categorias e informações pessoais são alteradas, e o caso de payload inválido não modifica o perfil.

As permissões de criação de obras, Beats e eventos continuam calculadas no servidor a partir das categorias persistidas; a interface não concede capacidade por si só.

## Testes

- `npm run check` — passou.
- `npm run build` — passou.
- `npm run test:questionnaires` — passou com rejeição de campo estranho e titular inexistente.
- `npm run test:profile-relations` — passou.
- `npm run test:relations` — passou.
- `npm run test:db` — passou.
- `npm run test:admin-ui` — passou, incluindo cadastro, edição pessoal independente, edição profissional, payload inválido e permissões.

## Próximo passo

A próxima etapa deve levar o catálogo canônico completo para a seleção visual do cadastro e da edição, organizando as 36 profissões nos sete grupos e mantendo o questionário progressivo vinculado somente às profissões selecionadas.

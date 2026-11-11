# Melhoria 49 — Perfis, privacidade e portfólio profissional

## Escopo executado

A etapa 10 atualizou a apresentação das profissões nos perfis próprio e público, mantendo as respostas profissionais contextualizadas por profissão e sem criar um bloco isolado de “Questionário”.

## Perfil próprio

A seção de atuação profissional do perfil próprio agora organiza as profissões pelos sete grupos canônicos do catálogo. Cada cartão continua apontando para a trajetória da profissão individual, preservando a seleção por query string e a leitura das respostas correspondentes.

Profissões personalizadas ou valores legados que não tenham correspondência no catálogo não desaparecem: são apresentados em um grupo separado de “Outras atuações”. Isso mantém a acessibilidade do dado sem fingir que ele pertence a um grupo canônico.

## Perfil público

O perfil público recebeu a mesma organização por grupos, mas com rótulos que deixam explícito que a profissão foi compartilhada publicamente. Valores fora do catálogo continuam separados em “Outras atuações compartilhadas”.

A view pública recebe a lista dos grupos a partir da mesma fonte central usada no cadastro e na edição. Não existe cópia paralela dos 36 rótulos no template.

## Respostas e privacidade

As respostas continuam sendo obtidas pelo servidor através de `obterPerfilPublicoCypher`, que aplica a filtragem de visibilidade antes da renderização. A view só percorre a atuação já filtrada e exibe respostas no contexto da profissão selecionada. O detalhe não é transformado em uma seção pública genérica de questionário.

As políticas de titular, colaborador creditado em obra publicada e visitante externo permanecem cobertas pela suíte de políticas existente; nenhum valor privado foi tornado público por esta etapa.

## Portfólio

A reorganização não alterou as regras do catálogo de obras. O perfil próprio continua exibindo obras do titular, enquanto o perfil público continua exibindo somente obras públicas/lancadas fornecidas pela consulta específica do perfil.

## Arquivos envolvidos

- `src/app/controllers/controladorCompatibilidade.ts`
- `views/pages/perfil.ejs`
- `views/pages/perfil-publico.ejs`
- `public/css/perfil.css`
- `scripts/testar-admin-ui.mjs`

## Testes executados

Todos passaram:

- `npm run check`
- `npm run build`
- `npm run test:admin-ui`
- `npm run test:catalog`
- `npm run test:questionnaires`
- `npm run test:persistence`
- `npm run test:profile-relations`
- `npm run test:relations`
- `npm run test:db`

O teste HTTP validou o perfil próprio, o perfil público, a presença dos grupos canônicos, os cartões profissionais e a ausência de um título público isolado chamado “Questionário”.

## Limitações registradas

Não foi executado teste visual automatizado em múltiplos viewports nem auditoria com leitor de tela nesta etapa. A cobertura realizada é HTTP/HTML, persistência e política server-side. Esses testes devem permanecer como parte da etapa transversal de interface, acessibilidade e responsividade.

## Próxima etapa

Avançar para a fase transversal de interface, acessibilidade e responsividade, cobrindo teclado, foco, temas claro/escuro, larguras estreitas, estados sem dados, mensagens de erro e fallback sem JavaScript.

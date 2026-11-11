# Melhoria 42 — Integração com cadastro e edição de perfil

## Objetivo

Conectar as operações da etapa 4 ao cadastro de novas contas e à edição de perfil, preservando o fluxo legado de categorias e respostas, a compatibilidade de valores atuais e as políticas existentes de alteração de categorias.

## Cadastro de conta

O fluxo `POST /register` continua validando as categorias e as respostas atuais antes de criar a conta. Depois da criação, `criarContaCypher` materializa as categorias selecionadas na tabela `profissoes_usuario`.

O mapeamento é não destrutivo:

- profissões reconhecidas no catálogo recebem seu ID estável e origem `catalogo`;
- `Outros` é persistido como valor personalizado;
- valores antigos, ambíguos ou não mapeados recebem `profissaoId = NULL` e origem `legado`;
- nenhuma categoria antiga é convertida automaticamente em outra profissão;
- `categorias_json` e `respostas_atuacao_categoria` continuam sendo gravados pelo fluxo já existente.

Assim, o cadastro passa a alimentar a nova persistência sem quebrar a leitura do perfil atual.

## Edição de perfil

O fluxo `POST /profile` e suas variantes por seção continuam passando por `atualizarPerfilCypher`, incluindo as validações de:

- proprietário da conta;
- conta demonstrativa;
- categorias permitidas;
- cooldown de 60 dias;
- exceções autorizadas;
- respostas obrigatórias para novas categorias;
- gêneros, equipamentos, disponibilidade e dados pessoais.

Depois de uma atualização válida, o modelo sincroniza as categorias atuais em `profissoes_usuario`:

- profissões presentes são criadas ou reativadas;
- profissões removidas são marcadas como inativas;
- registros históricos não são apagados;
- IDs catalogados permanecem estáveis;
- valores ambíguos continuam sem conversão;
- a elegibilidade das vertentes é sincronizada pelo servidor.

A sincronização ocorre somente quando a atualização principal do perfil foi concluída com sucesso.

## Leitura no carregamento do perfil

`renderizarPerfil` agora consulta:

```ts
listarProfissoesUsuarioCypher(usuario.id, { incluirInativas: true })
listarVertentesProfissionaisUsuarioCypher(usuario.id, { incluirInativas: true })
```

Os dados são disponibilizados ao renderizador como `profissoesPersistidas` e `vertentesProfissionaisPersistidas`, preservando a interface legada atual e preparando a próxima etapa para exibição e edição específicas por profissão/vertente.

O perfil ainda utiliza `usuario.categories` para os campos compatíveis, evitando que contas antigas sem materialização prévia desapareçam da interface.

## Compatibilidade mantida

Não foram alterados:

- o formato atual de `categorias_json`;
- o formato das respostas em `respostas_atuacao_categoria`;
- a lógica de questionários legados;
- o cooldown de alteração de categorias;
- solicitações e exceções administrativas;
- propostas de novas categorias;
- permissões derivadas de categorias;
- obras, eventos, Beats, privacidade ou autenticação.

## Teste específico

Foi criado `scripts/testar-integracao-cadastro-profissional.mjs`, que valida:

1. criação de conta com profissão catalogada, valor ambíguo e `Outros`;
2. atribuição correta de ID estável, `NULL` para valor ambíguo e origem personalizada;
3. edição do perfil com substituição de categorias;
4. reativação das novas profissões;
5. inativação histórica das profissões removidas;
6. ausência de conversão automática do valor legado.

## Validação executada

```text
npm run check
  passou

npm run build
  passou

npm run test:profile-relations
  passou — cadastro e edição integrados

npm run test:relations
  passou — leitura/escrita, inativação e reativação

npm run test:persistence
  passou — 16 vertentes e elegibilidade

npm run test:catalog
  passou — 7 grupos, 36 profissões e IDs estáveis

npm run test:compatibility
  passou — valores seguros, ambíguos e personalizados

npm run test:db
  passou — migrações, schema v17, integridade, idempotência e políticas

npm run test:admin-ui
  passou — regressão administrativa, cadastro/profissional, obras, eventos e permissões
```

## Próxima etapa

A próxima etapa pode substituir gradualmente os questionários genéricos por questionários vinculados a `usuario_id + profissao_id`, mantendo a leitura de respostas antigas por categoria como fallback. Também poderá usar os dados já expostos no carregamento do perfil para apresentar vertentes profissionais na interface.

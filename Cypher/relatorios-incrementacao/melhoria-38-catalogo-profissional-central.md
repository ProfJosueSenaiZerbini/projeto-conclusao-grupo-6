# Melhoria 38 — Catálogo profissional central

## Objetivo

Executar a primeira unidade de desenvolvimento da reestruturação profissional: criar uma fonte centralizada com os sete grupos e as 36 profissões exigidos, usando identificadores estáveis e sem migrar ou renomear dados existentes.

## Alterações realizadas

### Catálogo central — `src/app/models/modeloPerfil.ts`

Foi adicionada a estrutura `catalogoProfissional`, com:

- 7 grupos: Música; Dança; Artes visuais; Audiovisual; Produção técnica; Gestão e produção; Comunicação e cultura.
- 36 profissões exatamente conforme o prompt de implementação.
- IDs estáveis independentes dos rótulos exibidos.
- `GrupoProfissional` e `ProfissaoCatalogo` como tipos compartilhados.
- `listarGruposProfissionais()` para consulta dos grupos.
- `listarProfissoesCatalogo()` para consulta linear das profissões.
- `obterProfissaoCatalogo(id)` para recuperação por identificador.

A estrutura nova foi mantida separada de `categoriasGerais`, `categoriaLegadaRapperMC` e das regras atuais de autorização. Isso foi intencional: esta etapa não deve alterar categorias persistidas, permissões de Beatmaker/Organizador de eventos, questionários atuais, vertentes, migrações ou dados legados.

### Teste de contrato — `scripts/testar-catalogo-profissional.mjs`

Foi criado um teste que confirma:

- exatamente 7 grupos;
- exatamente 36 profissões;
- IDs de grupos únicos;
- IDs de profissões únicos;
- toda profissão vinculada a um grupo existente;
- recuperação de profissões conhecidas por ID;
- ausência de conversão implícita do legado `Produtor musical` para a nova profissão `Produtor(a)`.

### Script npm — `package.json`

Foi adicionado:

```bash
npm run test:catalog
```

O comando recompila o TypeScript e executa o teste de contrato do catálogo.

## Compatibilidade preservada

Não foram alterados nesta etapa:

- `categoriasGerais` utilizado pelo cadastro e perfil atuais;
- valores legados, incluindo `Rapper / MC`;
- permissões funcionais de Beats, obras e eventos;
- schema ou versão do SQLite;
- migrações e dados existentes;
- questionários e respostas atuais;
- vertentes musicais;
- rotas, views e comportamento visual.

Não foi feito mapeamento automático entre rótulos antigos e profissões novas porque existem ambiguidades semânticas e riscos de alteração de permissões.

## Validação executada

```text
npm run check
  passou

npm run test:catalog
  passou — catálogo profissional com 7 grupos, 36 profissões e IDs estáveis

npm run test:db
  passou — banco, migrações até v16, integridade, idempotência, cooldown, governança e privacidade

npm run test:admin-ui
  passou — administração, busca, cadastro, propostas, obras, eventos, exceções e permissões
```

O `npm run test:catalog` também executou `npm run build` internamente, que passou.

## Pendências para a próxima etapa

A fonte central ainda não foi conectada às telas nem à persistência. Permanecem para as próximas unidades:

1. definir a compatibilidade entre profissões novas, valores atuais, categorias personalizadas, propostas aprovadas e valores ambíguos;
2. decidir a estrutura persistente por profissão e os identificadores usados no banco;
3. separar as novas vertentes profissionais dos gêneros de obras;
4. adaptar os questionários para quatro eixos por profissão;
5. reorganizar o cadastro e a edição de perfil.

A etapa 1 foi concluída sem alterar o schema e sem modificar registros existentes.

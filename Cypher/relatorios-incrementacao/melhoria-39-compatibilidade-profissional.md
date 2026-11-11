# Melhoria 39 — Compatibilidade dos valores profissionais atuais

## Objetivo

Executar a Etapa 2 do plano de ação: definir um contrato explícito entre os valores profissionais atualmente usados pelo Cypher e o catálogo novo da reestruturação, sem alterar registros, migrar dados ou conceder permissões por associação de rótulos.

## Alterações realizadas

### Camada de compatibilidade

Foi criado `src/app/models/compatibilidadeProfissional.ts`, que documenta a classificação de cada valor atual:

- `mapeamento-seguro`: há correspondência única com uma profissão do catálogo e o ID novo pode ser consultado com segurança;
- `ambiguo`: há uma hipótese de correspondência, mas a conversão não pode ocorrer sem decisão de domínio;
- `legado-ou-personalizado`: valor personalizado, marcador genérico ou valor não catalogado.

A camada oferece:

- `compatibilidadeProfissional`: matriz explícita de valores e motivos;
- `classificarValorProfissional(valorAtual)`: classifica o valor sem alterá-lo;
- `mapearValorAtualParaProfissao(valorAtual)`: retorna profissão somente para mapeamentos seguros;
- `listarValoresAtuaisConhecidos()`: lista os valores cobertos pela matriz.

A consulta é exata e não normaliza, rebatiza ou substitui o valor persistido.

## Matriz atual

| Valor persistido atual | Classificação | ID novo | Decisão nesta etapa |
|---|---|---|---|
| `Rapper` | Seguro | `rapper` | Pode ser relacionado sem alterar o valor atual |
| `MC` | Seguro | `mc` | Pode ser relacionado sem alterar o valor atual |
| `Compositor` | Seguro | `compositor` | Diferença apenas de apresentação |
| `Letrista` | Seguro | `letrista` | Pode ser relacionado sem alterar o valor atual |
| `Beatmaker` | Seguro | `beatmaker` | Pode ser relacionado; permissão continua independente |
| `DJ` | Seguro | `dj` | Pode ser relacionado sem alterar o valor atual |
| `Empresário` | Seguro | `empresario` | Diferença apenas de apresentação |
| `Organizador de eventos` | Seguro | `organizador-eventos` | Relação de rótulo; permissão continua baseada na regra atual |
| `Produtor musical` | Ambíguo | `produtor` como hipótese | Não converter automaticamente |
| `Rapper / MC` | Ambíguo | nenhum | Não é possível saber se representa Rapper, MC ou ambos |
| `Outros` | Legado/personalizado | nenhum | Não é profissão identificável do novo catálogo |
| Valor não catalogado | Legado/personalizado | nenhum | Permanece consultável e sem conversão |

## Decisões de preservação

Nenhuma tabela, coluna, versão de schema ou registro foi alterado. Não foi criada migração porque esta etapa apenas define o contrato de leitura e compatibilidade.

O valor `Produtor musical` não foi convertido em `Produtor(a)` porque os nomes podem representar escopos diferentes. `Rapper / MC` não foi dividido porque a divisão poderia inventar uma declaração profissional que não existe no registro. `Outros` e valores customizados permanecem fora do catálogo novo até que a governança defina como tratá-los.

A camada de compatibilidade não é usada para conceder permissões. As capacidades de Beats, obras e eventos continuam dependendo das regras server-side existentes e dos valores atuais.

## Teste de contrato

Foi criado `scripts/testar-compatibilidade-profissional.mjs`. O teste confirma que:

- os oito valores seguros retornam os IDs esperados;
- `Produtor musical` e `Rapper / MC` são classificados como ambíguos e não são convertidos;
- `Outros` e valores não catalogados permanecem como legado/personalizado;
- valores desconhecidos não retornam profissão do catálogo;
- a matriz contém explicitamente o valor legado `Rapper / MC`.

Foi adicionado ao `package.json`:

```bash
npm run test:compatibility
```

## Validação executada

```text
npm run check
  passou

npm run test:catalog
  passou — catálogo com 7 grupos, 36 profissões e IDs únicos

npm run test:compatibility
  passou — classificação segura, ambígua e legado/personalizada

npm run test:db
  passou — migrações até v16, integridade, cooldown, governança e privacidade

npm run test:admin-ui
  passou — administração, busca, cadastro, propostas, obras, eventos, exceções e permissões
```

Os comandos de catálogo e compatibilidade também executaram `npm run build`, que passou.

## Pendências para decisão posterior

A matriz não decide ainda se `Produtor musical` deve se tornar `Produtor(a)`, se deve existir uma profissão equivalente distinta ou se o valor deve permanecer legado. Também não divide `Rapper / MC`.

Essas decisões só devem ser tomadas junto da definição da persistência por usuário–profissão e da estratégia de migração. Até lá, o comportamento seguro é manter os valores originais, permitir consulta e impedir conversões silenciosas.

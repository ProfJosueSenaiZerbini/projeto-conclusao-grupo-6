# Melhoria 43 — Normalização do catálogo profissional

## Decisão

A Cypher está em desenvolvimento e não possui usuários reais. O catálogo profissional passa a ser canônico agora, sem camada de compatibilidade ambígua, governança intermediária ou valores combinados mantidos por cautela histórica.

As regras adotadas são:

- `Produtor musical` foi substituído por `Produtor(a)` e recebe o ID `produtor`.
- `Rapper / MC` deixou de existir como categoria. `Rapper` e `MC` são profissões independentes.
- `Outros` continua sendo apenas uma entrada personalizada, sem ID de profissão até que o usuário escolha uma profissão concreta.
- Menções sem perfil em créditos de obras continuam existindo, pois representam outro domínio: uma pessoa citada sem conta Cypher vinculada.

## Implementação

- `modeloPerfil.ts` passou a expor apenas categorias canônicas.
- As regras de criação de obras, status profissionais, questionários e telas usam `Produtor(a)`, `Rapper` e `MC` diretamente.
- A camada `compatibilidadeProfissional.ts` e seu teste foram removidos.
- A migração de banco foi atualizada para o schema v18.
- A migração v18 normaliza perfis, respostas profissionais e relações persistidas antigas. Um registro `Rapper / MC` é dividido em relações `Rapper` e `MC`; `Produtor musical` vira `Produtor(a)` com `profissao_id = 'produtor'`.
- Os dados demonstrativos foram ajustados para representar múltiplas profissões como categorias separadas.
- Testes e documentação corrente foram atualizados para o catálogo único.

## Validação

Passaram:

- `npm run check`
- `npm run build`
- `npm run test:catalog`
- `npm run test:profile-relations`
- `npm run test:relations`
- `npm run test:db`
- `npm run test:admin-ui`

O teste de banco também cobre a migração de dados antigos para as categorias canônicas e confirma a integridade referencial após a normalização.

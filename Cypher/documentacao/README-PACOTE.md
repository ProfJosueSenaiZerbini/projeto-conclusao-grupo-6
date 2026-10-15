# Pacote atual do projeto Cypher

Este pacote contém o código-fonte atual do Cypher, incluindo `src/`, `views/`, `public/`, scripts, documentação técnica e relatórios incrementais.

## Conteúdo omitido intencionalmente

- `node_modules/`: dependências instaláveis com `npm ci`;
- `dist/`: artefatos recompiláveis com `npm run build`;
- `data/*.sqlite*`: banco local/runtime, para evitar distribuir dados da execução atual;
- arquivos temporários e caches.

## Como executar

```bash
npm ci
npm run check
npm run build
npm run dev
```

O prompt-mestre de evolução está em `documentacao/PROMPT-MESTRE-MELHORIAS-CYPHER.md`.

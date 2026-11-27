# Banco de dados da Cypher

O esquema físico e as migrações ficam em `Cypher/src/app/models/` (entrada: `bancoDados.ts`). A cópia local de execução não faz parte da entrega Git: ela pode conter sessões, credenciais derivadas, mensagens e uploads.

Para gerar um SQLite demonstrativo inspecionável, execute em `Cypher`:

```sh
npm ci
npm run demo:restaurar -- data/modelagem/cypher.sqlite
```

Abra o banco gerado somente para leitura. Use `PRAGMA user_version;`, `PRAGMA integrity_check;` e `PRAGMA foreign_key_check;` para conferir o esquema e os vínculos. Essa base é uma materialização das migrações e de `Cypher/seeds/catalogo-cypher.json`, não uma cópia de uma instalação pessoal.

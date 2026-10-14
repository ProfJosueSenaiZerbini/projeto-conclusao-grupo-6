# Cypher

Protótipo web para profissionais da cena musical underground. Reúne perfil, busca de profissionais, oportunidades, obras, banco de beats e conteúdo de apoio.

## Requisitos

- Node.js 20 ou superior
- npm (incluído na instalação do Node.js)

A aplicação usa TypeScript, Express, EJS, CSS, JavaScript no navegador e ícones Lucide locais. Não usa banco de dados: autenticação e dados são demonstrativos e não persistem.

## Executar

Na pasta raiz do projeto:

```bash
npm ci
npm run dev
```

Abra <http://localhost:3000/login>. O servidor de desenvolvimento reinicia quando os arquivos TypeScript são alterados.

Para compilar e iniciar a versão compilada:

```bash
npm run build
npm start
```

Para verificar o TypeScript:

```bash
npm run check
```

A porta padrão é `3000`. Para usar outra porta, defina a variável `PORT` antes de iniciar o comando.

## Funcionalidades do protótipo

- Login e cadastro demonstrativos, com perfil de exemplo OG Emicê.
- Visão geral, busca de profissionais e oportunidades com filtros e detalhes.
- Catálogo de obras, formulário de cadastro e créditos demonstrativos.
- Banco de beats, Cypher Central, perfil e configurações.
- Navegação responsiva, menus, painéis e alternância de tema.

As telas e interações demonstram os fluxos; usuários, obras, créditos, conexões e outras informações não são gravados.

## Estrutura

- `src/aplicacao.ts`: configuração e inicialização do Express.
- `src/app/routes/`: rotas HTTP.
- `src/app/controllers/`: fluxo das requisições e seleção das páginas.
- `src/app/models/`: dados demonstrativos.
- `views/pages/` e `views/partials/`: páginas EJS e componentes compartilhados.
- `public/css/` e `public/js/`: estilos e interações do navegador.
- `scripts/`: utilitários de formatação EJS e geração do agregador CSS.

## Formatação

```bash
npm run format
npm run format:views
```

# Cypher — Protótipo Frontend

Esta pasta contém uma cópia separada do ecossistema Cypher construída exclusivamente para demonstração frontend. Ela não utiliza Express, EJS, MySQL, API, banco de dados ou persistência de domínio. O projeto mantém uma organização MVC no frontend: `models` reúne dados estáticos, `views` renderiza as telas e `controllers` controla a navegação e os estados da interface.

## Pré-requisitos

É necessário ter Node.js 18 ou superior e npm instalados.

## Execução

Dentro desta pasta, execute:

```bash
npm install
npm run dev
```

Depois, acesse a URL mostrada pelo Vite, normalmente `http://localhost:5173`.

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Únicos comportamentos operantes

O login é validado localmente no navegador com os dados demonstrativos abaixo:

| Campo | Valor |
|---|---|
| Username ou e-mail | `lianoise` ou `cypher@demo.com` |
| Senha | `cypher123` |

O botão **Modo Fantasma** abre a área pública sem exigir login. O estado temporário da sessão é mantido somente no `sessionStorage` do navegador para permitir a navegação durante a demonstração.

## Ecossistema visual disponível

O protótipo inclui telas de login, cadastro visual, exploração, Dashboard, perfil, edição de perfil, portfólio, obras, banco de beats, publicação de beat, eventos, oportunidades, colaboração, conhecimento e reputação. A navegação ocorre por rotas hash, como `#/dashboard`, `#/beats` e `#/eventos`, sem requisições ao servidor de aplicação.

Cards, filtros, player demonstrativo, botões de publicação, inscrições, candidaturas, conexões, avaliações e formulários são intencionalmente não funcionais. Ao interagir com essas áreas, a interface informa que a ação pertence apenas à demonstração e que nenhum dado foi enviado ou salvo.

## Estrutura

```text
cypher-frontend-prototype/
├── controllers/              # Controller de navegação e estados frontend
├── models/                   # Dados estáticos do protótipo
├── views/                    # Renderização das telas e componentes
├── public/
│   ├── css/style.css         # Identidade visual e responsividade
│   └── js/main.js            # Inicialização do frontend
├── index.html
├── vite.config.js
└── package.json
```

A versão backend original permanece preservada em `cypher-app/`. Esta pasta é independente e foi criada especificamente como um **copo vazio do ecossistema**, pronto para apresentação visual e futura conexão com uma API quando essa etapa for desejada.

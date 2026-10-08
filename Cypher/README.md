# Cypher

O **Cypher** é um protótipo de plataforma profissional para a cena musical underground, reunindo profissionais, oportunidades, obras, beats, perfis e conteúdos de apoio.

## Tecnologias

- **Node.js**
- **TypeScript**
- **Express**
- **EJS**
- **HTML, CSS e JavaScript**
- **Lucide Static** para ícones locais

### Estrutura

```text
cypher/
├── public/
│   ├── css/
│   └── js/
├── src/
│   ├── aplicacao.ts
│   └── app/
│       ├── controllers/
│       │   └── controladorCypher.ts
│       ├── models/
│       │   └── modeloCypher.ts
│       └── routes/
│           └── rotasCypher.ts
├── views/
│   ├── pages/
│   └── partials/
├── package.json
├── tsconfig.json
└── README.md
```

### Responsabilidades

| Camada      | Responsabilidade                           |
|-------------|--------------------------------------------|
| Application | Configura o Express e inicia o servidor    |
| Routes      | Define as rotas                            |
| Controllers | Processa as requisições e controla o fluxo |
| Models      | Organiza dados e operações                 |
| Views       | Exibe as páginas em EJS                    |
| Partials    | Reutiliza trechos comuns das Views         |
| Public      | Armazena CSS e JavaScript do navegador     |

## Funcionalidades

- Login e cadastro demonstrativos
- Sessão por cookie
- Dashboard
- Busca de profissionais
- Oportunidades
- Catálogo de obras
- Cadastro demonstrativo de obras
- Banco de beats
- Cypher Central
- Perfil profissional
- Configurações
- Layout responsivo
- Logout e proteção das páginas autenticadas

## Requisitos

- **Node.js 20 ou superior**
- **npm**

## Como executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Verificar o projeto

```bash
npm run check
```

### 3. Executar em desenvolvimento

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

### 4. Gerar a versão compilada

```bash
npm run build
```

### 5. Executar a versão compilada

```bash
npm start
```

## Rotas principais
| Método | Rota         | Acesso      |
|--------|--------------|-------------|
| GET    | `/login`     | Público     |
| POST   | `/login`     | Público     |
| GET    | `/register`  | Público     |
| POST   | `/register`  | Público     |
| POST   | `/logout`    | Autenticado |
| GET    | `/dashboard` | Autenticado |
| GET    | `/search`    | Autenticado |
| GET    | `/events`    | Autenticado |
| GET    | `/works`     | Autenticado |
| GET    | `/works/new` | Autenticado |
| POST   | `/works/new` | Autenticado |
| GET    | `/beats`     | Autenticado |
| GET    | `/central`   | Autenticado |
| GET    | `/profile`   | Autenticado |
| GET    | `/settings`  | Autenticado |

A rota `/` direciona para o dashboard quando existe uma sessão válida.
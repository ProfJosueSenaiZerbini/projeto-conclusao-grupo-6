# Cypher

**A cena se encontra aqui.** A Cypher é uma plataforma web para descobrir, conectar e valorizar profissionais da cultura hip-hop, com foco na cena independente do rap.

> Projeto em desenvolvimento. Alguns recursos ainda passam por evolução e homologação.

## O que você encontra na plataforma

| Área | Recursos atuais |
| --- | --- |
| **Pessoas e perfis** | Cadastro, autenticação, perfis profissionais, busca, portfólio e representação. |
| **Criação e descoberta** | Obras, créditos, banco de beats, projetos, galerias e Espaço de Trabalho. |
| **Conexões** | Eventos, oportunidades, candidaturas, colaborações, avaliações e mensagens privadas. |
| **Apoio à comunidade** | Central de conteúdo, suporte, denúncias, moderação e administração. |

A aplicação usa **Node.js, TypeScript e Express** no servidor, **EJS, CSS e JavaScript** na interface e **SQLite** para persistência. O código segue uma organização MVC.

## Comece por aqui

Você precisa de **Node.js 20+** e **npm**. Execute os comandos a partir da pasta deste README.

**1. Entre na pasta do projeto:**

```sh
cd Cypher
```

**2. Instale as dependências e inicie o servidor:**

```sh
npm ci
npm run dev
```

Abra [http://localhost:3000/login](http://localhost:3000/login) para entrar ou criar uma conta. A área administrativa fica em [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

Para compilar e executar o JavaScript gerado, use `npm run build` e depois `npm start`, ainda dentro de `Cypher`.

## Configuração local

O banco é criado em `Cypher/data/cypher.sqlite` na inicialização. `PORT` altera a porta padrão (`3000`), e `CYPHER_DB_PATH` define outro caminho para o banco.

Na primeira execução, se ainda não existir administrador, a aplicação cria `Cypher/.env.local` com o e-mail e uma senha aleatória do **Administrador Geral**. Consulte esse arquivo para acessar `/admin/login` e mantenha as credenciais privadas. Editar o arquivo depois da criação da conta não redefine a senha existente.

Por padrão, os e-mails são gravados em `Cypher/data/emails`, sem envio externo. Para envio SMTP, configure `CYPHER_EMAIL_TRANSPORT=smtp`, `CYPHER_SMTP_USER`, `CYPHER_SMTP_PASSWORD` e, se necessário, `CYPHER_EMAIL_FROM` em `Cypher/.env.local`. Em produção, o modo local de e-mail não é aceito; também é necessária uma `CYPHER_PUBLIC_ORIGIN` HTTPS.

O catálogo de apresentação é opcional. Para carregá-lo ou atualizá-lo, execute `npm run seed:catalog` dentro de `Cypher`. O script cria um backup do banco antes da atualização.

## Estado atual

Há fluxos implementados para contas, descoberta, perfis, obras, beats, eventos, projetos, oportunidades e administração. O catálogo profissional contempla **25 profissões**. Recursos como créditos, selos e interações seguem em evolução. A compra externa de beats depende de credenciais e homologação do Mercado Pago; sem isso, arquivos Premium não são liberados.

Os [requisitos funcionais](Documentação/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RF-Cypher.md) e as [regras de negócio](Documentação/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RN-Cypher.md) descrevem o produto planejado. Para o comportamento executável, consulte o código em `Cypher/src`.

## Estrutura do repositório

```text
.
├── README.md             # este guia
├── Cypher/               # aplicação e comandos npm
│   ├── src/              # servidor, rotas e regras
│   ├── views/            # páginas EJS
│   ├── public/           # CSS, JavaScript e recursos estáticos
│   ├── scripts/          # cargas, verificações e testes
│   └── docs/             # documentação técnica pontual
└── Documentação/         # planejamento, requisitos e arquitetura
```

## Verificação

Dentro de `Cypher`, execute `npm run check` para validar os tipos e `npm run build` para compilar. Os testes por domínio estão listados em [Cypher/package.json](Cypher/package.json), por exemplo `npm run test:accounts`, `npm run test:events` e `npm run test:beats`.

## Documentação

- [Escopo do projeto](Documentação/01%20-%20Planejamento%20e%20Pesquisa/CYPHER%20-%20Escopo%20do%20Projeto.md)
- [Requisitos funcionais](Documentação/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RF-Cypher.md)
- [Regras de negócio](Documentação/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RN-Cypher.md)
- [Definição da stack](Documentação/04%20-%20Arquitetura%20e%20Tecnologias/Definicao-de-Stack-Cypher.md)
- [Anexos de mensagens](Cypher/docs/anexos-mensagens.md)

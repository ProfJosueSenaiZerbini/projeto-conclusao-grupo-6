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

Use **Node.js 24 LTS** e **npm** (o projeto usa o driver nativo better-sqlite3). Execute os comandos a partir da pasta deste README.

**1. Entre na pasta do projeto:**

```sh
cd Cypher
```

**2. Instale as dependências e inicie o servidor:**

```sh
npm ci
npm run dev
```

Abra [http://localhost:3000/entrar](http://localhost:3000/entrar) para entrar ou criar uma conta. A área administrativa fica em [http://localhost:3000/admin/entrar](http://localhost:3000/admin/entrar).

Para compilar e executar o JavaScript gerado, use `npm run build` e depois `npm start`, ainda dentro de `Cypher`.

A navegação usa URLs em português, sem acentos e com hífens: `/descoberta`, `/mensagens`, `/eventos/mapa`, `/banco-de-beats` e `/configuracoes`. As rotas antigas da interface não são aceitas. O endereço técnico do webhook do Mercado Pago permanece separado da navegação.

## Configuração local

O banco é criado em `Cypher/data/cypher.sqlite` na inicialização. `PORT` altera a porta padrão (`3000`), e `CYPHER_DB_PATH` define outro caminho para o banco.

Na primeira execução, se ainda não existir administrador, a aplicação cria `Cypher/.env.local` com o e-mail e uma senha aleatória do **Administrador Geral**. Consulte esse arquivo para acessar `/admin/entrar` e mantenha as credenciais privadas. Editar o arquivo depois da criação da conta não redefine a senha existente.

Por padrão, os e-mails são gravados em `Cypher/data/emails`, sem envio externo. Para envio SMTP, configure `CYPHER_EMAIL_TRANSPORT=smtp`, `CYPHER_SMTP_USER`, `CYPHER_SMTP_PASSWORD` e, se necessário, `CYPHER_EMAIL_FROM` em `Cypher/.env.local`. Em produção, o modo local de e-mail não é aceito; também é necessária uma `CYPHER_PUBLIC_ORIGIN` HTTPS. Defina `CYPHER_SUPPORT_EMAIL` para exibir o contato oficial nos avisos de segurança e de encerramento. Os oito comunicados usam o mesmo template institucional, com versões HTML e texto simples. As boas-vindas são disparadas na primeira confirmação, conforme o tipo da conta; a conversão para Profissional tem um comunicado próprio. `npm run test:email` valida o fluxo sem enviar e-mails reais.

### Catálogo de demonstração e restauração

- O primeiro `npm run dev` sobre a instalação padrão cria o SQLite, executa as migrações e carrega o catálogo de `Cypher/seeds/catalogo-cypher.json`. Reiniciar não duplica os exemplos nem sobrescreve dados posteriores. Se você definir um banco alternativo vazio com `CYPHER_DB_PATH`, use `CYPHER_SEED_CATALOG=1` para permitir a carga de partida, ou restaure o catálogo antecipadamente pelo comando abaixo.
- A seed contém os perfis e suas atuações, obras e faixas, ofertas e arquivos de beats, eventos, oportunidades, projetos, portfólios, selos, créditos, colaborações e interações demonstrativas válidas. Os arquivos-fonte de mídia estão em `Cypher/public/`. As cópias operacionais dos beats e das produções são recriadas a partir dessas fontes e verificadas por SHA-256.
- O SQLite de execução é gerado localmente. Não versionamos `Cypher/data/`, bases SQLite de trabalho na pasta de documentação, anexos de mensagens, uploads, contas administrativas, sessões, backups ou credenciais sensíveis.
- Catálogo não é banco de produção. Os artistas que servem de referência não recebem credenciais de acesso, e a presença de uma mídia de terceiros no acervo não comprova autorização de redistribuição pública. Reveja direitos de uso antes de divulgar o projeto fora do contexto autorizado.

Para repor os exemplos sem tocar no banco antigo, execute em `Cypher`:

```sh
npm run demo:restaurar -- data/ensaio/cypher.sqlite
npm run demo:contas -- data/ensaio/cypher.sqlite
```

O primeiro comando exige um arquivo SQLite novo. O segundo é opcional e idempotente: cria **@visita.demo** (Consumidor) e **@artista.demo** (Profissional), ambas com senha pública de aula **CypherDemo!2026**, e deixa disponível um exemplo local de licença Premium sem transação externa. Use somente em ambiente local isolado. Dados de acesso administrativo continuam exclusivos de cada instalação.

Para abrir esse ambiente no PowerShell:

```powershell
$env:CYPHER_DB_PATH = 'data/ensaio/cypher.sqlite'
$env:CYPHER_BIND_HOST = '127.0.0.1'
npm run dev
```

Em Linux/macOS: `CYPHER_DB_PATH=data/ensaio/cypher.sqlite CYPHER_BIND_HOST=127.0.0.1 npm run dev`.

Entre em `/entrar`. A cópia de trabalho antiga continua intacta. Para verificação automatizada de uma instalação isolada, execute `npm run test:demo`.

## Estado atual

Há fluxos implementados para contas, descoberta, perfis, obras, beats, eventos, projetos, oportunidades e administração. O catálogo profissional contempla **25 profissões**. Recursos como créditos, selos e interações seguem em evolução. A compra externa de beats depende de credenciais e homologação do Mercado Pago; sem isso, arquivos Premium não são liberados.

Os [requisitos funcionais](Docs/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RF-Cypher.md) e as [regras de negócio](Docs/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RN-Cypher.md) descrevem o produto planejado. Para o comportamento executável, consulte o código em `Cypher/src`.

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
└── Docs/                 # planejamento, requisitos e arquitetura
```

## Verificação

Dentro de `Cypher`, execute `npm run check` para validar os tipos e `npm run build` para compilar. Os testes por domínio estão listados em [Cypher/package.json](Cypher/package.json), por exemplo `npm run test:routes`, `npm run test:accounts`, `npm run test:events` e `npm run test:beats`.

## Documentação

- [Escopo do projeto](Docs/01%20-%20Planejamento%20e%20Pesquisa/CYPHER%20-%20Escopo%20do%20Projeto.md)
- [Requisitos funcionais](Docs/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RF-Cypher.md)
- [Regras de negócio](Docs/02%20-%20Requisitos%20e%20Regras%20de%20Negócios/RN-Cypher.md)
- [Definição da stack](Docs/04%20-%20Arquitetura%20e%20Tecnologias/Definicao-de-Stack-Cypher.md)
- [Anexos de mensagens](Cypher/docs/anexos-mensagens.md)

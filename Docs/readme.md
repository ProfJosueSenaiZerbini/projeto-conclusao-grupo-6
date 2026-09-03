Clóvis S. Alencar
Sandie E. Oliveira
Kauã N. Lopes
Nicolas G. Rodrigues

Cypher é uma plataforma digital voltada à cena underground do rap, desenvolvida para conectar artistas, beatmakers, produtores musicais, DJs e organizadores de eventos em um único ecossistema. A plataforma centraliza oportunidades, colaborações e ferramentas de gestão de carreira, permitindo o registro de obras, organização de créditos, divulgação de eventos e fortalecimento do networking entre profissionais, promovendo a profissionalização e o crescimento da cena independente.

### 🚀 Como Executar o Projeto

#### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (gerenciador de pacotes do Node)
- Banco de dados **MySQL** configurado e ativo

#### Passo a Passo

**1. Clonar o repositório**

````bash
git clone [https://github.com/ProfJosueSenaiZerbini/projeto-conclusao-grupo-6.git]

cd PROJETO-CONCLUSAO-GRUPO-6

**2. Instalar as dependências**
````Bash
npm install

3. Configurar Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto com as credenciais do seu banco de dados:

Snippet de código
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=cypher_db

4. Iniciar o servidor

Para modo de desenvolvimento (com reload automático via nodemon):

```Bash
npm run dev
Para modo de produção:

```Bash
npm start
Acesse a aplicação no seu navegador em: http://localhost:3000
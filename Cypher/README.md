# Cypher

Plataforma web para profissionais da cena musical underground. Mantém a arquitetura MVC em Node.js, TypeScript, Express, EJS, CSS, JavaScript e SQLite local.

## Requisitos e execução

- Node.js 20 ou superior
- npm

Na raiz do projeto:

```bash
npm ci
npm run dev
```

Acesse <http://localhost:3000/login>. `PORT` altera a porta. O banco é um arquivo local criado em `data/cypher.sqlite`; use `CYPHER_DB_PATH` para escolher outro caminho. Não é necessário servidor de banco. Migrações são aplicadas ao iniciar.

Para verificar e executar a versão compilada:

```bash
npm run check
npm run build
npm start
```

## Contas, perfis e descoberta

O cadastro valida nome, e-mail, senha e categorias no servidor; e-mails duplicados são recusados. Senhas são armazenadas com `scrypt` e sal aleatório. Sessões de 24 horas ficam no SQLite, que armazena apenas o hash do token. O cookie é `HttpOnly`; usa `SameSite=Lax` em HTTP local e `SameSite=None; Secure` quando HTTPS é reconhecido atrás de um proxy. Rotas privadas exigem sessão válida.

Contas novas começam com perfil e dados de contato ocultos. Cada pessoa pode editar o próprio perfil, categorias, biografia, contato, gêneros, equipamentos e status profissional, além de escolher quais informações ficam públicas. A busca e `/p/:identificador` respeitam essas preferências.

O encerramento de conta exige a senha atual e a confirmação `EXCLUIR`. Registros próprios vinculados precisam ser removidos ou transferidos antes. O acesso OG Emicê é desativado por padrão, pode ser habilitado apenas fora de produção com `CYPHER_ALLOW_OG_ACCESS=true` e é sempre desativado em `NODE_ENV=production`.

## Obras e créditos

Cada conta autenticada recebe um UUID interno e um ID Cypher público, imutável e legível no formato `CYP-{INICIAIS}{NÚMERO}`. O número é sequencial para contas reais, não é reutilizado após exclusão e não é consumido pelas contas demonstrativas. O acesso fantasma usa `CYP-FANTASMA`. Cada conta pode cadastrar, consultar, editar e excluir as próprias obras. Os registros armazenam tipo, gênero, status, descrição, letra, BPM, ISRC, ISWC, data de lançamento e link de escuta. A página `/works` mostra o catálogo completo; o perfil privado mostra até cinco obras recentes; e o perfil público mostra obras lançadas com letra e metadados públicos, sem expor BPM, ISRC ou ISWC.

O catálogo organiza as obras em Lançadas, Em produção, Rascunhos, Participações, Beats e Outros projetos. Filtros por status, tipo, gênero e papel, além da ordenação, são preservados em query parameters na URL de `/works`. Obras de terceiros em que o usuário possui crédito aparecem em Participações e não podem ser editadas pelo usuário.

O formulário aceita Obra, Música e Beat, além dos formatos de lançamento já existentes (Single, EP, Álbum e Mixtape). Créditos vinculados a perfis e menções sem perfil são armazenados separadamente. Até a confirmação, ambos aparecem como não confirmados; o fluxo para outro profissional confirmar ou rejeitar um crédito ainda não está implementado. Não há upload de áudio.

O cadastro de obras possui uma etapa contextual que orienta a pessoa entre Música, Single, EP, Álbum, Beat e Outro. A seleção adapta a orientação, os títulos das seções e a visibilidade de campos já existentes, sem alterar as rotas ou o contrato do controller. Campos persistentes específicos de licença, capa, áudio, samples e tracklist serão adicionados em mudanças próprias.

## Estado funcional

Cadastro, login, logout, sessões, autorização, edição e privacidade de perfil, busca de profissionais e gerenciamento das próprias obras usam o SQLite.

Cadastro, gerenciamento e descoberta de eventos agora usam o SQLite. O interesse em oportunidades é persistido por usuário e evento, pode ser cancelado e permite ao responsável pelo evento acompanhar e atualizar o status para interessado, inscrito, confirmado ou rejeitado. Novos interesses só são aceitos em eventos reais e não encerrados. Após a implementação das regras de cargos e eventos, fixtures demonstrativas de eventos e Beats não são mais carregadas nem mantidas no banco; esses módulos passam a depender de registros reais. Solicitações de conexão e contato com produtores ainda não gravam operações persistentes. O Banco de Beats permite descobrir beats reais por qualquer conta autenticada, mas o cadastro de novos Beats exige a categoria `Beatmaker`; a propriedade continua controlando edição, exclusão e ofertas. Upload de áudio, capa, player real, compra e checkout continuam fora do escopo atual.

Contas com a categoria `Organizador de eventos` podem criar novos eventos. Eventos reais próprios continuam podendo ser administrados com segurança para evitar recursos órfãos mesmo se a categoria for removida depois; eventos de terceiros não podem ser editados. Todas as contas autenticadas podem descobrir eventos reais e, quando o evento não está encerrado, demonstrar ou cancelar interesse. Filtros por categoria, localização, formato e período, além da ordenação por criação, data ou título, continuam disponíveis. A categoria `Beatmaker` habilita o cadastro de Beats; categorias múltiplas preservam capacidades cumulativas. Não há fixtures demonstrativas de eventos ou Beats ativas nesta versão.

## Estrutura

- `src/aplicacao.ts`: inicialização do Express e do banco.
- `src/app/routes/`: rotas HTTP e autorização.
- `src/app/controllers/`: entry points separados por domínio, com fachada de compatibilidade durante a migração.
- `src/app/validators/`: validações puras de autenticação, perfil, obra, crédito, evento e conta.
- `src/app/models/`: regras de negócio, autenticação e persistência SQLite.
- `views/pages/` e `views/partials/`: páginas EJS e componentes compartilhados.
- `views/partials/componentes/estado-vazio.ejs`: padrão acessível e responsivo para ausência de dados.
- `public/css/` e `public/js/`: estilos e interações do navegador.
- `scripts/`: utilitários de formatação.


## Cadastro de obras por tipo

A página `/works` inicia o cadastro por um modal de seleção entre Instrumental, Música, Single, EP, Álbum, Beat e Outro. Obras comuns seguem para `/works/new?tipo=<slug>` e recebem um formulário contextualizado. A opção Beat reutiliza o fluxo persistente do Banco de Beats em `/beats/new`, mantendo as regras próprias de licenças e ofertas. O tipo Instrumental utiliza o campo textual de tipo já existente em `obras`; essa melhoria não alterou a tabela `obras`. O schema atual do SQLite é a versão 7 por causa da persistência de interesses em eventos.

O relatório detalhado desta melhoria está em `relatorios-incrementacao/melhoria-18-cadastro-obras-por-tipo.md`.

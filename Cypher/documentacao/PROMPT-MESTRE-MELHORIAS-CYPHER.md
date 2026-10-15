# Prompt-mestre de evolução do Cypher

## Contexto da solicitação

Este documento deve ser usado como especificação principal para continuar a evolução do projeto **Cypher**, uma plataforma musical construída com Node.js, TypeScript, Express, EJS, SQLite via `better-sqlite3`, JavaScript vanilla e CSS modular.

O projeto utiliza uma arquitetura MVC modular, com controllers por domínio, validators separados, fachada `CypherModel`, persistência SQLite transacional, schema incremental e views EJS. A estrutura atual deve ser preservada. Não substituir a arquitetura por outro framework, não reorganizar arquivos sem necessidade e não misturar responsabilidades entre controller, model, validator e view.

A interface, os relatórios e a documentação devem permanecer em **português do Brasil**.

---

## Estado atual conhecido

As seguintes capacidades já foram implementadas e devem ser preservadas:

- autenticação, cadastro, login, logout e sessões persistentes;
- perfis profissionais e perfil público com regras de privacidade;
- identificador público Cypher imutável para contas reais;
- catálogo persistente de obras, com créditos, menções, filtros e organização por seções;
- cadastro contextual de obras;
- estados vazios reutilizáveis;
- controllers e validators separados por domínio;
- CRUD persistente de eventos com autorização de organizadores;
- CRUD persistente de Beats;
- campos técnicos de Beats: BPM, tonalidade, gênero e duração;
- múltiplas ofertas de licença por Beat;
- preço opcional por oferta, armazenado em centavos;
- opção persistente de venda exclusiva de Beat;
- exigência de uma única oferta `Exclusiva` quando o Beat é marcado como exclusivo;
- exibição visual de `VENDA EXCLUSIVA` no catálogo e no detalhe do Beat;
- schema SQLite atualmente na versão 6;
- documentação técnica e relatórios incrementais;
- pacotes ZIP completos e sessões separadas de mudanças.

A tabela atualmente existente `ofertas_beats` armazena ofertas de licença. A tabela `beats` possui a coluna `venda_exclusiva`.

---

# Objetivo principal desta nova sequência

Evoluir o sistema para possuir um núcleo real de **atividades, notificações e, posteriormente, mensagens**, sem implementar tudo de uma vez e sem criar funcionalidades demonstrativas que aparentem ser reais.

A prioridade imediata é tornar as **notificações funcionais**.

A funcionalidade de **mensagens deve permanecer em stand-by por enquanto**: a navegação e a estrutura visual podem ser preparadas, mas não deve existir envio ou persistência de mensagens nesta primeira etapa, salvo nova autorização explícita.

---

# Decisão de produto confirmada

## Notificações

O usuário quer um botão de sino na barra superior que abra um painel/pop-up de notificações, inspirado visualmente na referência enviada.

Comportamento desejado:

1. O botão de sino fica visível na barra superior para usuários autenticados.
2. Ao clicar no sino, abre um painel suspenso/popover, sem sair da página atual.
3. O painel mostra as notificações mais recentes.
4. Notificações não lidas ficam visualmente destacadas.
5. O botão de sino exibe um indicador de quantidade de não lidas, quando houver.
6. O usuário pode marcar uma notificação individual como lida.
7. O usuário pode marcar todas como lidas.
8. O painel deve possuir estado vazio real, com texto semelhante a:
   - “Não há notificações ainda”;
   - “Você receberá notificações quando houver uma nova atividade relevante.”
9. O painel deve possuir um link **“Ver todas as notificações”** apontando para `/notificacoes`.
10. A página `/notificacoes` deve listar o histórico completo de notificações, com filtros simples quando isso for útil.
11. A leitura e o estado de lido devem ser persistidos no banco, não apenas em `localStorage`.
12. O painel deve fechar ao clicar fora, pressionar `Escape` ou clicar novamente no sino.
13. A implementação deve ser acessível:
    - botão com `aria-label` adequado;
    - painel com relacionamento `aria-expanded` e `aria-controls`;
    - foco coerente;
    - navegação por teclado;
    - textos legíveis em modo claro e escuro.

## Mensagens

O ícone de mensagens deve existir ou ser preparado visualmente na barra superior, mas a funcionalidade deve permanecer em **stand-by** nesta fase.

Nesta fase de notificações:

- não criar envio de mensagens;
- não criar conversas persistentes;
- não criar chat em tempo real;
- não criar tabela de mensagens, caso ela não seja necessária para o botão em stand-by;
- não apresentar uma conversa falsa como se fosse funcional;
- se o ícone for clicável, abrir uma tela ou estado claramente identificado como “Mensagens em breve”;
- preferencialmente, usar uma rota própria `/mensagens` somente se isso puder ser feito sem simular uma funcionalidade pronta;
- deixar a futura estrutura prevista para `/mensagens` e `/mensagens/:id`, mas não implementar o domínio ainda.

---

# Ordem recomendada de implementação

As etapas abaixo devem ser executadas na ordem indicada. Melhorias relacionadas foram agrupadas para evitar fragmentação desnecessária.

---

## Etapa 1 — Núcleo persistente de atividades e notificações

### Objetivo

Criar a base de dados e o model necessários para gerar, consultar, ler e marcar notificações como lidas.

### Escopo funcional

Implementar notificações persistentes para eventos reais da plataforma, começando por eventos já existentes e controláveis no sistema.

Tipos iniciais recomendados:

- nova obra criada pelo próprio usuário, se houver utilidade no histórico pessoal;
- Beat criado ou atualizado pelo próprio usuário;
- oferta de licença adicionada ou alterada em Beat próprio;
- Beat marcado como venda exclusiva;
- evento criado ou atualizado pelo próprio usuário;
- alteração relevante no perfil ou nas configurações de privacidade, se fizer sentido;
- futura compra ou confirmação de licença exclusiva, quando o fluxo de compra existir;
- futuras interações de seguidores, créditos ou conexões, quando esses domínios forem implementados.

Não criar notificações artificiais somente para preencher a tela. Os eventos devem ser gerados por ações reais do sistema ou identificados explicitamente como sistema interno.

### Estrutura de dados recomendada

Criar uma tabela `notificacoes`, salvo se a análise do model demonstrar que uma estrutura existente atende integralmente ao caso.

Estrutura mínima recomendada:

```sql
CREATE TABLE notificacoes (
  id TEXT PRIMARY KEY,
  usuario_destino_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  entidade_tipo TEXT NOT NULL DEFAULT '',
  entidade_id TEXT NOT NULL DEFAULT '',
  lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
  criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lida_em TEXT
);
```

Criar índices adequados, no mínimo:

```sql
CREATE INDEX indice_notificacoes_usuario_data
  ON notificacoes(usuario_destino_id, criada_em);

CREATE INDEX indice_notificacoes_usuario_lida
  ON notificacoes(usuario_destino_id, lida, criada_em);
```

Os nomes finais podem seguir o padrão já usado no projeto, mas qualquer alteração deve ser documentada.

### Regras importantes

- Notificações pertencem a um usuário destinatário.
- O usuário só pode visualizar e alterar notificações destinadas a ele.
- Marcar uma notificação como lida deve verificar o usuário da sessão no servidor.
- A URL de destino deve ser validada/gerada pelo servidor, nunca aceita cegamente do navegador.
- A exclusão de uma conta deve remover as notificações destinadas a ela via `ON DELETE CASCADE`.
- Não permitir que o usuário altere `usuario_destino_id`, `tipo`, `criada_em` ou `entidade_id` por parâmetros enviados pelo navegador.
- Evitar duplicações acidentais quando a mesma ação for processada duas vezes.
- Se for necessário idempotência, avaliar uma chave de referência da origem ou uma restrição adequada.

### Rotas/model sugeridos

As rotas devem seguir o padrão atual do projeto. Sugestão:

```text
GET  /notificacoes
POST /notificacoes/:id/lida
POST /notificacoes/marcar-todas-lidas
GET  /api/notificacoes/recentes
```

A rota de API só deve ser criada se o painel precisar dela. Caso os dados possam ser renderizados pelo servidor junto ao shell, evitar uma API desnecessária.

### Resultado esperado

Ao terminar esta etapa, o banco deve conseguir armazenar notificações reais e o backend deve conseguir:

- listar recentes;
- contar não lidas;
- listar histórico completo;
- marcar uma como lida;
- marcar todas como lidas;
- respeitar autorização por usuário.

---

## Etapa 2 — Botão do sino, popover e página completa de notificações

### Objetivo

Integrar o núcleo persistente ao frontend de forma reutilizável e visualmente coerente com a Cypher.

### Componente reutilizável

Criar um partial EJS reutilizável para a barra superior, por exemplo:

```text
views/partials/componentes/central-notificacoes.ejs
```

O nome final pode seguir os padrões já existentes.

O componente deve receber dados do controller, como:

```text
notificacoesRecentes
quantidadeNaoLidas
```

Não duplicar a marcação do sino em várias páginas.

### Comportamento visual

Inspirar-se na imagem fornecida pelo usuário:

- sino dentro de botão circular ou cápsula da barra superior;
- painel branco ou compatível com o tema atual;
- painel alinhado ao sino;
- largura suficiente para títulos e mensagens;
- altura máxima com rolagem interna;
- cabeçalho com o título “Notificações”;
- botão ou link para marcar todas como lidas;
- estado vazio visualmente centralizado;
- cada item mostrando ícone/tipo, título, resumo, data relativa e estado de leitura;
- destaque visual discreto para não lidas;
- compatibilidade com mobile, sem sair da viewport.

### Acessibilidade e interação

- `button` real, não apenas um `div` clicável;
- `aria-label="Abrir notificações"`;
- `aria-expanded="true/false"`;
- `aria-controls` apontando para o painel;
- fechamento com `Escape`;
- fechamento ao clicar fora;
- foco e leitura coerentes para leitores de tela;
- não depender exclusivamente de cor para indicar não lida;
- respeitar o tema claro/escuro.

### Página `/notificacoes`

Criar uma página completa para histórico, mesmo que inicialmente simples, porque o usuário confirmou a necessidade de um link “Ver todas”.

A página deve permitir:

- visualizar notificações recentes e antigas;
- distinguir lidas de não lidas;
- marcar individualmente como lidas;
- marcar todas como lidas;
- abrir a entidade relacionada, quando existir uma URL válida;
- exibir estado vazio quando não houver registros.

Não criar paginação complexa nesta primeira versão se o volume ainda não justificar. Entretanto, estruturar o model para permitir paginação futura.

---

## Etapa 3 — Geradores de notificações nos domínios existentes

### Objetivo

Conectar as ações atuais do sistema ao núcleo de notificações sem espalhar SQL de notificações pelos controllers.

### Organização recomendada

Criar um serviço ou módulo compartilhado somente se houver necessidade real, por exemplo:

```text
src/app/services/servicoNotificacoes.ts
```

Esse serviço deve:

- receber o destinatário, tipo, texto e referência da entidade;
- criar notificações com dados normalizados;
- evitar duplicação quando necessário;
- manter o controller focado em autorização, fluxo HTTP e resposta;
- manter o acesso ao banco dentro do model/serviço apropriado.

Não criar uma pasta de serviços apenas por antecipação. Se a arquitetura atual preferir manter essa lógica no model, seguir o padrão existente sem duplicação.

### Primeiros eventos reais

Priorizar os eventos que já têm domínio persistente:

1. criação de Beat;
2. atualização de Beat;
3. alteração de ofertas de Beat;
4. ativação/desativação da venda exclusiva;
5. criação e atualização de obra;
6. criação e atualização de evento;
7. alterações importantes no próprio perfil.

O texto das notificações deve ser em PT-BR e conter links internos quando aplicável.

### Critério de qualidade

Uma ação deve gerar no máximo a notificação necessária. Não criar várias notificações duplicadas pelo mesmo POST ou pelo carregamento da página.

---

## Etapa 4 — Preparação visual de mensagens em stand-by

### Objetivo

Preparar a navegação para mensagens sem afirmar que o recurso está pronto.

### Escopo permitido nesta etapa

- manter ou adicionar o ícone de mensagens na barra superior;
- criar um partial reutilizável para o botão;
- criar a rota `/mensagens` apenas se for necessário para uma tela de espera real;
- mostrar uma tela com:
  - “Mensagens em breve”;
  - explicação de que as conversas ainda não estão disponíveis;
  - nenhum formulário de envio funcional;
  - nenhum histórico inventado;
  - nenhum contador falso de não lidas.

### Fora do escopo

Não criar ainda:

- tabela `mensagens`;
- tabela `conversas`;
- envio de mensagens;
- edição/exclusão de mensagens;
- anexos;
- WebSocket;
- notificações de mensagens;
- confirmação de leitura de mensagens;
- bloqueio ou denúncia de usuários.

As rotas futuras `/mensagens` e `/mensagens/:id` podem ser registradas na documentação como planejamento, mas não devem ser apresentadas como fluxo funcional se ainda estiverem em stand-by.

---

## Etapa 5 — Compras e histórico de licenças exclusivas

### Objetivo

Implementar o fluxo persistente necessário para que a venda exclusiva deixe de ser apenas uma classificação e passe a ter uma aquisição registrada.

Esta etapa deve ocorrer **depois** do núcleo de notificações, pois compras confirmadas deverão gerar notificações para comprador e beatmaker.

### Estrutura prevista

Criar uma tabela própria, por exemplo `compras_beats` ou `transacoes_beats`, depois de confirmar o nome final.

Campos mínimos esperados:

```text
id
beat_id
oferta_id
comprador_id
produtor_id
valor_centavos
tipo_licenca
status
criada_em
confirmada_em
cancelada_em
```

Índices esperados:

```text
por beat
por comprador
por produtor
por status
```

### Regras de exclusividade

- uma oferta exclusiva só pode ser confirmada uma vez;
- a confirmação deve ocorrer em transação SQLite;
- a operação deve verificar novamente se o Beat ainda está disponível;
- após confirmação, as ofertas ficam inativas ou o Beat recebe status comercial de vendido;
- novas compras devem ser recusadas no servidor;
- o comprador deve receber histórico da aquisição;
- o beatmaker deve receber histórico da venda;
- a confirmação deve gerar notificações persistentes para as partes envolvidas;
- não implementar pagamento real sem autorização específica e sem definir o provedor.

### Importante

Se o sistema ainda não tiver pagamento, implementar primeiro um fluxo de **compra interna/demonstrativa claramente identificado**, ou limitar a etapa ao registro de interesse/solicitação de aquisição. Não simular pagamento como se fosse real.

---

## Etapa 6 — Histórico geral de atividades e auditoria leve

### Objetivo

Depois que notificações e compras existirem, avaliar se é necessário um histórico geral separado de notificações.

### Diferença obrigatória

- **Notificação:** mensagem destinada ao usuário, geralmente acionável e com estado de lida.
- **Histórico de atividade:** registro de eventos relevantes para consulta/auditoria, mesmo que não gere uma notificação.
- **Histórico de compra/licença:** registro comercial específico e permanente.

Não misturar esses conceitos automaticamente.

Criar uma tabela `historico_atividades` somente se houver necessidade real de auditoria, rastreabilidade ou timeline. Não criar essa tabela apenas porque existe a palavra “histórico” na interface.

---

## Etapa 7 — Melhorias funcionais pendentes agrupadas

Depois do núcleo de comunicação e compras, tratar os demais pontos pendentes em blocos maiores:

### 7.1 Mídia e catálogo musical

Agrupar:

- upload de áudio;
- upload de capa;
- player real;
- associação de áudio/capa às obras e Beats;
- metadados e validação de arquivos;
- armazenamento seguro e limites de tamanho;
- privacidade e autorização de acesso.

Não implementar upload de arquivos sem decidir armazenamento, limite, formato, nomenclatura e estratégia de backup.

### 7.2 Interações sociais

Agrupar:

- seguir usuários;
- solicitações de conexão;
- contato com produtores;
- interação com oportunidades;
- notificações derivadas dessas ações.

Cada interação que gerar notificação deve utilizar o núcleo criado nas etapas anteriores.

### 7.3 Créditos e colaboração

Agrupar:

- confirmação/rejeição de créditos;
- notificações sobre convite para crédito;
- histórico de alterações em créditos;
- regras de autorização para aceitar ou recusar.

### 7.4 Dashboard e dados reais

Substituir partes demonstrativas da visão geral por dados persistentes:

- estatísticas reais do catálogo;
- atividades recentes;
- notificações recentes;
- histórico de Beats e obras;
- métricas de oportunidades quando o domínio existir.

### 7.5 Segurança e robustez

Agrupar:

- proteção CSRF para POSTs;
- rate limiting e proteção contra tentativas repetidas de login;
- recuperação de senha;
- verificação de e-mail;
- headers de segurança, incluindo CSP e HSTS quando compatível;
- tratamento seguro de JSON corrompido;
- estratégia de backup do SQLite;
- validação de todos os links internos e referências de entidades.

---

# Regras obrigatórias para todas as etapas

## Consulta antes de mudanças relevantes

Antes de qualquer etapa que altere produto, arquitetura, permissões, modelo de dados ou fluxo do usuário, apresentar uma proposta curta e aguardar confirmação do usuário.

Não pedir confirmação para:

- correções de formatação;
- correções de TypeScript;
- correções de regressões diretamente causadas pela etapa aprovada;
- ajustes de acessibilidade necessários para cumprir a especificação;
- migrações diretamente necessárias para a etapa já aprovada.

## Preservação da arquitetura

- manter MVC;
- manter TypeScript estrito;
- manter controllers por domínio;
- manter validators sem acesso ao banco;
- manter a fachada `CypherModel`;
- evitar duplicação de regras;
- não mover arquivos sem necessidade;
- não alterar rotas antigas sem compatibilidade;
- não quebrar sessões ou autorização;
- preservar fixtures demonstrativas separadas dos dados reais.

## Transparência obrigatória sobre banco de dados

A cada alteração estrutural, informar explicitamente:

1. se alguma tabela foi criada;
2. se alguma tabela foi removida;
3. se alguma coluna foi adicionada;
4. se alguma coluna foi removida;
5. se alguma coluna teve tipo ou restrição alterada;
6. se algum índice foi criado, alterado ou removido;
7. qual foi a nova versão do schema;
8. como a migração atualiza bancos existentes;
9. se houve backfill ou conversão de dados;
10. como a alteração afeta exclusão, cascata e integridade referencial.

Nunca informar apenas “banco atualizado”. Usar uma seção clara chamada **Alterações estruturais no banco**.

## Documentação e entrega

Após cada etapa relevante:

- atualizar `ANALISE-PROJETO.md`;
- criar ou atualizar o relatório em `relatorios-incrementacao/`;
- registrar decisões, alterações, testes e pendências;
- criar ZIP completo e documentado do projeto;
- criar uma sessão separada com os arquivos alterados e a documentação;
- verificar se o ZIP pode ser aberto e se contém os arquivos esperados;
- entregar os caminhos absolutos dos artefatos.

## Testes obrigatórios

Executar, quando aplicável:

```bash
npm run format
npm run check
npm run format:views
npm run build
```

Também executar smoke tests para:

- login e sessão;
- acesso ao painel;
- abertura do painel de notificações;
- estado vazio;
- listagem de notificações;
- marcação individual como lida;
- marcação de todas como lidas;
- autorização entre usuários;
- comportamento mobile e teclado;
- modo claro e escuro;
- migração em banco existente;
- não duplicação de notificações.

Não considerar concluído se o recurso apenas renderiza visualmente, mas não persiste os dados ou não aplica autorização no servidor.

---

# Critérios de aceite da primeira entrega

A primeira entrega funcional deste plano, referente às notificações, somente estará concluída quando:

1. existir um botão de sino reutilizável na barra superior;
2. o botão abrir um popover funcional;
3. o popover consultar notificações persistidas;
4. notificações não lidas forem destacadas;
5. o contador de não lidas for real;
6. for possível marcar uma notificação como lida;
7. for possível marcar todas como lidas;
8. existir estado vazio real;
9. existir link para `/notificacoes`;
10. `/notificacoes` listar o histórico persistido;
11. a autorização impedir acesso a notificações de outro usuário;
12. todas as alterações estruturais do SQLite estiverem documentadas;
13. as mensagens permanecerem em stand-by, sem fluxo falso de envio;
14. os testes TypeScript, build, smoke tests e migração passarem;
15. o ZIP completo e a sessão separada forem entregues.

---

# Resumo da ordem final

1. Núcleo persistente de atividades e notificações.
2. Botão do sino, popover e página `/notificacoes`.
3. Geração de notificações a partir dos domínios existentes.
4. Preparação visual de mensagens em stand-by, sem envio funcional.
5. Compras e histórico de licenças exclusivas de Beats.
6. Avaliação de histórico geral/auditoria, somente se necessário.
7. Mídia, interações sociais, créditos, dashboard real e hardening de segurança, agrupados por domínio.

**Não implementar nenhuma etapa automaticamente apenas por este documento. Usar este prompt como plano de trabalho e consultar o usuário antes de cada mudança relevante.**

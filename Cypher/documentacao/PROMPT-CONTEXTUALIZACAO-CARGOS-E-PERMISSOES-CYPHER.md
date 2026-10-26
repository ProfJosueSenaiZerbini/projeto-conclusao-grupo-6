# Prompt de contextualização — Cargos, permissões e veracidade das interações na Cypher

## Contexto geral

A Cypher é uma plataforma voltada para profissionais da cena musical underground. O cadastro permite que a pessoa selecione categorias profissionais que representam como ela participa desse ecossistema, como `Rapper / MC`, `Beatmaker`, `Produtor musical`, `DJ`, `Empreendedor`, `Organizador de eventos` e `Outros`.

O ponto central desta contextualização é explicar a diferença entre:

- informar uma categoria profissional no cadastro;
- possuir um cargo reconhecido dentro da plataforma;
- ter permissões funcionais relacionadas a esse cargo;
- executar ações reais que produzem dados persistentes;
- apenas visualizar elementos demonstrativos da interface.

Esses conceitos ainda não estão completamente alinhados na versão atual da Cypher. As categorias existem e são armazenadas, mas nem todas elas produzem consequências práticas na conta. Por isso, uma pessoa pode selecionar uma categoria profissional e, ainda assim, a plataforma não aplicar as capacidades que normalmente estariam associadas a essa função.

---

## Como as categorias funcionam atualmente

As categorias são selecionadas durante o cadastro e também fazem parte dos dados do perfil. Elas são armazenadas no SQLite dentro dos dados do perfil, em uma estrutura JSON.

A conta pode ter mais de uma categoria. Portanto, o cadastro não representa necessariamente um único cargo. Uma mesma pessoa pode ser, por exemplo, `Rapper / MC` e `Beatmaker`, ou `DJ` e `Organizador de eventos`.

O projeto também possui o campo `usuarios.tipo_conta`, mas ele não representa todos os cargos profissionais disponíveis. Atualmente, esse campo trabalha apenas com dois agrupamentos principais:

- `profissional`;
- `organizador`.

Na prática, a presença de `Organizador de eventos` entre as categorias é o que faz a conta ser tratada como `organizador`. As demais categorias continuam agrupadas como `profissional`, mesmo sendo diferentes entre si.

Isso significa que, no estado atual, a Cypher reconhece de forma funcional apenas uma especialização de acesso mais clara: a de organizador de eventos. As categorias `Beatmaker`, `Produtor musical`, `DJ`, `Rapper / MC`, `Empreendedor` e `Outros` ainda funcionam principalmente como informações de perfil, descoberta e status profissional.

Os status profissionais existentes também são derivados das categorias. Por exemplo, determinadas opções de disponibilidade são mostradas conforme as categorias selecionadas. Isso demonstra que as categorias já participam da lógica de apresentação e validação do perfil, mas não significa que elas já formem uma matriz completa de autorização para todos os recursos da plataforma.

---

## O que significa oficializar um cargo

Oficializar um cargo, neste contexto, não significa apenas trocar o texto exibido no perfil ou transformar uma categoria em um título visual.

Significa que a categoria profissional passa a ter uma relação coerente com as capacidades da conta dentro da plataforma. O cargo deixa de ser somente uma declaração informativa e passa a explicar, de maneira consistente:

- quais recursos a pessoa pode criar;
- quais recursos ela pode editar;
- quais recursos ela pode excluir;
- quais ações ela pode executar em recursos de outras pessoas;
- quais ações ela pode apenas visualizar;
- quais operações geram dados persistentes;
- quais áreas devem aparecer ou não na navegação;
- quais ações devem ser rejeitadas pelo servidor quando tentadas diretamente.

Essa oficialização também precisa considerar que uma pessoa pode ter mais de uma categoria. Portanto, o cargo não deve ser interpretado necessariamente como uma escolha única. As capacidades de uma conta podem ser resultado da combinação de suas categorias.

Por exemplo, uma pessoa que seja `Beatmaker` e `Organizador de eventos` teria uma identidade profissional múltipla. O fato de possuir uma categoria não deveria apagar ou substituir a outra. As capacidades relacionadas a ambas precisariam coexistir, desde que cada domínio possua regras próprias.

---

## Estado atual dos eventos

A Cypher possui uma tabela persistente `eventos` no SQLite. Existem dois tipos de registros:

- eventos demonstrativos, identificados por `demonstracao = 1`;
- eventos reais criados por contas, identificados por `demonstracao = 0`.

Os eventos demonstrativos são fixtures carregadas pelo sistema para apresentar a interface quando o projeto ainda não possui dados reais suficientes. Eles são estáticos no sentido de que não pertencem a um fluxo real de criação, inscrição ou gerenciamento por usuários comuns.

A criação real de eventos já existe tecnicamente, mas não está disponível para qualquer conta. No estado atual, somente contas tratadas como `organizador` podem criar, editar e excluir seus próprios eventos. Essa condição é derivada da categoria `Organizador de eventos`.

Portanto, a afirmação de que os eventos não são criáveis precisa ser entendida com precisão:

- eventos demonstrativos não são criados pelo usuário e funcionam como dados de apresentação;
- eventos reais podem ser criados, mas somente por contas com o agrupamento de organizador;
- se não houver uma conta real de organizador criando eventos, a experiência prática fica limitada aos eventos demonstrativos;
- para um usuário comum, a tela pode parecer composta apenas por oportunidades estáticas, mesmo que o backend já possua um fluxo real para organizadores.

Esse é o ponto que gera a sensação de incoerência: a interface apresenta oportunidades e permite uma interação, mas a maior parte do conteúdo visível pode não representar uma oportunidade real criada e administrada por uma pessoa real.

---

## Estado atual dos interesses em eventos

A Etapa 1 adicionou persistência para interesses em eventos. A tabela `interesses_eventos` relaciona um usuário a um evento e mantém estados como:

- `interessado`;
- `inscrito`;
- `confirmado`;
- `rejeitado`;
- `cancelado`.

Também existem rotas para demonstrar interesse, cancelar interesse e alterar o status de uma participação por parte do organizador do evento.

O problema de coerência é que a persistência foi criada para o domínio geral de eventos, mas a distinção entre evento real e evento demonstrativo ainda precisa ser considerada na interpretação da interação.

Na versão atual, um usuário real pode registrar interesse em um evento demonstrativo, desde que esteja autenticado. Esse registro pode ser salvo no banco, embora o evento demonstrativo não represente necessariamente uma oportunidade real com um organizador real acompanhando inscrições.

Consequentemente, o interesse pode ser tecnicamente verdadeiro como ação executada pelo usuário, mas não necessariamente verdadeiro como inscrição em uma oportunidade real da plataforma.

Essa diferença é importante:

- o usuário realmente clicou no botão;
- o banco realmente pode registrar a ação;
- mas o evento pode ser apenas uma fixture de demonstração;
- não há necessariamente um organizador real para receber, avaliar ou confirmar esse interesse;
- o status de participação pode perder significado se o evento não fizer parte de um fluxo real.

Assim, o problema não é apenas visual. É um problema de semântica dos dados. A interface pode estar dizendo ao usuário que ele está demonstrando interesse em uma oportunidade, enquanto o sistema, na prática, está registrando interesse em um conteúdo demonstrativo.

---

## Estado atual do Banco de Beats

O Banco de Beats possui funcionalidades persistentes para:

- cadastrar Beats;
- editar Beats próprios;
- excluir Beats próprios;
- cadastrar e administrar ofertas associadas;
- consultar Beats demonstrativos e reais.

O controller já impede contas demonstrativas de gravar dados. Porém, para contas reais, a criação e administração de Beats não dependem atualmente da categoria `Beatmaker` ou `Produtor musical`.

Isso significa que, na prática atual, uma conta real que tenha selecionado apenas `Rapper / MC`, `DJ`, `Empreendedor` ou `Outros` pode chegar ao fluxo de cadastro de Beats e tentar utilizar uma funcionalidade que não está necessariamente relacionada ao seu cargo declarado.

A categoria `Beatmaker` existe no perfil, mas ainda não é usada como autorização específica para o Banco de Beats. A categoria `Produtor musical` também existe e aparece como uma área relacionada à produção, mas não forma atualmente uma permissão diferenciada para esse domínio.

A consequência é que o cadastro de cargo não orienta completamente o acesso funcional. A pessoa informa quem é dentro da cena, mas a aplicação não usa essa informação de modo equivalente em todos os módulos.

---

## O problema da veracidade das interações

Interações persistentes só fazem sentido quando o objeto da interação possui existência e significado correspondentes.

Um interesse em um evento é semanticamente confiável quando:

- o evento é real;
- existe um proprietário ou organizador responsável;
- o evento pode ser administrado;
- o organizador pode consultar os interessados;
- o status pode ser alterado por uma pessoa autorizada;
- o usuário entende que está interagindo com uma oportunidade real.

Quando o evento é apenas demonstrativo, a ação pode continuar existindo tecnicamente, mas passa a ter um significado limitado. Ela funciona como demonstração da interface, não como uma inscrição real em uma oportunidade real.

O mesmo princípio vale para outros módulos:

- um botão de cadastrar Beat pressupõe que a conta tenha uma relação coerente com a produção de instrumentais;
- um botão de criar evento pressupõe que a conta tenha função de organização;
- uma ação de alterar participantes pressupõe que a pessoa seja responsável pelo evento;
- uma confirmação de participação pressupõe que exista um evento real e um responsável capaz de confirmá-la.

Quando essas relações não são respeitadas, o sistema pode armazenar dados válidos do ponto de vista técnico, mas inconsistentes do ponto de vista do domínio.

---

## Impactos indiretos dessa falta de oficialização

A ausência de uma relação completa entre cargo e permissão afeta mais do que a visibilidade de botões.

Ela afeta a navegação, porque o menu pode apresentar funções que não pertencem ao perfil da pessoa.

Afeta a experiência de cadastro, porque a categoria escolhida parece descritiva, mas não explica o que a pessoa poderá fazer.

Afeta a consistência dos dados, porque ações podem ser persistidas sem que o recurso relacionado tenha um responsável real ou uma finalidade funcional compatível.

Afeta a confiança do usuário, porque a plataforma pode sugerir que uma ação terá consequência prática quando ela está vinculada apenas a fixtures ou a fluxos incompletos.

Afeta a autorização, porque ocultar um botão não impede uma requisição direta à rota. Uma pessoa sem o cargo apropriado poderia tentar acessar uma URL manualmente.

Afeta a evolução futura, porque notificações, histórico de atividades, reputação, confirmações e métricas dependeriam de dados que talvez tenham sido produzidos em contextos demonstrativos ou por contas sem relação adequada com o domínio.

Afeta a interpretação do histórico, porque uma participação confirmada em um evento demonstrativo não deveria ser tratada da mesma forma que uma participação confirmada em um evento real.

Afeta a manutenção, porque regras espalhadas entre views, controllers e campos genéricos podem produzir resultados diferentes para a mesma conta.

---

## Múltiplos cargos e mudanças no perfil

Como a conta pode selecionar múltiplas categorias, a interpretação correta não é necessariamente escolher um único cargo e descartar os demais.

As categorias representam dimensões profissionais que podem coexistir. Uma pessoa pode atuar como artista e produtora, ou como DJ e organizadora. Portanto, a relação entre cargo e capacidade precisa considerar a combinação selecionada.

Também existe uma questão relacionada à alteração posterior do perfil. Se uma pessoa retirar uma categoria, a mudança deve alterar sua identidade funcional para operações futuras, mas isso não significa automaticamente que os dados antigos deixem de existir.

Por exemplo, a remoção de `Beatmaker` não apaga automaticamente Beats já cadastrados. A remoção de `Organizador de eventos` não transforma automaticamente eventos antigos em fixtures nem deve apagar silenciosamente o histórico relacionado.

Isso demonstra que oficializar cargos envolve separar:

- permissão para criar novos recursos;
- permissão para administrar recursos próprios já existentes;
- propriedade histórica dos dados;
- visualização pública ou privada;
- validade de interações futuras;
- tratamento de recursos que ficariam sem uma função ativa.

Essas questões fazem parte do problema mesmo quando não aparecem diretamente no botão de cadastro.

---

## Limites do que já existe na Cypher

O estado atual já fornece uma base para esse domínio:

- as categorias profissionais já existem;
- o cadastro aceita múltiplas categorias;
- os dados são armazenados no SQLite;
- os status profissionais são derivados das categorias;
- `Organizador de eventos` já influencia o tipo de conta;
- eventos reais já podem ser criados por organizadores;
- eventos demonstrativos são identificáveis pelo campo `demonstracao`;
- Beats reais já possuem CRUD;
- a propriedade de Beats e eventos já é verificada em partes dos controllers;
- interesses reais já possuem uma tabela e estados persistentes;
- contas demonstrativas já são diferenciadas das contas reais.

O que ainda não está completamente consolidado é a utilização uniforme das categorias como autoridade funcional para todos os domínios.

A Cypher ainda não possui, de forma completa, uma matriz única que diga claramente quais categorias podem criar, administrar, confirmar ou apenas visualizar cada recurso.

Também não há, no estado atual, uma separação semântica suficientemente forte entre uma interação persistida em evento real e uma interação persistida em fixture demonstrativa.

---

## Relação com as próximas etapas do projeto

Esse ponto deve ser compreendido antes de interpretar corretamente funcionalidades como histórico de participações, notificações e reputação.

O prompt mestre do projeto prevê um núcleo futuro de notificações e atividades persistentes. Entretanto, notificações só serão confiáveis se forem geradas a partir de ações reais, recursos reais e destinatários corretamente relacionados.

Da mesma forma, um histórico de participação só será confiável se distinguir uma participação real de uma interação demonstrativa.

Por isso, a oficialização dos cargos e a separação clara entre recursos reais e demonstrativos são fundamentos conceituais para a evolução posterior da Cypher. Elas não são apenas melhorias de navegação ou de aparência.

Ao mesmo tempo, esse contexto não significa que as etapas de notificações, compras, mensagens, upload de mídia ou MySQL já estejam implementadas. Esses domínios continuam fora do estado funcional atual, conforme a documentação do projeto.

---

## Síntese do ponto discutido

O problema levantado é que a Cypher já permite declarar uma identidade profissional, mas ainda não aplica essa identidade de maneira uniforme às capacidades da conta.

A categoria existe, mas nem sempre tem efeito prático.

O evento pode aparecer na interface, mas pode ser apenas demonstrativo.

O interesse pode ser salvo, mas pode não representar uma inscrição em uma oportunidade real.

O Banco de Beats pode existir e funcionar, mas ainda não está condicionado ao cargo relacionado à produção de Beats.

O organizador já possui uma permissão mais clara, mas os demais cargos ainda não estão oficialmente conectados aos módulos correspondentes.

Em termos de domínio, a Cypher está entre uma plataforma de apresentação e uma plataforma operacional. Ela já possui partes persistentes e reais, mas ainda mistura essas partes com fixtures e regras demonstrativas. A oficialização dos cargos, a coerência das permissões e a distinção entre ações reais e demonstrativas são necessárias para que o que o usuário informa no cadastro corresponda ao que ele efetivamente pode fazer e ao significado dos dados que a plataforma salva.

Este documento é apenas uma contextualização do problema e do estado atual. Ele não solicita, por si só, qualquer alteração no código, no banco, nas rotas ou na interface.

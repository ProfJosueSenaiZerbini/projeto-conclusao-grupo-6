# PROMPT DE IMPLEMENTAÇÃO — CATEGORIAS PROFISSIONAIS E VERTENTES MUSICAIS NO CYPHER

## Missão

Implemente no projeto Cypher uma reorganização transversal da seleção e apresentação das profissões por grupos de atuação, incluindo vertentes musicais para Rapper, MC e Freestyler. A mudança deve funcionar de ponta a ponta: seleção, validação, persistência, leitura, edição, apresentação, busca e filtros onde aplicável.

**Não faça apenas uma reformulação visual.** Antes de alterar qualquer arquivo, investigue a implementação existente, identifique dependências e apresente um plano curto. Depois implemente em etapas, sem perder dados, permissões ou comportamento atual.

## 1. Contexto técnico e regras invioláveis

O Cypher é uma plataforma profissional para a cena underground do rap. O stack observado é Node.js, TypeScript, Express, EJS, SQLite com `better-sqlite3`, arquitetura MVC, JavaScript vanilla e CSS modular, com temas claro e escuro. O projeto utiliza migrações aditivas versionadas; confirme o número do schema diretamente no código antes de escolher a versão da migração. Não presuma que documentação antiga ou este prompt tenha precedência sobre o código executável para detalhes técnicos.

Leia primeiro `README.md`, `ESCOPO-ATUALIZADO-CYPHER.md`, `package.json`, o model do banco, migrações, rotas/controllers/models/validators, views/partials, CSS/JS e testes relevantes. Busque todas as referências aos valores de categoria nos módulos, scripts, dados iniciais, filtros e regras de autorização; não limite a análise às telas de cadastro e edição.

Preserve integralmente:

- a stack, arquitetura MVC simples, dados existentes e integrações atuais;
- políticas de privacidade e filtros de perfil;
- cooldown de 60 dias para alteração de categorias, fluxo de exceção, snapshots e auditoria;
- salvamento independente das seções de perfil e ausência de perda de dados em falhas parciais;
- regras server-side que autorizam criar Beats, organizar eventos ou executar outras capacidades;
- governança administrativa de categorias/gêneros e histórico de decisões;
- identidade visual underground/Jamaica e os modos claro/escuro.

**Uma categoria ou grupo de atuação não é um cargo administrativo nem uma permissão.** Não conceda, remova ou altere capacidades como criar Beats ou eventos apenas porque os rótulos foram reorganizados. Mantenha as regras de autorização existentes e teste-as explicitamente.

Não use `REPLACE`, `INSERT OR REPLACE` nem qualquer mecanismo que apague e recrie registros para simular atualização/upsert. Não execute operação destrutiva nem remova valores antigos sem estratégia explícita e compatibilidade comprovada.

## 2. Escopo fechado: grupos e profissões

Implemente exatamente estes grupos e valores apresentados ao usuário. Não invente, acrescente, remova ou renomeie profissões sem justificativa técnica indispensável e aprovação explícita.

### Música
- Rapper
- MC
- Compositor(a)
- Letrista
- Beatmaker
- Produtor(a)
- DJ
- Freestyler

### Dança
- B-boy / B-girl
- Dançarino(a)
- Coreógrafo(a)

### Artes visuais
- Grafiteiro(a)
- Ilustrador(a)
- Designer gráfico
- Muralista
- Artista digital

### Audiovisual
- Fotógrafo(a)
- Videomaker
- Diretor(a) audiovisual
- Editor(a) de vídeo

### Produção técnica
- Engenheiro(a) de áudio
- Mixador(a)
- Masterizador(a)

### Gestão e produção
- Empresário(a)
- Manager
- Produtor(a) cultural
- Produtor(a) executivo(a)
- Organizador(a) de eventos

### Comunicação e cultura
- Criador(a) de conteúdo
- Jornalista cultural
- Podcaster
- Crítico(a) musical
- Social media
- Educador(a)
- Pesquisador(a) cultural
- Articulador(a) cultural

Grupos são uma organização da interface e do catálogo; não os converta automaticamente em categorias que concedam direitos no servidor. A pessoa pode escolher várias profissões, inclusive em grupos diferentes.

## 3. Escopo fechado: vertentes musicais

Somente as profissões **Rapper**, **MC** e **Freestyler** habilitam a seleção de vertentes abaixo. Permitir múltipla seleção. Exibir uma única seleção compartilhada, mesmo que mais de uma das três profissões esteja ativa.

Lista exata, sem novas opções nesta implementação:

1. Boom bap
2. Gangsta rap
3. G-Funk
4. R&B
5. Gospel
6. Jazz rap
7. Trap
8. Grime
9. Drill
10. Plug
11. PluggnB
12. Rage
13. Melodic rap
14. Detroit rap
15. Jersey Club Rap
16. Trap soul

O gênero musical do perfil e o gênero de uma obra são conceitos existentes e distintos. Não reutilize ou sobrescreva automaticamente os gêneros da obra para armazenar vertentes profissionais. Inspecione o modelo atual e escolha persistência compatível que mantenha esse significado separado.

## 4. Comportamentos de interface

Aplicar a seleção agrupada ao cadastro e à edição de perfil. A mesma estrutura de dados deve alimentar visualização do perfil próprio, perfil público e demais componentes que exibam profissões; busca/filtros devem ser atualizados quando dependam desses valores.

A interface deve:

1. Exibir os sete grupos de forma organizada e compreensível.
2. Permitir expandir/recolher um grupo sem perder seleções.
3. Permitir selecionar/desselecionar profissões individualmente e de vários grupos.
4. Manter seleção anterior carregada ao editar e após falha de validação.
5. Mostrar as vertentes quando pelo menos uma entre Rapper/MC/Freestyler estiver selecionada.
6. Ocultar/mostrar a seleção contextual sem duplicá-la e sem perder escolhas durante interações que ainda mantenham uma profissão elegível.
7. Oferecer rótulos, foco, teclado, estados e feedback acessíveis, sem depender somente de cor ou de JavaScript para tornar os campos compreensíveis.
8. Funcionar em desktop, tablet e celular, nos temas claro e escuro, usando tokens, partials e padrões existentes.

Não torne o formulário excessivamente longo ou carregado. Reutilize composição EJS e estilos existentes quando apropriado; evite duplicação de blocos de interface e regras CSS.

## 5. Regras de dados e transições

Antes de escolher a estratégia de armazenamento, documente como as categorias atuais estão representadas (strings, IDs, catálogo aprovado, arrays/JSON, tabelas relacionais ou combinação) e quais componentes consomem cada valor.

Use identificadores estáveis no domínio/persistência quando compatível com o projeto. Rótulos apresentados na interface podem ser formatados separadamente. Não dependa de comparação frágil por maiúsculas, acentos, pontuação ou rótulo de apresentação quando uma chave estável puder ser usada.

Para seleção de vertentes:

- Validar no servidor que toda vertente recebida pertence à lista permitida.
- Se ao menos uma das profissões elegíveis estiver selecionada, permitir persistir zero ou mais vertentes válidas.
- Se todas as profissões elegíveis forem removidas, não exibir nem considerar as vertentes ativas para filtragem/perfil profissional. **Não apagar silenciosamente o histórico escolhido**: primeiro determine a melhor representação compatível; prefira manter os dados preservados, porém inativos enquanto não houver profissão elegível, ou apresente uma política explícita sem perda irreversível. Documente o comportamento e teste a reativação quando a profissão elegível for selecionada novamente.
- Se uma entre várias profissões elegíveis for desmarcada e outra continuar selecionada, manter as vertentes já escolhidas.
- Remoções e seleções devem ser salvas pelo mesmo fluxo seguro de perfil já existente, respeitando o cooldown apenas onde a regra atual o exigir. Não criar uma forma de contornar o cooldown por meio do novo componente.

### Compatibilidade dos valores existentes

Investigue valores atuais, categorias propostas aprovadas e qualquer categoria customizada já armazenada. Defina e implemente compatibilidade sem apagar informações:

- Criar tabela de mapeamento auditável para qualquer renomeação/conversão necessária; não assumir equivalência semântica entre nomes apenas parecidos.
- Preservar valores sem mapeamento seguro como legado consultável ou tratá-los com mecanismo compatível, sem excluí-los silenciosamente.
- Não remover propostas, decisões administrativas, histórico ou IDs usados por relações existentes.
- Garantir que customizações aprovadas não concedam capacidades operacionais novas e que possam continuar sendo apresentadas/consultadas conforme regras atuais.
- Migração, se necessária, deve ser aditiva, transacional, idempotente, preservar relações e ter teste de banco novo, banco legado e repetição.
- Se não houver migração necessária, justificar como o formato atual comporta a nova organização e provar isso com testes.

Antes de executar uma migração ou de resolver conflitos entre grupos/categorias, documente a decisão técnica e o tratamento dos casos sem mapeamento. Não invente dados ou faça fallback que esconda erro.

## 6. Validação, segurança e autorização

- Validar categorias e vertentes no servidor por allowlist/catálogo e estado autorizado; validação no navegador é apenas conveniência.
- Rejeitar ou normalizar de forma explícita entradas duplicadas, tipos inesperados, valores vazios e payloads excessivos.
- Não confiar em grupo/profissão enviados pelo cliente para conceder autorização.
- Manter proteção CSRF, autenticação, validação, consultas parametrizadas e tratamento de erros já usados pelo sistema.
- Impedir que interfaces de perfil público exponham dados privados; usar as políticas atuais para carregar categorias e vertentes.
- Não interromper atualização de dados pessoais ou demais seções caso a alteração de categorias falhe, respeitando o padrão atual de salvamento independente.

## 7. Processo obrigatório de trabalho

### Etapa A — auditoria e plano (antes das mudanças)

Mapeie e reporte:

- schema, armazenamento atual e todas as categorias/valores existentes;
- formulários de cadastro/edição e consumidores em perfis, busca, filtros, permissões, eventos, Beats e administração;
- testes existentes e cobertura ausente;
- caminho de migração e compatibilidade com valores atuais/customizados;
- arquivos a modificar, riscos e sequência de execução.

Não faça alterações destrutivas. Se o código revelar contradição relevante não resolvida por este prompt, explique o caso e escolha a alternativa segura que preserve dados e permissões; não tome decisão irreversível silenciosamente.

### Etapa B — implementação incremental

Implemente em pequenas unidades: catálogo/grupos e chaves; persistência/migração quando necessária; validação de servidor; cadastro; edição; perfis; busca/filtros; testes; documentação. Após cada unidade, execute a verificação apropriada antes de seguir.

Mantenha MVC e as tecnologias existentes. Não acrescente dependências, não reescreva pastas, não substitua o sistema atual por um framework de formulários nem crie camadas abstratas sem necessidade demonstrada.

### Etapa C — documentação e entrega

Registre a mudança em **um relatório incremental individual**, seguindo a numeração e o padrão já existente em `relatorios-incrementacao/`. Atualize documentação pertinente e gere ZIP completo atualizado após a mudança significativa, incluindo fonte, build e documentação. Exclua `node_modules`, `.env`, credenciais, banco local e dados de usuários.

## 8. Testes obrigatórios

Acrescente ou adapte testes no padrão do projeto e execute a compilação e as suítes existentes. No mínimo, provar:

### Catálogo e interação
- Presença exata dos sete grupos, das 36 profissões listadas e das 16 vertentes, sem opções acidentais.
- Seleção múltipla em grupos distintos, expandir/recolher sem perda, edição pre-populada e recuperação dos valores após erro de validação.
- Vertentes aparecem para Rapper, MC ou Freestyler, em uma única área; não aparecem para outras profissões.
- Remover uma profissão elegível mantendo outra não apaga as vertentes; remover a última desativa a exibição/filtro conforme a regra documentada, preservando os dados e permitindo reativação.

### Persistência e migração
- Cadastro, edição, leitura posterior e perfil público/privado recuperam os valores corretos.
- Validação recusa profissão/vertente não permitida no servidor e impede estados incompatíveis.
- Banco novo, migração de banco legado e repetição são seguras; dados sem mapeamento, categorias customizadas, histórico de propostas e permissões permanecem preservados.
- Nenhuma migração ou caminho de gravação apaga e recria registros para simular atualização.

### Regressão e autorização
- Regras que dependem de `Beatmaker` e `Organizador de eventos` continuam iguais; categorias comuns, customizadas e vertentes não concedem permissões indevidas.
- Cooldown de 60 dias, exceções, snapshots/auditoria e salvamento independente mantêm seu comportamento.
- Busca/filtros não incluem informação privada, não tratam vertente como gênero de obra e lidam com dados legados.
- Perfil público, perfil próprio, modo claro/escuro e layouts responsivos continuam coerentes.

Use os scripts reais identificados no `package.json`; não declare suíte executada se não a tiver executado. Se algum teste falhar, reporte a falha, causa provável e arquivos afetados; não esconda falhas nem reduza testes para obter sucesso.

## 9. Critérios de aceite

A tarefa só está concluída quando:

1. Os grupos e profissões definidos neste prompt estão organizados no cadastro e edição.
2. É possível selecionar múltiplas profissões de grupos diferentes.
3. Apenas Rapper, MC e Freestyler habilitam a seleção única compartilhada de vertentes.
4. Vertentes e profissões são validadas no servidor, persistidas e recuperadas corretamente.
5. Perfil próprio, perfil público, busca e filtros exibem/usam os dados de maneira coerente com privacidade.
6. Valores existentes, categorias customizadas, histórico administrativo e permissões foram preservados ou compatibilizados sem perda silenciosa.
7. A alteração não contorna cooldown, exceções, auditoria ou salvamento independente.
8. Não há regressões comprovadas nas rotas e capacidades existentes; testes e build foram executados e resultados reportados.
9. Interface é responsiva, acessível nos fluxos fundamentais e consistente em tema claro/escuro.
10. O relatório incremental individual e o ZIP atualizado estão entregues.

## 10. Relatório de conclusão esperado

Ao terminar, informe de forma verificável:

- resumo do que mudou e o que ficou fora do escopo;
- estratégia de identificadores, persistência e compatibilidade de dados legados;
- se houve migração, sua versão, operação e garantias;
- áreas/telas/rotas/controllers/models/validators/estilos/scripts afetados;
- validações e testes executados, com resultado exato;
- confirmações de preservação de cooldown, exceções, auditoria, privacidade e permissões;
- limitações conhecidas e decisões que ainda exigem equipe;
- caminho do relatório incremental e link/caminho do ZIP completo.

Não declare “100% sem erros” apenas porque a compilação passou. Diferencie testes executados, inspeção estática e comportamentos não cobertos.

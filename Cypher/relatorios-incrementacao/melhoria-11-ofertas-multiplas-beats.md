# Melhoria 11 — Ofertas múltiplas de licença para Beats

**Data:** 15 de outubro de 2026  
**Escopo:** persistência, cadastro, edição e visualização de ofertas de licença no domínio Beats.

## Objetivo

Permitir que um beatmaker cadastre mais de uma oferta para o mesmo Beat, com preço opcional e descrição própria por oferta. A melhoria mantém a licença principal já existente para compatibilidade e adiciona uma estrutura normalizada para as opções comerciais.

## Alterações realizadas

### Persistência — `src/app/models/bancoDados.ts`

- Mantida a tabela `ofertas_beats`, relacionada a `beats` por chave estrangeira com exclusão em cascata.
- Ofertas ativas são carregadas junto com a listagem e o detalhe do Beat.
- O preço é convertido para centavos inteiros; campo vazio representa preço sob consulta (`NULL`).
- Criação e atualização do Beat e suas ofertas ocorrem na mesma transação.
- Atualizações removem as ofertas anteriores e inserem a lista atual, evitando ofertas órfãs ou duplicadas.
- A inicialização cria uma oferta legada para Beats existentes que ainda não possuam ofertas, usando a licença e as condições antigas.

### Controller — `src/app/controllers/controladorBeats.ts`

- O request aceita listas `ofertaTipo`, `ofertaPreco` e `ofertaDescricao`.
- A lista é normalizada para o tipo estrito `DadosOfertaBeat[]`.
- Tipos permitidos: `Não informado`, `Licença básica`, `Licença premium` e `Exclusiva`.
- Preços aceitam formato inteiro ou decimal com ponto/vírgula, sem permitir valores negativos ou texto arbitrário.
- Ao editar, as ofertas persistidas são convertidas de volta para valores exibíveis no formulário.

### Interface — `views/pages/cadastro-beat.ejs`

- Nova seção “Ofertas de licença” com uma oferta inicial.
- Botão “Adicionar oferta” cria novos cartões sem recarregar a página.
- Botão “Remover” permite excluir ofertas adicionais e mantém pelo menos uma linha.
- O formulário preserva os valores submetidos quando há erro de validação.

### Catálogo e detalhe

- `views/pages/banco-beats.ejs` envia as ofertas do Beat ao modal de detalhe.
- `public/js/interacoes.js` renderiza tipo, preço e descrição usando `textContent`, evitando injeção de HTML.
- Preços são exibidos em reais; ofertas sem preço aparecem como “Preço sob consulta”.
- `public/css/cadastro-obra.css` recebeu estilos para cartões de oferta e itens de detalhe, com comportamento responsivo herdado do formulário.

### Documentação

- `ANALISE-PROJETO.md` foi atualizado para refletir a tabela, a migração legada e o novo estado do pacote.

## Compatibilidade e decisões

- Não foram alteradas rotas, métodos HTTP, sessões ou regras de autorização.
- A licença principal antiga continua sendo mantida no registro do Beat.
- O pagamento, checkout e upload de áudio continuam fora do escopo desta etapa.
- Ofertas são armazenadas em centavos para evitar imprecisão de ponto flutuante.

## Verificações executadas

- `npm run format` — concluído.
- `npm run check` — concluído sem erros TypeScript.
- `npm run format:views` — concluído.
- `npm run build` — concluído.
- Smoke test HTTP — servidor iniciou em `http://localhost:3000`; rotas protegidas responderam conforme o middleware de autenticação.
- Verificação de diff — não aplicável, pois o diretório herdado não contém metadados Git.

## Pendências deliberadas

- Não foi implementado pagamento, negociação ou contratação dentro da plataforma.
- Não foi implementado upload/streaming de áudio.
- Não foi criado teste automatizado de integração com banco; a validação desta etapa foi feita por compilação, inicialização da aplicação e inspeção das rotas protegidas.

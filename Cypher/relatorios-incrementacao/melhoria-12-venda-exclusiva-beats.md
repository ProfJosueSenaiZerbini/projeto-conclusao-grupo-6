# Melhoria 12 — Venda exclusiva de Beats

**Data:** 15 de outubro de 2026  
**Escopo:** permitir que o beatmaker marque um Beat como destinado à venda exclusiva, mantendo a regra preparada para o futuro fluxo de compra.

## Resultado

O cadastro e a edição agora possuem a opção **“Este Beat será vendido com exclusividade”**. Quando ativada, o servidor exige exatamente uma oferta do tipo `Exclusiva`. A oferta exclusiva é armazenada junto ao Beat e o catálogo exibe um selo próprio para diferenciar o produto.

A regra é validada no servidor, portanto não depende apenas do JavaScript do navegador. No formulário, a ativação do modo exclusivo força a primeira oferta para o tipo `Exclusiva`, remove ofertas adicionais da interface e oculta o botão de adicionar novas ofertas.

## Persistência

O schema passou para a versão 6 e recebeu a coluna `beats.venda_exclusiva`, com valor inteiro `0` ou `1` e padrão `0`. A migração também verifica diretamente a existência da coluna para corrigir bancos que tenham registrado a versão do schema sem aplicar a alteração estrutural.

A criação e a atualização persistem o sinalizador na mesma transação das ofertas. No model, mesmo que uma chamada interna envie dados inconsistentes, quando o Beat é exclusivo somente a primeira oferta do tipo `Exclusiva` é salva.

## Interface

A página `cadastro-beat.ejs` recebeu o controle de exclusividade e uma explicação de que a compra e o checkout serão conectados em etapa própria. A página `banco-beats.ejs` exibe o selo **VENDA EXCLUSIVA** no card e no detalhe do Beat. O JavaScript do modal também informa essa característica sem inserir HTML vindo dos dados.

## Limites desta etapa

A plataforma ainda não possui checkout, pagamento, reserva ou registro de compra. Portanto, esta etapa implementa a classificação persistente e a restrição de ofertas do Beat exclusivo, mas ainda não pode alterar a disponibilidade após uma compra real. Na etapa de compra, será necessário registrar comprador, oferta, valor, status e data, além de encerrar as ofertas quando a transação exclusiva for confirmada.

## Verificações

Foram executados `npm run format`, `npm run check`, `npm run format:views` e `npm run build`, todos concluídos sem erros. A aplicação reiniciou em `http://localhost:3000`, e a migração foi confirmada diretamente no SQLite com `user_version = 6` e a coluna `venda_exclusiva` presente na tabela `beats`.

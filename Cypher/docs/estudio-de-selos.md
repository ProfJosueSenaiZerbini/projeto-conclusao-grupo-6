# Estúdio de Selos Profissionais

## Uso
Acesse **Meu perfil → Editar perfil → Selo profissional**. Os modos Simplificado e Avançado compartilham a mesma composição. O rascunho é privado; somente **Publicar selo**, com confirmação, altera o perfil e os créditos. O histórico de versões publicadas é separado de Desfazer/Refazer. Restaurar uma versão abre uma cópia em edição.

A edição segue cinco etapas, sem travar a navegação. Use o menu numerado para pular diretamente ou os botões de voltar e avançar. Ao voltar a uma etapa, sua composição e a última ferramenta usada nela são preservadas, respeitando o modo ativo.

1. **Base:** modelos, forma e cores; no avançado, fundo e contornos.
2. **Elementos:** monograma e biblioteca de símbolos; no avançado, texto complementar, ornamentos e marcas próprias.
3. **Composição:** arranjos predefinidos e, no avançado, organização e ajustes das camadas. Aparência (cores, traço e efeitos) fica separada de posição e tamanho.
4. **Acabamento:** texturas e efeitos do selo inteiro, sem confundir com o acabamento de uma camada.
5. **Revisão:** confira a legibilidade, consulte versões anteriores e publique. Publicação aparece nesta etapa; salvar rascunho continua disponível em todas.

No desktop, a prévia acompanha o painel de edição. Em telas estreitas, a miniatura acompanha a edição. **Prévia** abre a visualização ampliada, com um caminho de volta ao painel. **Etapas** volta ao menu mesmo depois de descer numa lista longa.

- **Simplificado:** 13 modelos editáveis, composição em branco, nove formas, monograma, símbolos, paletas, acabamentos, distribuições e sorteio.
- **Avançado:** dimensões e margem da forma, cores livres, degradê linear/radial, dois contornos independentes, texturas, textos curvos, ornamentos, guias, arraste, controles numéricos e até 12 camadas. As camadas têm nome, ordem, visibilidade, bloqueio, duplicação e opção de aparecer na versão compacta.
- **Prévia:** zoom e fundos não alteram o selo; há comparação com a publicação, simulação de perfil, amostras de 16 a 96 px e avisos de legibilidade. A área pública recebe somente as camadas visíveis da composição compacta e não carrega as ferramentas de edição.
- **Marcas:** PNG e JPEG, até 64 KB e 2.048 × 2.048 px. Uma imagem em análise pode ser usada no rascunho; publicar exige aprovação. Aprovar uma imagem enviada pelo Estúdio não troca o selo ativo. Recorte por enquadramento, espelhamento e monocromático são não destrutivos.

## Biblioteca de símbolos
- 90 desenhos SVG autorais em 11 categorias: Música, Arte, Cultura urbana, Natureza, Fauna, Universo, Geometria, Abstração, Identidade, Indústria e Ornamentação. São dez estilos catalogados (da linha minimalista ao stencil, gótico e underground), sem restrição por profissão.
- Interpretações como Vinil de corte e Sulco de vinil partem do mesmo motivo, mas usam silhuetas e vazios diferentes. A busca não exige acentos; a opção **Variações** leva aos desenhos do mesmo motivo. Cada cartão desenha exatamente o mesmo traçado usado no selo.
- **Favoritos** e os 20 **Recentes** são guardados neste navegador, separados por conta local. Não há sincronização entre dispositivos.
- Cada inserção cria sua própria camada. **Trocar desenho** preserva as propriedades da camada; preenchimento, cor, traço, espessura, textura, acabamento, posição, escala, rotação, opacidade, espelhamento e sobreposição são independentes.
- O catálogo único é `public/js/selo-vetores.json`. Cada entrada tem identificador estável, nome, categoria, estilo, família, palavras-chave, traçado e caixa aferida em SVG; `selo-vetores.js` normaliza o desenho para centralizar e escalar miniaturas e selos. O backend consulta o mesmo catálogo para validar o identificador; nem o rascunho nem a API recebem SVG arbitrário.
- O formato existente é compatível: camadas sem os campos novos abrem com preenchimento ligado, sem textura e com acabamento fosco. A atualização não exige migração nova.

## Decisões técnicas
- Estado único no navegador. Alterações contínuas entram no histórico como uma operação; até 60 operações em memória. Nenhuma requisição é feita só por movimentar um controle.
- A casca usa a geometria CSS compartilhada das nove formas; as camadas usam SVG nativo e identificadores isolados. O mesmo renderizador é usado no editor, nas amostras e nas assinaturas públicas.
- Migração SQLite **44**: adiciona a composição JSON versionada e um rascunho por autor; usa os registros de selo existentes como histórico e vincula os recursos autorizados às versões. A substituição do selo ativo, o vínculo de imagens e a limpeza do rascunho são transacionais. O editor mostra até 25 versões; registros anteriores não são apagados.
- Nenhum dado precisou ser apagado. Os selos sem composição continuam na renderização anterior até serem substituídos. As funções de moderação e a regra de um selo ativo por profissional foram preservadas.
- A API verifica sessão, tipo de conta, origem/CSRF, propriedades e seus limites, propriedade da imagem e aprovação antes de publicar. Imagens externas não são usadas diretamente: são enviadas à aplicação e servidas por rota com autorização. SVG externo não é aceito.

## Arquivos
- **Interface:** `views/partials/componentes/perfil-editor-selo.ejs`, `selo-assinatura.ejs`, `editar-perfil-secoes.ejs`, `views/partials/fim-pagina.ejs` e `views/pages/creditos-selos.ejs`.
- **Frontend:** `public/js/selo-estado.js`, `selo-render.js`, `selo-estudio.js`, `selo-publico.js`; estilos em `public/css/selo-estudio.css` e `componentes.css`.
- **Backend:** `src/app/models/composicaoSelo.ts`, `seloPerfil.ts`, `validarImagemSelo.ts` e `bancoDados.ts`; `controladorMidiasRepresentacao.ts`, `controladorCompatibilidade.ts` e as rotas de mídias, representação, créditos e selos.
- **Testes:** `scripts/testar-identidade-http.mjs`, `testar-banco.mjs` e `testar-estudio-navegador.mjs`.

## Verificação executada
- `npm run build` e `git diff --check`.
- `node scripts/testar-identidade-http.mjs`: modelos válidos, rejeição de dados fora dos limites, histórico de edição e invalidação do refazer, privacidade do rascunho, publicação idempotente, validação de CSRF e tipo de conta, recursos de terceiros bloqueados e fluxo de aprovação de marca.
- `node scripts/testar-banco.mjs`, `testar-politicas-perfil.mjs` e `testar-rotas.mjs`: migração, integridade e regressões de perfil e rotas.
- `node scripts/testar-estudio-navegador.mjs`: Edge 1440 × 900 e emulação de toque 390 × 844. Conferência dos dois temas sem extrapolar a largura, 72 trocas direcionais por resolução, alteração de camadas por arraste, desfazer/refazer, troca de modo, salvamento/reabertura de rascunho e publicação compacta no perfil. O ensaio usa banco temporário e não altera dados do ambiente de desenvolvimento.

O ensaio de navegação também valida a ordem das cinco etapas, ida e volta entre Base e Camadas sem perder a transformação, separação entre revisão e edição, atalhos mobile e foco visível ao usar Tab num viewport de 320 px.

O ensaio da biblioteca confere todos os limites vetoriais e a centralização, compara pares de desenhos em monocromia a 16 px e verifica duas camadas com o mesmo vetor, efeitos diferentes e reordenação antes e depois da publicação.

## Limites
Curvatura de texto usa arcos ajustáveis, não trajetórias desenhadas livremente. Redimensionamento, rotação e enquadramento têm controles de precisão, não alças no canvas. A biblioteca usa fontes de interface e do sistema, portanto as fontes de fallback podem variar entre sistemas. Não há edição interna de imagens rasterizadas, agrupamento de camadas, nem importação de SVG/WebP. Não foi realizado um benchmark prolongado em aparelhos físicos de baixo desempenho.

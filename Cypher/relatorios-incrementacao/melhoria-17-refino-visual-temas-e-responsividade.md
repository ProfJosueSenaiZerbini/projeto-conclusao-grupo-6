

## Auditoria complementar de contraste — v18

A primeira rodada resolveu a adaptação do sidebar, mas não cobria todos os contrastes dos prints. Nesta segunda rodada foram corrigidos os pontos restantes: `detail-kicker` e banners lime agora usam texto escuro; ações outline dos drawers ganharam borda e texto claros no tema escuro; o índice ativo de configurações não usa mais texto claro sobre lime; textos secundários, badges, licenças e links dos cards de beats foram reforçados; o resumo de obras em andamento recebeu watermark mais visível; o cartão lime do perfil passou a usar texto escuro explícito; e os botões “Ver perfil” receberam borda e estado hover distinguível.

Também foram corrigidos os campos do cadastro de beat em tema escuro. Inputs, selects, textareas, blocos de oferta, opções de tipo, avisos e caixas de crédito agora usam superfícies escuras com bordas e placeholders legíveis, sem os retângulos brancos mostrados no print. Na tela de oportunidades, o banner de detalhe e o aviso de interesse passaram a manter contraste consistente no tema escuro.

A estrutura original do drawer de beats foi preservada. O JavaScript continua usando os mesmos atributos `data-beat-*`, incluindo `data-beat-ofertas-detail`; somente os rótulos acessíveis e o badge demonstrativo foram ajustados.

# Registro de validação visual

A primeira abertura no domínio temporário foi bloqueada pelo Vite porque o host proxied ainda não estava em `server.allowedHosts`. Foi criada a configuração `vite.config.js` com `host: '0.0.0.0'` e `allowedHosts: true`; o servidor precisa ser reiniciado para carregar essa configuração antes de repetir a validação visual.

## Teste de login e Modo Fantasma

A tela de login foi renderizada corretamente com os campos de usuário, senha, credencial demonstrativa e botão do Modo Fantasma. O Modo Fantasma abriu `#/explorar` sem exigir cadastro, exibindo navegação pública para Beats, Eventos e Conhecimento. O retorno ao login também funcionou por navegação hash.

## Teste de login demonstrativo

A conta `lianoise` com a senha `cypher123` foi aceita pelo Controller frontend. O protótipo gravou somente o estado temporário da sessão no navegador e redirecionou para `#/dashboard`, exibindo a navegação autenticada, obras, perfil e cartões de demonstração.

## Teste de módulos do ecossistema

A tela `#/beats` renderizou quatro cards com gênero, BPM, tom, disponibilidade, filtros e player demonstrativo. A tela `#/eventos` renderizou agenda com três eventos, três oportunidades, metadados, interessados e ações visuais de interesse/candidatura. Nenhuma dessas ações envia dados.

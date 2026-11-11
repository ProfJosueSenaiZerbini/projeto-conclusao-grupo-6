# Melhoria 45 — Questionários contextuais por profissão

## Escopo executado

A etapa 6 substituiu o questionário genérico anterior por um contrato único e centralizado para as 36 profissões do catálogo. Cada profissão possui exatamente quatro perguntas, uma para cada eixo obrigatório:

1. tempo de atuação;
2. etapa dos projetos atuais;
3. participação coletiva/apresentações;
4. atividade prática na área.

As perguntas são geradas por ID estável de profissão e recebem contexto textual próprio, sem campos extras, perguntas condicionais, entrevista extensa ou mistura entre profissões.

## Contrato e validação

`src/app/models/questionarioAtuacao.ts` agora fornece:

- `QUESTIONARIOS_PROFISSIONAIS`;
- `catalogoPerguntasPorProfissao(profissaoId)`;
- `idProfissaoPorCategoria(categoria)`;
- `validarRespostasAtuacao(profissaoId, respostas, obrigatorias)`;
- rótulos centralizados das opções;
- compatibilidade de leitura para os antigos rótulos `Compositor`, `Empresário` e `Organizador de eventos`, sem criar IDs duplicados.

A validação rejeita profissão inexistente, campo de outra profissão, tipo incorreto e opção fora da allowlist. As alternativas incluem início, ausência de projeto, desenvolvimento, conclusão sem publicação, publicação, experiência anterior pausada, aprendizado e ausência de prática, permitindo respostas honestas de iniciantes.

## Persistência

O schema foi atualizado para a versão 20 com a tabela `respostas_atuacao_profissao`, cuja chave é `(usuario_id, profissao_id)`. Respostas e visibilidades são salvas e lidas por ID de profissão, preservando a tabela legada `respostas_atuacao_categoria` para compatibilidade de leitura e fluxos existentes. A gravação integrada materializa a resposta canônica por profissão quando o rótulo possui correspondência no catálogo.

A tabela não recebe backfill automático em banco novo nem cria respostas sem ação do usuário. A integridade referencial usa `usuario_id` com exclusão em cascata, e o upsert é feito por atualização conflitual explícita, sem `REPLACE`.

## Interface e limite desta etapa

O componente existente de questionários continua renderizando os quatro campos e o JavaScript atual mantém a navegação sequencial, o progresso e a preservação de respostas. A expansão visual da tela de seleção para os sete grupos e a reorganização completa do onboarding em quatro etapas permanecem para as fases 8 e 9, evitando misturar esta unidade de contrato/persistência com a próxima unidade de fluxo.

## Testes

- `npm run check` — passou.
- `npm run build` — passou.
- `npm run test:questionnaires` — passou: 36 profissões, quatro eixos por profissão, validação negativa e isolamento por ID.
- `npm run test:catalog` — passou: 7 grupos, 36 profissões e IDs estáveis.
- `npm run test:profile-relations` — passou.
- `npm run test:relations` — passou.
- `npm run test:db` — passou: schema v20, migrações, tabela nova vazia, integridade, idempotência e privacidade.
- `npm run test:admin-ui` — passou: cadastro, edição, respostas inválidas, privacidade, propostas, obras, eventos e permissões.

## Próxima etapa

A etapa seguinte deve concluir a validação server-side específica de payloads, ownership e salvamento independente, seguida pela reorganização do cadastro progressivo e da seleção dos sete grupos com todas as 36 profissões.

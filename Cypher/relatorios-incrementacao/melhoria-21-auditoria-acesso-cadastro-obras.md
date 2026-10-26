# Melhoria 21 — Auditoria de acesso ao cadastro de obras e Beats

## Brecha encontrada

Na página de Obras, o modal de seleção sempre mostrava a opção `Beat`. Para uma conta `Rapper / MC`, o link levava ao fluxo de cadastro do Banco de Beats. O formulário especializado não funcionava corretamente para essa conta, mas a opção permanecia visível e o acesso chegava a ser iniciado.

Também havia um contorno potencial no backend: uma requisição direta para `POST /works/new` com `tipo=Beat` poderia tentar tratar o Beat como uma obra genérica, em vez de usar o fluxo autorizado do Banco de Beats.

## Correções

A página de Obras agora recebe a capacidade calculada a partir das categorias do perfil. A opção Beat só é renderizada no modal quando a conta possui `Beatmaker`.

O controller de Obras passou a validar o tipo Beat em dois pontos:

- `GET /works/new?tipo=Beat` bloqueia contas sem `Beatmaker` e encaminha contas autorizadas ao fluxo `/beats/new`;
- `POST /works/new` nunca grava um Beat como obra genérica. Sem `Beatmaker`, redireciona com erro de permissão; com `Beatmaker`, encaminha ao cadastro especializado.

O cadastro especializado em `/beats/new` continua protegido no próprio controller, tanto no GET quanto no POST. Assim, a proteção não depende apenas da interface.

A página `/works` também passou a exibir a mensagem de permissão quando o acesso é bloqueado.

## Auditoria adicional

Foram revisados:

- modal e links de seleção de tipo;
- parâmetros `tipo` e slugs de URL;
- GET e POST de `/works/new`;
- GET e POST de `/beats/new`;
- edição e exclusão de Beats próprios;
- middleware de sessão;
- renderização condicional do botão de cadastro no Banco de Beats;
- armazenamento de Beats em tabela própria;
- possibilidade de criar obra genérica com tipo Beat.

A edição e exclusão de Beats próprios continuam disponíveis para evitar que a remoção posterior da categoria deixe dados reais órfãos. A criação de novos Beats permanece exclusiva de `Beatmaker`.

## Validações

Em banco temporário isolado:

- modal de Rapper/MC: zero links para `/beats/new`;
- modal de Beatmaker: um link para `/beats/new`;
- Rapper/MC em `GET /works/new?tipo=Beat`: redirecionamento para `/works?erro=permissao`;
- Rapper/MC em `POST /works/new` com `tipo=Beat`: redirecionamento para `/works?erro=permissao`;
- Beatmaker em `GET /works/new?tipo=Beat`: encaminhamento para `/beats/new`;
- nenhuma obra genérica do tipo Beat foi criada pelo contorno;
- `npm run check` passou;
- `npm run build` passou;
- `node --check public/js/interacoes.js` passou.

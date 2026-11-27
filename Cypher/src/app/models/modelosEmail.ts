import { validarEmail } from "../validators/validarAutenticacao.js";

type Bloco = readonly ["texto" | "acao" | "link" | "destaque" | "nota" | "assinatura", string];
type Modelo = { assunto: string; categoria: string; titulo: string; blocos: readonly Bloco[] };

const modelos = {
  confirmacao: {
    assunto: "Confirme seu e-mail | Cypher",
    categoria: "Segurança da conta",
    titulo: "Confirme seu e-mail.",
    blocos: [
      ["texto","Salve!"],
      ["texto","Sua identidade faz parte da Cypher. Para proteger sua conta, precisamos confirmar que este endereço pertence a você."],
      ["acao","Confirmar meu e-mail"],
      ["nota","O link é válido por 30 minutos e pode ser utilizado uma única vez."],
      ["texto","Caso o botão não funcione, copie e acesse o endereço abaixo pelo navegador:"],
      ["link",""],
      ["destaque","Não reconhece esta solicitação?"],
      ["texto","Ignore esta mensagem. Nenhuma alteração será realizada por este link sem sua confirmação."],
      ["texto","Seguimos juntos,\nEquipe Cypher."],
    ],
  },
  emailAlterado: {
    assunto: "Seu e-mail foi alterado | Cypher",
    categoria: "Segurança da conta",
    titulo: "Seu e-mail de acesso foi atualizado.",
    blocos: [
      ["texto","Salve!"],
      ["texto","O endereço de e-mail vinculado à sua conta na Cypher foi alterado com sucesso após a confirmação do novo endereço."],
      ["texto","A partir de agora, seu acesso à plataforma está vinculado ao novo e-mail."],
      ["texto","Caso tenha realizado essa alteração, nenhuma ação adicional é necessária."],
      ["destaque","Não reconhece essa alteração?"],
      ["texto","A segurança da sua identidade na Cypher é importante para nós. Caso não tenha autorizado essa mudança, entre em contato imediatamente com nossa equipe de suporte."],
      ["texto","Seguimos juntos,\nEquipe Cypher."],
    ],
  },
  recuperacao: {
    assunto: "Recupere seu acesso | Cypher",
    categoria: "Segurança da conta",
    titulo: "Vamos recuperar seu acesso.",
    blocos: [
      ["texto","Salve!"],
      ["texto","Recebemos uma solicitação para redefinir a senha da sua conta na Cypher."],
      ["texto","Para retomar seu acesso à plataforma com segurança, utilize o botão abaixo e defina uma nova senha."],
      ["acao","Redefinir minha senha"],
      ["nota","O link é válido por 30 minutos e pode ser utilizado uma única vez."],
      ["texto","Caso o botão não funcione, copie e acesse o endereço abaixo pelo navegador:"],
      ["link",""],
      ["destaque","Não solicitou a recuperação de senha?"],
      ["texto","Não se preocupe. Basta ignorar esta mensagem. Sua senha permanecerá a mesma e nenhuma alteração será realizada sem sua confirmação."],
      ["texto","Seguimos juntos,\nEquipe Cypher."],
    ],
  },
  senhaAlterada: {
    assunto: "Sua senha foi alterada | Cypher",
    categoria: "Segurança da conta",
    titulo: "Sua senha foi atualizada.",
    blocos: [
      ["texto","Salve!"],
      ["texto","A senha de acesso à sua conta na Cypher foi alterada com sucesso."],
      ["nota","Como medida de segurança, todas as sessões anteriores foram encerradas. Para acessar novamente a plataforma nesses dispositivos, utilize sua nova senha."],
      ["texto","Caso tenha realizado essa alteração, nenhuma ação adicional é necessária."],
      ["destaque","Não reconhece essa alteração?"],
      ["texto","Proteger sua identidade e sua trajetória na Cypher é fundamental."],
      ["texto","Caso não tenha autorizado essa mudança, solicite imediatamente a recuperação de acesso à sua conta e entre em contato com nossa equipe de suporte."],
      ["acao","Recuperar meu acesso"],
      ["texto","Seguimos juntos,\nEquipe Cypher."],
    ],
  },
  encerramento: {
    assunto: "Sua conta foi encerrada | Cypher",
    categoria: "Gestão da conta",
    titulo: "Seu ciclo na Cypher foi encerrado.",
    blocos: [
      ["texto","Salve!"],
      ["texto","Conforme solicitado, o encerramento da sua conta na Cypher foi concluído."],
      ["texto","Seu acesso à plataforma foi revogado, seu perfil foi desativado e seus dados pessoais de apresentação foram removidos."],
      ["texto","Em respeito à trajetória coletiva construída na plataforma, os registros compartilhados necessários à preservação de créditos profissionais, acordos, compras e direitos de terceiros serão mantidos com acesso restrito. Seu identificador de usuário permanecerá reservado."],
      ["destaque","Agradecemos por ter feito parte da Cypher."],
      ["texto","Cada pessoa que integra a cena contribui para sua construção. Esperamos que sua trajetória continue evoluindo, dentro ou fora da plataforma."],
      ["destaque","Não reconhece essa solicitação?"],
      ["texto","Entre em contato com nossa equipe de suporte para obter esclarecimentos."],
      ["texto","Respeitamos sua decisão e desejamos sucesso em seus próximos projetos."],
      ["assinatura","Equipe Cypher."],
    ],
  },
  boasVindasPublico: {
    assunto: "A cena também é sua. Bem-vindo à Cypher!",
    categoria: "Boas-vindas",
    titulo: "Chega mais. A Cypher é sua também.",
    blocos: [
      ["texto","Salve!"],
      ["texto","É bom ter você por aqui."],
      ["texto","A Cypher nasceu para dar espaço, visibilidade e novas possibilidades a quem constrói a cena independente do hip-hop. E isso inclui quem acompanha, escuta, prestigia e fortalece essa cultura."],
      ["texto","Por aqui, você pode descobrir novos artistas, conhecer seus trabalhos, explorar lançamentos, acompanhar eventos e se aproximar dos profissionais que movimentam a cena."],
      ["texto","Sabe aquele artista que você ainda não conhece, mas que merece estar na sua playlist? Ou aquela batalha que acontece perto de você e que nunca chegou ao seu conhecimento? A Cypher existe também para encurtar essas distâncias."],
      ["texto","Explore, conheça, compartilhe e valorize o que é produzido na cena. A cultura não se constrói apenas por quem faz arte, mas também por quem reconhece seu valor."],
      ["acao","Conhecer a Cypher"],
      ["texto","Nos vemos por aí."],
      ["assinatura","Equipe Cypher."],
    ],
  },
  boasVindasProfissional: {
    assunto: "Seu talento merece espaço. Bem-vindo à Cypher!",
    categoria: "Boas-vindas",
    titulo: "Sua arte, sua identidade, seu corre.",
    blocos: [
      ["texto","Salve!"],
      ["texto","É bom ter você fazendo parte da Cypher."],
      ["texto","Sabemos que viver de arte, conquistar reconhecimento e encontrar oportunidades na cena independente nem sempre é fácil. Foi dessa realidade que nasceu a Cypher."],
      ["texto","Criamos um espaço onde você pode apresentar seu trabalho, construir seu portfólio, conhecer outros profissionais, encontrar oportunidades e estabelecer colaborações. Um lugar para quem está começando e também para quem já tem uma caminhada na cultura hip-hop."],
      ["texto","Talvez você esteja procurando alguém para produzir seu próximo som, divulgar seu trabalho, integrar um projeto ou simplesmente encontrar pessoas que compartilham da mesma visão. Queremos facilitar esses encontros."],
      ["texto","Comece pelo seu perfil. Mostre quem você é, o que faz e o que já construiu. Não importa em qual momento da sua trajetória você esteja, existe espaço para o seu trabalho aqui."],
      ["acao","Construir meu perfil"],
      ["texto","Que daqui saiam bons encontros, grandes trabalhos e novas histórias."],
      ["texto","Seguimos juntos no corre."],
      ["assinatura","Equipe Cypher."],
    ],
  },
  conversao: {
    assunto: "Uma nova etapa do seu corre | Cypher",
    categoria: "Gestão da conta",
    titulo: "Agora, seu trabalho também tem espaço aqui.",
    blocos: [
      ["texto","Salve!"],
      ["texto","Até aqui, você conheceu a Cypher como parte do público. Agora, passa a ocupar esse espaço também como profissional da cena."],
      ["texto","Com essa mudança, você pode apresentar suas produções, construir seu portfólio, estabelecer parcerias, participar de oportunidades e compartilhar seus trabalhos de acordo com suas áreas de atuação."],
      ["texto","Seu perfil passa a ser também uma vitrine profissional. Cuide dele, valorize suas experiências e dê os devidos créditos a quem constrói junto com você."],
      ["texto","Aproveite esse momento para completar suas informações profissionais e mostrar à comunidade um pouco mais sobre o seu trabalho."],
      ["acao","Conhecer meu perfil profissional"],
      ["texto","Seja dando os primeiros passos ou trazendo uma caminhada de anos, esperamos que você encontre aqui pessoas e possibilidades que somem ao seu corre."],
      ["texto","Seguimos juntos."],
      ["assinatura","Equipe Cypher."],
    ],
  },
} satisfies Record<string, Modelo>;

export type TipoEmailCypher = keyof typeof modelos;

const escapar = (valor: string) => valor.replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
);
const interno: Partial<Record<TipoEmailCypher, string>> = {
  senhaAlterada: "/recuperar-senha",
  boasVindasPublico: "/descoberta",
  boasVindasProfissional: "/perfil",
  conversao: "/perfil",
};
const permiteSuporte = new Set<TipoEmailCypher>(["emailAlterado", "senhaAlterada", "encerramento"]);

function urlAcao(tipo: TipoEmailCypher, link?: string) {
  const rota = interno[tipo];
  if (!rota && !link) return;
  const url = rota
    ? new URL(rota, process.env.CYPHER_PUBLIC_ORIGIN ?? `http://localhost:${process.env.PORT ?? 3000}`)
    : new URL(link!);
  if (
    (url.protocol !== "https:" && (url.protocol !== "http:" || process.env.NODE_ENV === "production")) ||
    url.username || url.password
  ) throw new Error("URL de e-mail inválida.");
  return url.href;
}

export function montarEmailCypher(tipo: TipoEmailCypher, link?: string) {
  const { assunto, categoria, titulo, blocos } = modelos[tipo] as Modelo;
  const url = urlAcao(tipo, link);
  const temAcao = blocos.some(([papel]) => papel === "acao");
  if (temAcao && !url) throw new Error("Falta a URL deste e-mail.");

  const contato = process.env.CYPHER_SUPPORT_EMAIL?.trim();
  const suporte = permiteSuporte.has(tipo) && contato && !validarEmail(contato) ? contato : undefined;
  const rodape = categoria === "Segurança da conta"
    ? "Esta é uma mensagem automática de segurança da Cypher."
    : tipo === "encerramento"
      ? "Esta é uma mensagem automática referente à gestão da sua conta."
      : undefined;
  const ano = new Date().getUTCFullYear();
  const destaque = categoria === "Boas-vindas" || tipo === "conversao" ? "#c4d483" : "#f2cc68";
  const textoNormal = (valor: string) => escapar(valor).replace(/\n/g, "<br>");
  const href = escapar(url ?? "");
  const paragrafo = 'style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#ecebe4"';
  const htmlBlocos = blocos.map(([papel, valor]) => {
    switch (papel) {
      case "acao":
        return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 20px"><tr>
<td bgcolor="${destaque}" style="border-radius:4px;mso-padding-alt:13px 18px">
<a href="${href}" style="display:inline-block;padding:13px 18px;font-size:16px;font-weight:bold;color:#182014;text-decoration:none">${escapar(valor)}</a>
</td></tr></table>`;
      case "link":
        return `<p ${paragrafo}><a href="${href}" style="color:${destaque};text-decoration:underline;overflow-wrap:anywhere;word-break:break-all">${href}</a></p>`;
      case "nota":
        return `<p style="margin:0 0 16px;border-left:3px solid ${destaque};background:#262922;padding:10px 12px;color:#e0e1d5;font-size:14px;line-height:1.55">${textoNormal(valor)}</p>`;
      case "destaque":
        return `<p style="margin:22px 0 6px;border-top:1px solid #42463b;padding-top:14px;color:${destaque};font-size:15px;line-height:1.5"><strong>${textoNormal(valor)}</strong></p>`;
      case "assinatura":
        return `<p ${paragrafo}><strong>${textoNormal(valor)}</strong></p>`;
      default:
        return `<p ${paragrafo}>${textoNormal(valor)}</p>`;
    }
  }).join("\n");
  const text = [
    "CYPHER", categoria, titulo,
    ...blocos.flatMap(([papel, valor]) =>
      papel === "acao" ? [valor + (blocos.some(([p]) => p === "link") ? "" : ": " + url)] :
        papel === "link" ? [url!] : [valor]),
    ...(suporte ? ["Suporte da Cypher: " + suporte] : []),
    ["A cultura é coletiva.", "Conectando talentos. Fortalecendo a cena.", rodape,
      `© ${ano} Cypher. Todos os direitos reservados.`].filter(Boolean).join("\n"),
  ].join("\n\n");
  // A marca do cabeçalho do site é tipográfica. Aqui ela não depende de fonte ou imagem remota.
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapar(assunto)}</title></head>
<body style="margin:0;padding:0;background:#121410;color:#ecebe4;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#121410"><tr><td align="center" style="padding:20px 10px">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1d201a" style="max-width:600px;border:1px solid #42463b;border-top:5px solid ${destaque};text-align:left">
<tr><td style="padding:23px 24px;border-bottom:1px solid #42463b">
<span aria-hidden="true" style="display:inline-block;width:5px;height:13px;background:#c4d483;transform:skew(-24deg)"></span>
<span aria-hidden="true" style="display:inline-block;width:5px;height:20px;background:#f2cc68;transform:skew(-24deg)"></span>
<span aria-hidden="true" style="display:inline-block;width:5px;height:16px;background:#c4d483;transform:skew(-24deg)"></span>
<span style="margin-left:8px;font-family:'Arial Black',Arial,sans-serif;font-size:29px;font-weight:900;letter-spacing:-1px;color:#f5f1df">CYPHER</span>
</td></tr><tr><td style="padding:24px">
<p style="margin:0 0 8px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:${destaque}">${escapar(categoria)}</p>
<h1 style="margin:0 0 22px;color:#f5f1df;font-size:28px;line-height:1.18">${escapar(titulo)}</h1>
${htmlBlocos}
${suporte ? `<p ${paragrafo}>Suporte da Cypher: <a href="mailto:${encodeURIComponent(suporte).replace("%40", "@")}" style="color:${destaque}">${escapar(suporte)}</a></p>` : ""}
</td></tr><tr><td bgcolor="#181b15" style="padding:19px 24px;color:#d7d9cb;border-top:1px solid #42463b;font-size:13px;line-height:1.6">
<strong style="color:${destaque}">A cultura é coletiva.</strong><br>Conectando talentos. Fortalecendo a cena.<br>
${rodape ? escapar(rodape) + "<br>" : ""}
© ${ano} Cypher. Todos os direitos reservados.
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;
  return { assunto, text, html };
}

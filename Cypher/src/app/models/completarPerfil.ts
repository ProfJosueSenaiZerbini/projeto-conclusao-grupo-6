import {
  atualizarApresentacaoCypher,
  atualizarContatoProfissionalCypher,
  atualizarPerfilCypher,
  listarAtuacoesUsuarioCypher,
  listarCategoriasProfissionaisCypher,
  type UsuarioDaSessao,
  type DadosAtualizacaoPerfil,
} from "./bancoDados.js";
import { completudePerfil, localizacaoCompleta } from "./identidadeUsuario.js";
import { generosObra } from "./modeloCypher.js";
import {
  formatarRespostaAtuacao,
  perguntasCadastroProfissao,
} from "./questionarioAtuacao.js";
import {
  listaDeLinhas,
  validarApresentacaoPerfil,
} from "../validators/validarPerfil.js";

const generos = generosObra.filter(item => item !== "Outro");
const valorTexto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const opcoesTempo = (categoria: string) =>
  (perguntasCadastroProfissao(categoria)[0]?.opcoes || []).map(valor => ({
    valor,
    rotulo: formatarRespostaAtuacao(valor),
  }));
export class ErroCompletarPerfil extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export function etapasCompletarPerfil(usuario: UsuarioDaSessao) {
  const progresso = completudePerfil(usuario);
  const ordem = [
    "foto",
    "cidade",
    "biografia",
    "profissoes",
    "tempo",
    "competencias",
    "estilos",
    "contato",
  ];
  const etapas = [...progresso.pendencias]
    .sort(
      (a, b) =>
        ordem.indexOf(a.id.split(":")[0]) - ordem.indexOf(b.id.split(":")[0])
    )
    .map(({ id, rotulo }) => {
      const tipo = id.split(":")[0];
      const categoria = id.slice("tempo:".length);
      return {
        id,
        tipo,
        rotulo,
        valor: tipo === "cidade" ? usuario.city : "",
        opcoes:
          tipo === "tempo"
            ? opcoesTempo(categoria)
            : tipo === "estilos"
              ? generos.map(valor => ({ valor, rotulo: valor }))
              : tipo === "profissoes"
                ? listarCategoriasProfissionaisCypher().map(
                    (valor: string) => ({
                      valor,
                      rotulo: valor,
                      tempo: opcoesTempo(valor),
                    })
                  )
                : [],
      };
    });
  return { percentual: progresso.percentual, etapas };
}

export function salvarEtapaPerfil(
  usuario: UsuarioDaSessao,
  id: string,
  valor: unknown,
  tempos: unknown
) {
  if (
    usuario.demonstracao ||
    (usuario.tipoConta !== "consumidor" && usuario.tipoConta !== "profissional")
  )
    throw new ErroCompletarPerfil(
      "Esta conta não pode editar seu perfil.",
      403
    );
  if (!completudePerfil(usuario).pendencias.some(item => item.id === id))
    throw new ErroCompletarPerfil(
      "Esta informação já não está pendente. Abra o assistente novamente.",
      409
    );

  const entrada = valorTexto(valor);
  const garantir = (salvo: boolean) => {
    if (!salvo)
      throw new ErroCompletarPerfil(
        "Não foi possível salvar as informações.",
        404
      );
  };
  if (id === "cidade" || id === "biografia") {
    const cidade = id === "cidade" ? entrada : usuario.city;
    const bio = id === "biografia" ? entrada : usuario.biography;
    const erro = validarApresentacaoPerfil(cidade, bio);
    if (erro) throw new ErroCompletarPerfil(erro);
    if (id === "cidade" && !localizacaoCompleta(cidade))
      throw new ErroCompletarPerfil(
        "Use o formato Cidade, UF. Exemplo: Campinas, SP."
      );
    if (id === "biografia" && !bio)
      throw new ErroCompletarPerfil(
        "Escreva sua biografia ou pule esta etapa."
      );
    return garantir(
      atualizarApresentacaoCypher(usuario.id, usuario.tipoConta, cidade, bio)
    );
  }
  if (usuario.tipoConta !== "profissional")
    throw new ErroCompletarPerfil("Etapa indisponível.", 403);
  if (id === "contato") {
    if (!entrada || entrada.length > 200)
      throw new ErroCompletarPerfil(
        "Informe um contato de até 200 caracteres."
      );
    return garantir(atualizarContatoProfissionalCypher(usuario.id, entrada));
  }
  const dados: DadosAtualizacaoPerfil = {
    id: usuario.id,
    name: usuario.nomeInformado || usuario.name,
    city: usuario.city,
    biography: usuario.biography,
    contact: usuario.contact,
    availability: usuario.availability,
    role: usuario.role,
    initials: usuario.initials,
    categories: usuario.categories,
    otherCategory: usuario.otherCategory,
    equipment: usuario.equipment,
    genres: usuario.genres,
    somenteAtuacao: true,
    tipoConta: usuario.tipoConta,
  };
  if (id === "competencias") {
    const lista = listaDeLinhas(valor, 12, 80);
    if (!lista.valida || !lista.itens.length)
      throw new ErroCompletarPerfil(
        "Informe até 12 competências, uma por linha, com até 80 caracteres cada."
      );
    dados.skills = lista.itens;
  } else if (id === "estilos") {
    if (
      !Array.isArray(valor) ||
      !valor.length ||
      valor.length > 8 ||
      !valor.every(v => typeof v === "string" && generos.includes(v))
    )
      throw new ErroCompletarPerfil("Selecione de 1 a 8 estilos disponíveis.");
    dados.genres = [...new Set(valor)];
  } else if (id.startsWith("tempo:")) {
    const categoria = id.slice(6);
    if (!opcoesTempo(categoria).some(o => o.valor === entrada))
      throw new ErroCompletarPerfil("Escolha uma opção de tempo de atuação.");
    const anterior = listarAtuacoesUsuarioCypher(usuario.id).find(
      a => a.categoria === categoria
    );
    dados.atuacoes = [
      {
        categoria,
        respostas: { ...anterior?.respostas, tempoAtuacao: entrada },
        visibilidades: anterior?.visibilidades || {},
      },
    ];
  } else if (id === "profissoes") {
    const categorias = Array.isArray(valor)
      ? valor.filter((v): v is string => typeof v === "string")
      : [];
    if (
      !categorias.length ||
      categorias.length > 26 ||
      new Set(categorias).size !== categorias.length ||
      categorias.some(c => !listarCategoriasProfissionaisCypher().includes(c))
    )
      throw new ErroCompletarPerfil("Selecione ao menos uma profissão válida.");
    const entradas =
      tempos && typeof tempos === "object"
        ? (tempos as Record<string, unknown>)
        : {};
    dados.categories = categorias;
    dados.role = categorias.join(" · ");
    dados.atuacoes = categorias.flatMap(categoria => {
      const opcoes = opcoesTempo(categoria);
      if (!opcoes.length) return [];
      const tempo = entradas[categoria];
      if (typeof tempo !== "string" || !opcoes.some(o => o.valor === tempo))
        throw new ErroCompletarPerfil(
          "Indique o tempo de atuação nas profissões escolhidas."
        );
      return [
        { categoria, respostas: { tempoAtuacao: tempo }, visibilidades: {} },
      ];
    });
  } else {
    throw new ErroCompletarPerfil("Etapa indisponível.");
  }
  try {
    garantir(atualizarPerfilCypher(dados));
  } catch (erro) {
    if (
      erro instanceof Error &&
      erro.message.startsWith("CATEGORIAS_BLOQUEADAS:")
    )
      throw new ErroCompletarPerfil(
        "A edição das profissões está temporariamente bloqueada para esta conta.",
        409
      );
    throw erro;
  }
}

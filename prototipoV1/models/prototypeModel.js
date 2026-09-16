export const prototypeData = {
  user: {
    id: 1,
    nome: 'Lia Martins',
    artistico: 'Lia Noise',
    username: 'lianoise',
    email: 'lia@cypher.demo',
    cidade: 'São Paulo',
    estado: 'SP',
    bio: 'Artista independente, compositora e produtora explorando texturas entre o rap, o eletrônico e a música brasileira.',
    categorias: ['Artista', 'Produtora', 'Compositora'],
    avatar: 'L'
  },
  categorias: ['Artista', 'Beatmaker', 'Produtor', 'DJ', 'Compositor', 'Fotógrafo', 'Videomaker', 'Designer'],
  obras: [
    { id: 1, titulo: 'Noite de Cypher', tipo: 'Single', genero: 'Rap alternativo', bpm: 92, status: 'Lançada', data: '12 ago 2025', capa: 'NC' },
    { id: 2, titulo: 'Margem', tipo: 'EP', genero: 'R&B / Soul', bpm: 78, status: 'Em produção', data: 'Atualizado há 3 dias', capa: 'MG' },
    { id: 3, titulo: 'Sem Pressa', tipo: 'Single', genero: 'Lo-fi', bpm: 84, status: 'Rascunho', data: 'Atualizado há 1 semana', capa: 'SP' }
  ],
  beats: [
    { id: 1, titulo: 'Rua Molhada', autor: 'Davi 808', handle: '@davi808', genero: 'Trap', bpm: 140, tom: 'Am', status: 'Free use', descricao: 'Atmosfera noturna, grave presente e espaço para flows melódicos.' },
    { id: 2, titulo: 'Luz de Neon', autor: 'Nina Beats', handle: '@ninabeats', genero: 'R&B', bpm: 92, tom: 'F#m', status: 'Disponível', descricao: 'Textura quente para vozes íntimas e refrões grandes.' },
    { id: 3, titulo: 'Concreto', autor: 'Base Seca', handle: '@baseseca', genero: 'Boom bap', bpm: 88, tom: 'Dm', status: 'Disponível', descricao: 'Bateria seca, sample soul e espaço para contar histórias.' },
    { id: 4, titulo: 'Horizonte', autor: 'Maya Loop', handle: '@mayaloop', genero: 'Lo-fi', bpm: 76, tom: 'C', status: 'Vendido', descricao: 'Instrumental contemplativo com textura analógica.' }
  ],
  eventos: [
    { id: 1, dia: '24', mes: 'OUT', titulo: 'Cypher Aberta — Centro', categoria: 'Encontro', local: 'Casa de Cultura', cidade: 'São Paulo', horario: '18:30', organizador: 'Coletivo Margem', interessados: 38, descricao: 'Microfone aberto e encontro para artistas da região.' },
    { id: 2, dia: '02', mes: 'NOV', titulo: 'Workshop: Produção do zero', categoria: 'Workshop', local: 'Estúdio Norte', cidade: 'São Paulo', horario: '14:00', organizador: 'Nina Beats', interessados: 21, descricao: 'Uma tarde prática para entender arranjo, bateria e textura.' },
    { id: 3, dia: '16', mes: 'NOV', titulo: 'Batalha de DJs Cypher', categoria: 'Batalha', local: 'Galpão 12', cidade: 'Santo André', horario: '20:00', organizador: 'DJ Lume', interessados: 64, descricao: 'DJs convidados, pista aberta e votação da comunidade.' }
  ],
  oportunidades: [
    { id: 1, tipo: 'Colaboração', titulo: 'Procuro beatmaker para EP', descricao: 'Estou produzindo um EP de 5 faixas e procuro alguém que goste de misturar R&B com elementos eletrônicos.', local: 'Remoto', prazo: 'Até 30 nov', autor: 'Lia Noise', candidaturas: 7 },
    { id: 2, tipo: 'Vaga', titulo: 'Videomaker para sessão ao vivo', descricao: 'Precisamos de uma pessoa para registrar uma sessão ao vivo de três artistas independentes.', local: 'São Paulo · SP', prazo: 'Até 10 nov', autor: 'Coletivo Margem', candidaturas: 12 },
    { id: 3, tipo: 'Show', titulo: 'Artistas para line-up', descricao: 'Line-up aberto para novos nomes da cena em evento com entrada gratuita.', local: 'Santo André · SP', prazo: 'Até 18 nov', autor: 'Galpão 12', candidaturas: 19 }
  ],
  profissionais: [
    { id: 2, nome: 'Davi 808', handle: '@davi808', categoria: 'Beatmaker · Produtor', cidade: 'São Paulo, SP', inicial: 'D' },
    { id: 3, nome: 'Nina Beats', handle: '@ninabeats', categoria: 'Beatmaker · Compositora', cidade: 'Osasco, SP', inicial: 'N' },
    { id: 4, nome: 'DJ Lume', handle: '@djlume', categoria: 'DJ · Produtor', cidade: 'Santo André, SP', inicial: 'L' },
    { id: 5, nome: 'Rafa Verso', handle: '@rafaverso', categoria: 'Artista · Compositor', cidade: 'São Paulo, SP', inicial: 'R' },
    { id: 6, nome: 'Maya Loop', handle: '@mayaloop', categoria: 'Beatmaker · DJ', cidade: 'Campinas, SP', inicial: 'M' },
    { id: 7, nome: 'Coletivo Margem', handle: '@coletivomargem', categoria: 'Coletivo · Produtor', cidade: 'São Paulo, SP', inicial: 'C' }
  ],
  conexoes: [
    { id: 2, nome: 'Davi 808', handle: '@davi808', inicial: 'D', status: 'Conectado' },
    { id: 3, nome: 'Nina Beats', handle: '@ninabeats', inicial: 'N', status: 'Solicitação pendente' }
  ],
  creditos: [
    { obra: 'Noite de Cypher', funcao: 'Artista principal', status: 'Lançada' },
    { obra: 'Margem', funcao: 'Compositora · Produtora', status: 'Em produção' }
  ],
  conhecimento: [
    { categoria: 'Créditos', titulo: 'Por que registrar os créditos da obra?', texto: 'Créditos preservam a participação de cada profissional e ajudam a construir um histórico de colaboração confiável.' },
    { categoria: 'Identificação', titulo: 'ISRC e ISWC sem complicação', texto: 'Entenda a diferença entre identificar uma gravação e identificar uma composição musical.' },
    { categoria: 'Colaboração', titulo: 'Como organizar uma parceria musical', texto: 'Defina funções, participação e comunicação antes de publicar o próximo projeto.' },
    { categoria: 'Portfólio', titulo: 'Transforme participação em trajetória', texto: 'Obras, beats, eventos e créditos podem formar uma apresentação profissional consistente.' }
  ]
};

export function cloneData() {
  return JSON.parse(JSON.stringify(prototypeData));
}

CREATE DATABASE IF NOT EXISTS cypher_artistas
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cypher_artistas;

-- ============================================================
-- 1. USUÁRIOS
-- ============================================================

CREATE TABLE usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_conta ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
    status ENUM('ativo', 'inativo', 'bloqueado') NOT NULL DEFAULT 'ativo',
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. PERFIS
-- ============================================================

CREATE TABLE perfis (
    id_perfil INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL UNIQUE,
    nome_artistico VARCHAR(100) NOT NULL,
    bio TEXT,
    cidade VARCHAR(100),
    estado CHAR(2),
    foto VARCHAR(255),
    instagram VARCHAR(255),
    youtube VARCHAR(255),
    spotify VARCHAR(255),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. CATEGORIAS PROFISSIONAIS
-- ============================================================

CREATE TABLE categorias (
    id_categoria SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE,
    descricao VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE usuario_categorias (
    id_usuario INT UNSIGNED NOT NULL,
    id_categoria SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_usuario, id_categoria),

    CONSTRAINT fk_uc_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_uc_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. HABILIDADES
-- ============================================================

CREATE TABLE habilidades (
    id_habilidade SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuario_habilidades (
    id_usuario INT UNSIGNED NOT NULL,
    id_habilidade SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_usuario, id_habilidade),

    CONSTRAINT fk_uh_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_uh_habilidade
        FOREIGN KEY (id_habilidade)
        REFERENCES habilidades(id_habilidade)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. EQUIPAMENTOS
-- ============================================================

CREATE TABLE equipamentos (
    id_equipamento SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuario_equipamentos (
    id_usuario INT UNSIGNED NOT NULL,
    id_equipamento SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (id_usuario, id_equipamento),

    CONSTRAINT fk_ue_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_ue_equipamento
        FOREIGN KEY (id_equipamento)
        REFERENCES equipamentos(id_equipamento)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. OBRAS / MÚSICAS
-- ============================================================

CREATE TABLE obras (
    id_obra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    letra LONGTEXT,
    genero VARCHAR(80),
    bpm SMALLINT UNSIGNED,
    isrc VARCHAR(20) UNIQUE,
    iswc VARCHAR(20) UNIQUE,
    tipo_lancamento ENUM('single', 'ep', 'album', 'outro')
        NOT NULL DEFAULT 'single',
    data_lancamento DATE,
    status ENUM(
        'rascunho',
        'em_producao',
        'lancada',
        'arquivada'
    ) NOT NULL DEFAULT 'rascunho',
    arquivo VARCHAR(255),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_obra_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. COLABORADORES DAS OBRAS
-- Permite colaborador cadastrado ou "menção fantasma"
-- ============================================================

CREATE TABLE obra_colaboradores (
    id_obra_colaborador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_obra INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED NULL,
    nome_externo VARCHAR(150) NULL,
    funcao VARCHAR(100) NOT NULL,
    participacao_percentual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    mencao_fantasma BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_oc_obra
        FOREIGN KEY (id_obra)
        REFERENCES obras(id_obra)
        ON DELETE CASCADE,

    CONSTRAINT fk_oc_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL,

    CONSTRAINT chk_oc_origem CHECK (
        (id_usuario IS NOT NULL
         AND nome_externo IS NULL
         AND mencao_fantasma = FALSE)
        OR
        (id_usuario IS NULL
         AND nome_externo IS NOT NULL
         AND mencao_fantasma = TRUE)
    ),

    CONSTRAINT chk_oc_participacao CHECK (
        participacao_percentual >= 0
        AND participacao_percentual <= 100
    )
) ENGINE=InnoDB;

-- ============================================================
-- 8. BEATS
-- ============================================================

CREATE TABLE beats (
    id_beat INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    genero VARCHAR(80),
    bpm SMALLINT UNSIGNED,
    tom VARCHAR(20),
    duracao_segundos INT UNSIGNED,
    descricao TEXT,
    arquivo_preview VARCHAR(255),
    arquivo_original VARCHAR(255),
    marca_agua BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM(
        'disponivel',
        'vendido_exclusivo',
        'inativo'
    ) NOT NULL DEFAULT 'disponivel',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_beat_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 9. LICENÇAS DOS BEATS
-- ============================================================

CREATE TABLE licencas (
    id_licenca INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_beat INT UNSIGNED NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM(
        'basica',
        'premium',
        'exclusiva',
        'personalizada'
    ) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    exclusiva BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM(
        'disponivel',
        'vendida',
        'inativa'
    ) NOT NULL DEFAULT 'disponivel',

    CONSTRAINT fk_licenca_beat
        FOREIGN KEY (id_beat)
        REFERENCES beats(id_beat)
        ON DELETE CASCADE,

    UNIQUE (id_beat, nome)
) ENGINE=InnoDB;

-- ============================================================
-- 10. EVENTOS
-- ============================================================

CREATE TABLE eventos (
    id_evento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(80),
    data_evento DATETIME NOT NULL,
    local VARCHAR(200),
    cidade VARCHAR(100),
    estado CHAR(2),
    imagem VARCHAR(255),
    status ENUM(
        'ativo',
        'encerrado',
        'cancelado'
    ) NOT NULL DEFAULT 'ativo',
    data_publicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. PARTICIPANTES DOS EVENTOS
-- ============================================================

CREATE TABLE evento_participantes (
    id_evento INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED NOT NULL,
    status ENUM(
        'pendente',
        'confirmado',
        'cancelado'
    ) NOT NULL DEFAULT 'pendente',
    data_inscricao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_evento, id_usuario),

    CONSTRAINT fk_ep_evento
        FOREIGN KEY (id_evento)
        REFERENCES eventos(id_evento)
        ON DELETE CASCADE,

    CONSTRAINT fk_ep_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. OPORTUNIDADES
-- ============================================================

CREATE TABLE oportunidades (
    id_oportunidade INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    tipo VARCHAR(80),
    cidade VARCHAR(100),
    estado CHAR(2),
    data_limite DATETIME,
    status ENUM(
        'aberta',
        'encerrada',
        'cancelada'
    ) NOT NULL DEFAULT 'aberta',
    data_publicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_oportunidade_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. CANDIDATURAS
-- ============================================================

CREATE TABLE candidaturas (
    id_candidatura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_oportunidade INT UNSIGNED NOT NULL,
    id_usuario INT UNSIGNED NOT NULL,
    mensagem TEXT,
    status ENUM(
        'pendente',
        'aceita',
        'recusada',
        'cancelada'
    ) NOT NULL DEFAULT 'pendente',
    data_candidatura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (id_oportunidade, id_usuario),

    CONSTRAINT fk_candidatura_oportunidade
        FOREIGN KEY (id_oportunidade)
        REFERENCES oportunidades(id_oportunidade)
        ON DELETE CASCADE,

    CONSTRAINT fk_candidatura_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 14. CONEXÕES / CONTATOS
-- Mantém uma única conexão entre duas pessoas
-- ============================================================

CREATE TABLE conexoes (
    id_conexao BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario_menor INT UNSIGNED NOT NULL,
    id_usuario_maior INT UNSIGNED NOT NULL,
    solicitada_por INT UNSIGNED NOT NULL,
    status ENUM(
        'pendente',
        'aceita',
        'recusada',
        'bloqueada'
    ) NOT NULL DEFAULT 'pendente',
    data_conexao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (id_usuario_menor, id_usuario_maior),

    CONSTRAINT fk_conexao_menor
        FOREIGN KEY (id_usuario_menor)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_conexao_maior
        FOREIGN KEY (id_usuario_maior)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_conexao_solicitante
        FOREIGN KEY (solicitada_por)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT chk_conexao_ordem
        CHECK (id_usuario_menor < id_usuario_maior)
) ENGINE=InnoDB;

-- ============================================================
-- 15. MENSAGENS
-- ============================================================

CREATE TABLE mensagens (
    id_mensagem BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_remetente INT UNSIGNED NOT NULL,
    id_destinatario INT UNSIGNED NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    data_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mensagem_remetente
        FOREIGN KEY (id_remetente)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_mensagem_destinatario
        FOREIGN KEY (id_destinatario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 16. NOTIFICAÇÕES
-- ============================================================

CREATE TABLE notificacoes (
    id_notificacao BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    tipo ENUM(
        'conexao',
        'mensagem',
        'oportunidade',
        'evento',
        'obra',
        'beat',
        'sistema'
    ) NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 17. PRODUTOS - LOJINHA CYPHER
-- ============================================================

CREATE TABLE produtos (
    id_produto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM(
        'disponivel',
        'indisponivel'
    ) NOT NULL DEFAULT 'disponivel',
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 18. CARRINHOS
-- ============================================================

CREATE TABLE carrinhos (
    id_carrinho INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    status ENUM(
        'ativo',
        'finalizado',
        'abandonado'
    ) NOT NULL DEFAULT 'ativo',
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrinho_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 19. ITENS DO CARRINHO
-- Pode conter produto da lojinha OU licença de beat
-- ============================================================

CREATE TABLE carrinho_itens (
    id_item INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_carrinho INT UNSIGNED NOT NULL,
    id_produto INT UNSIGNED NULL,
    id_licenca INT UNSIGNED NULL,
    quantidade INT UNSIGNED NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_ci_carrinho
        FOREIGN KEY (id_carrinho)
        REFERENCES carrinhos(id_carrinho)
        ON DELETE CASCADE,

    CONSTRAINT fk_ci_produto
        FOREIGN KEY (id_produto)
        REFERENCES produtos(id_produto)
        ON DELETE RESTRICT,

    CONSTRAINT fk_ci_licenca
        FOREIGN KEY (id_licenca)
        REFERENCES licencas(id_licenca)
        ON DELETE RESTRICT,

    CONSTRAINT chk_ci_tipo CHECK (
        (id_produto IS NOT NULL AND id_licenca IS NULL)
        OR
        (id_produto IS NULL AND id_licenca IS NOT NULL)
    )
) ENGINE=InnoDB;

-- ============================================================
-- 20. COMPRAS
-- ============================================================

CREATE TABLE compras (
    id_compra INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status ENUM(
        'pendente',
        'paga',
        'cancelada'
    ) NOT NULL DEFAULT 'pendente',
    data_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_compra_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 21. ITENS DAS COMPRAS
-- Pode conter produto da lojinha OU licença de beat
-- ============================================================

CREATE TABLE compra_itens (
    id_compra_item INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_compra INT UNSIGNED NOT NULL,
    id_produto INT UNSIGNED NULL,
    id_licenca INT UNSIGNED NULL,
    quantidade INT UNSIGNED NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_compi_compra
        FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra)
        ON DELETE CASCADE,

    CONSTRAINT fk_compi_produto
        FOREIGN KEY (id_produto)
        REFERENCES produtos(id_produto)
        ON DELETE RESTRICT,

    CONSTRAINT fk_compi_licenca
        FOREIGN KEY (id_licenca)
        REFERENCES licencas(id_licenca)
        ON DELETE RESTRICT,

    CONSTRAINT chk_compi_tipo CHECK (
        (id_produto IS NOT NULL AND id_licenca IS NULL)
        OR
        (id_produto IS NULL AND id_licenca IS NOT NULL)
    )
) ENGINE=InnoDB;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

INSERT INTO categorias (nome, descricao) VALUES
('Rapper / MC', 'Artista que atua como rapper ou MC.'),
('Beatmaker', 'Cria instrumentais e beats.'),
('Produtor', 'Atua na produção musical.'),
('DJ', 'Atua como DJ e discotecagem.'),
('Empresário', 'Atua na gestão e representação de artistas.'),
('Organizador de eventos', 'Organiza eventos e atividades culturais.'),
('Público / Fã', 'Usuário interessado em acompanhar artistas e eventos.');

INSERT INTO habilidades (nome) VALUES
('Composição'),
('Produção musical'),
('Mixagem'),
('Masterização'),
('Discotecagem'),
('Beatmaking'),
('Rima'),
('Gravação'),
('Organização de eventos');

INSERT INTO equipamentos (nome) VALUES
('Microfone'),
('Controladora DJ'),
('Mesa de som'),
('Interface de áudio'),
('Monitores de áudio'),
('Teclado MIDI'),
('Fones de estúdio');


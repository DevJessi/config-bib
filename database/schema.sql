CREATE EXTENSION IF NOT EXISTS citext;  -- citext serve para não diferenciar maiúsculas/minúsculas no email

CREATE TABLE usuarios ( 
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    nome        TEXT NOT NULL,                       -- nome completo
    email       CITEXT NOT NULL UNIQUE,              -- login
    senha_hash  TEXT NOT NULL,                       -- hash bcrypt, gerado pela API
    papel       TEXT NOT NULL DEFAULT 'LEITOR'
                CHECK (papel IN ('LEITOR', 'BIBLIOTECARIO', 'ADMIN')),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,       -- TRUE: conta ativada, FALSE: conta desativada
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE livros (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    titulo          TEXT NOT NULL,
    autor           TEXT NOT NULL,
    isbn            TEXT NOT NULL UNIQUE,
    categoria       TEXT NOT NULL,
    editora         TEXT NOT NULL,
    ano_publicacao  INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exemplares (
    id                 UUID PRIMARY KEY DEFAULT uuidv7(),
    livro_id           UUID NOT NULL REFERENCES livros(id),
    codigo_patrimonio  TEXT NOT NULL UNIQUE,          
    ativo              BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE = fora de circulação (perdido, danificado...), pois mesmo extraviado o livro ainda continuará no banco
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emprestimos (
    id                       UUID PRIMARY KEY DEFAULT uuidv7(),
    leitor_id                UUID NOT NULL REFERENCES usuarios(id),
    exemplar_id              UUID NOT NULL REFERENCES exemplares(id),
    data_emprestimo          TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_prevista_devolucao  TIMESTAMPTZ NOT NULL,    -- API vai definir
    data_devolucao_efetiva   TIMESTAMPTZ              -- Esse campo ficara: NULL, enquanto o livro não for devolvido
);

-- As multas serão "geradas" pela API na devolucao
CREATE TABLE multas (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    emprestimo_id  UUID NOT NULL REFERENCES emprestimos(id),
    valor_total    NUMERIC(10, 2) NOT NULL CHECK (valor_total > 0),
    status         TEXT NOT NULL DEFAULT 'PENDENTE'
                   CHECK (status IN ('PENDENTE', 'PAGA', 'ISENTA')),
    data_quitacao  TIMESTAMPTZ,                       -- Esse campo só será preenchido quando for pago a multa
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices, somente os que as consultas utilizam POR ENQUANTO
CREATE INDEX idx_exemplares_livro   ON exemplares (livro_id);
CREATE INDEX idx_emprestimos_leitor ON emprestimos (leitor_id);
CREATE INDEX idx_multas_emprestimo  ON multas (emprestimo_id);

-- Esse UNIQUE serve para dizer que um exmplar não pode ter 2+ empréstimos simultaneamente abertos
CREATE UNIQUE INDEX uq_emprestimo_aberto
    ON emprestimos (exemplar_id) WHERE data_devolucao_efetiva IS NULL;
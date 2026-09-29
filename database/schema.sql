-- =============================================================================
-- SISTEMA DE GERENCIAMENTO DE BIBLIOTECA DIGITAL (SGBD)
-- SCRIPT DDL DE CRIAÇÃO DO BANCO DE DADOS POSTGRESQL
-- Data: 18 de Setembro de 2026 | Versão: 1.0
-- Referências: ADR-001 a ADR-010, ADR-013 (Prisma ORM), ADR-014 (PostgreSQL)
-- =============================================================================

-- Habilita extensão para geração automática de UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- CRIAÇÃO DOS TIPOS ENUMERADOS (ENUMS DE NEGÓCIO)
-- -----------------------------------------------------------------------------

CREATE TYPE role_enum AS ENUM ('LEITOR', 'BIBLIOTECARIO', 'ADMIN');

CREATE TYPE status_usuario_enum AS ENUM (
    'ATIVO', 
    'BLOQUEADO_MULTA',   -- ADR-006: Bloqueado se pendência financeira > R$ 20,00 ou avaria
    'PENDENTE_LGPD'      -- ADR-009: Solicitação de exclusão em processamento (até 48h)
);

CREATE TYPE status_exemplar_enum AS ENUM (
    'DISPONIVEL', 
    'EMPRESTADO', 
    'RESERVADO', 
    'MANUTENCAO'
);

CREATE TYPE status_emprestimo_enum AS ENUM (
    'ATIVO', 
    'DEVOLVIDO', 
    'ATRASADO'
);

CREATE TYPE status_reserva_enum AS ENUM (
    'ATIVA', 
    'ATENDIDA', 
    'CANCELADA'
);

CREATE TYPE status_multa_enum AS ENUM (
    'PENDENTE', 
    'PAGA', 
    'ISENTA'
);

-- -----------------------------------------------------------------------------
-- CRIAÇÃO DAS TABELAS DO BANCO DE DADOS
-- -----------------------------------------------------------------------------

-- 1. Tabela: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL, -- ADR-007: Hash bcrypt
    papel role_enum NOT NULL DEFAULT 'LEITOR',
    status status_usuario_enum NOT NULL DEFAULT 'ATIVO',
    total_multa_pendente DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- ADR-006 / RN-03
    solicitou_exclusao_lgpd_em TIMESTAMP WITH TIME ZONE NULL, -- ADR-009 / RNF-05
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela: livros (Catálogo de Obras)
CREATE TABLE livros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    categoria VARCHAR(100) NOT NULL,
    editora VARCHAR(100) NOT NULL,
    ano_publicacao INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela: exemplares (Unidades Físicas / Cópias - ADR-002)
CREATE TABLE exemplares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_patrimonio VARCHAR(100) NOT NULL UNIQUE,
    livro_id UUID NOT NULL,
    status status_exemplar_enum NOT NULL DEFAULT 'DISPONIVEL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exemplares_livro FOREIGN KEY (livro_id) 
        REFERENCES livros(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Tabela: emprestimos (ADR-001, ADR-004, ADR-005)
CREATE TABLE emprestimos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leitor_id UUID NOT NULL,
    exemplar_id UUID NOT NULL,
    data_emprestimo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_prevista_devolucao TIMESTAMP WITH TIME ZONE NOT NULL, -- ADR-001 / RN-05: 15 dias
    data_devolucao_efetiva TIMESTAMP WITH TIME ZONE NULL,
    status status_emprestimo_enum NOT NULL DEFAULT 'ATIVO',
    renovacoes_qtd INTEGER NOT NULL DEFAULT 0, -- ADR-004 / RF-009
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emprestimos_leitor FOREIGN KEY (leitor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_emprestimos_exemplar FOREIGN KEY (exemplar_id) 
        REFERENCES exemplares(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Tabela: reservas (Fila de Espera - ADR-004 / RF-008)
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leitor_id UUID NOT NULL,
    livro_id UUID NOT NULL,
    data_reserva TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status status_reserva_enum NOT NULL DEFAULT 'ATIVA',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservas_leitor FOREIGN KEY (leitor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reservas_livro FOREIGN KEY (livro_id) 
        REFERENCES livros(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Tabela: multas (Gestão Financeira - ADR-006, ADR-008 / RN-04, RN-06)
CREATE TABLE multas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emprestimo_id UUID NOT NULL,
    leitor_id UUID NOT NULL,
    dias_atraso INTEGER NOT NULL DEFAULT 0,
    valor_total DECIMAL(10, 2) NOT NULL,
    status status_multa_enum NOT NULL DEFAULT 'PENDENTE',
    data_quitacao TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_multas_emprestimo FOREIGN KEY (emprestimo_id) 
        REFERENCES emprestimos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_multas_leitor FOREIGN KEY (leitor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Tabela: notificacoes (Log de Comunicação - ADR-003 / RF-010)
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leitor_id UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Ex: 'LEMBRETE_VENCIMENTO', 'ATRASO_MULTA'
    mensagem TEXT NOT NULL,
    enviado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacoes_leitor FOREIGN KEY (leitor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------------------------------
-- CRIAÇÃO DE ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS (PERFORMANCE)
-- -----------------------------------------------------------------------------

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_livros_isbn ON livros(isbn);
CREATE INDEX idx_livros_titulo ON livros(titulo);
CREATE INDEX idx_livros_autor ON livros(autor);
CREATE INDEX idx_exemplares_codigo_patrimonio ON exemplares(codigo_patrimonio);
CREATE INDEX idx_exemplares_livro_id ON exemplares(livro_id);
CREATE INDEX idx_exemplares_status ON exemplares(status);
CREATE INDEX idx_emprestimos_leitor_id ON emprestimos(leitor_id);
CREATE INDEX idx_emprestimos_exemplar_id ON emprestimos(exemplar_id);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_reservas_livro_status ON reservas(livro_id, status);
CREATE INDEX idx_multas_leitor_status ON multas(leitor_id, status);
CREATE INDEX idx_notificacoes_leitor_id ON notificacoes(leitor_id);

-- -----------------------------------------------------------------------------
-- TRIGGERS E FUNÇÕES PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMP (updated_at)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_livros_updated_at BEFORE UPDATE ON livros FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_exemplares_updated_at BEFORE UPDATE ON exemplares FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_emprestimos_updated_at BEFORE UPDATE ON emprestimos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_multas_updated_at BEFORE UPDATE ON multas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- FIM DO SCRIPT DDL
-- =============================================================================

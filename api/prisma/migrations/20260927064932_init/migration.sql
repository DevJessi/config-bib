-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEITOR', 'BIBLIOTECARIO', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'BLOQUEADO_MULTA', 'PENDENTE_LGPD');

-- CreateEnum
CREATE TYPE "StatusExemplar" AS ENUM ('DISPONIVEL', 'EMPRESTADO', 'RESERVADO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "StatusEmprestimo" AS ENUM ('ATIVO', 'DEVOLVIDO', 'ATRASADO');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('ATIVA', 'ATENDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusMulta" AS ENUM ('PENDENTE', 'PAGA', 'ISENTA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "papel" "Role" NOT NULL DEFAULT 'LEITOR',
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "total_multa_pendente" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "solicitou_exclusao_lgpd_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livros" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "titulo" VARCHAR(255) NOT NULL,
    "autor" VARCHAR(255) NOT NULL,
    "isbn" VARCHAR(20) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "editora" VARCHAR(100) NOT NULL,
    "ano_publicacao" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exemplares" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "codigo_patrimonio" VARCHAR(100) NOT NULL,
    "livro_id" UUID NOT NULL,
    "status" "StatusExemplar" NOT NULL DEFAULT 'DISPONIVEL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "exemplares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "leitor_id" UUID NOT NULL,
    "exemplar_id" UUID NOT NULL,
    "data_emprestimo" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_prevista_devolucao" TIMESTAMPTZ NOT NULL,
    "data_devolucao_efetiva" TIMESTAMPTZ,
    "status" "StatusEmprestimo" NOT NULL DEFAULT 'ATIVO',
    "renovacoes_qtd" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "leitor_id" UUID NOT NULL,
    "livro_id" UUID NOT NULL,
    "data_reserva" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusReserva" NOT NULL DEFAULT 'ATIVA',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "emprestimo_id" UUID NOT NULL,
    "leitor_id" UUID NOT NULL,
    "dias_atraso" INTEGER NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "status" "StatusMulta" NOT NULL DEFAULT 'PENDENTE',
    "data_quitacao" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "multas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "leitor_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "enviado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_status_idx" ON "usuarios"("status");

-- CreateIndex
CREATE UNIQUE INDEX "livros_isbn_key" ON "livros"("isbn");

-- CreateIndex
CREATE INDEX "livros_isbn_idx" ON "livros"("isbn");

-- CreateIndex
CREATE INDEX "livros_titulo_idx" ON "livros"("titulo");

-- CreateIndex
CREATE INDEX "livros_autor_idx" ON "livros"("autor");

-- CreateIndex
CREATE UNIQUE INDEX "exemplares_codigo_patrimonio_key" ON "exemplares"("codigo_patrimonio");

-- CreateIndex
CREATE INDEX "exemplares_codigo_patrimonio_idx" ON "exemplares"("codigo_patrimonio");

-- CreateIndex
CREATE INDEX "exemplares_livro_id_idx" ON "exemplares"("livro_id");

-- CreateIndex
CREATE INDEX "exemplares_status_idx" ON "exemplares"("status");

-- CreateIndex
CREATE INDEX "emprestimos_leitor_id_idx" ON "emprestimos"("leitor_id");

-- CreateIndex
CREATE INDEX "emprestimos_exemplar_id_idx" ON "emprestimos"("exemplar_id");

-- CreateIndex
CREATE INDEX "emprestimos_status_idx" ON "emprestimos"("status");

-- CreateIndex
CREATE INDEX "reservas_livro_id_status_idx" ON "reservas"("livro_id", "status");

-- CreateIndex
CREATE INDEX "multas_leitor_id_status_idx" ON "multas"("leitor_id", "status");

-- CreateIndex
CREATE INDEX "notificacoes_leitor_id_idx" ON "notificacoes"("leitor_id");

-- AddForeignKey
ALTER TABLE "exemplares" ADD CONSTRAINT "exemplares_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_leitor_id_fkey" FOREIGN KEY ("leitor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_exemplar_id_fkey" FOREIGN KEY ("exemplar_id") REFERENCES "exemplares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_leitor_id_fkey" FOREIGN KEY ("leitor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_emprestimo_id_fkey" FOREIGN KEY ("emprestimo_id") REFERENCES "emprestimos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_leitor_id_fkey" FOREIGN KEY ("leitor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_leitor_id_fkey" FOREIGN KEY ("leitor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

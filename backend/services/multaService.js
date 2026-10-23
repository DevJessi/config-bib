import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';
import { comTransacao } from '../infra/transacao.js';
import { registrarAuditoria } from '../infra/auditoria.js';
import { ehUuid, formatarReais, padraoBusca } from '../infra/validacao.js';
import { SQL_JOIN_DEVOLUCAO } from '../infra/sqlEmprestimo.js';

// Soma das multas pendentes
export async function totalMultasPendentes(executor, leitorId) {
  const { rows } = await executor.query(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM fines WHERE reader_id = $1 AND status = 'pending'",
    [leitorId],
  );
  return Number(rows[0].total);
}

export function estaBloqueado(multaTotal) {
  return multaTotal > env.limiteBloqueioMulta;
}

// ADR-006: multa pendente acima do limite bloqueia novos empréstimos e reservas até a quitação total
export async function garantirLeitorSemBloqueio(executor, leitorId) {
  const total = await totalMultasPendentes(executor, leitorId);
  if (estaBloqueado(total)) {
    throw new ErroHttp(
      403,
      `Leitor bloqueado: multas pendentes de ${formatarReais(total)} (acima de ${formatarReais(env.limiteBloqueioMulta)}). Quite as multas para liberar novos empréstimos e reservas.`,
    );
  }
}

// GET /multas/pendentes: leitores com multa pendente, com o detalhe de cada multa
export async function listarMultasPendentes({ busca }) {
  const { rows } = await pool.query(
    `SELECT f.id, f.amount, f.lates_days, u.id AS leitor_id, u.name, u.email,
            l.id AS emprestimo_id, l.due_at, b.title, dev.occured_at AS devolvido_em
     FROM fines f
     JOIN users u ON u.id = f.reader_id
     JOIN loans l ON l.id = f.loan_id
     JOIN exemplars e ON e.id = l.exemplar_id
     JOIN books b ON b.id = e.books_id
     ${SQL_JOIN_DEVOLUCAO}
     WHERE f.status = 'pending'
       AND ($1::text IS NULL OR u.name ILIKE $1 OR u.email ILIKE $1)
     ORDER BY u.name, f."createdAt"`,
    [padraoBusca(busca)],
  );

  const porLeitor = new Map();
  for (const r of rows) {
    if (!porLeitor.has(r.leitor_id)) {
      porLeitor.set(r.leitor_id, {
        leitorId: r.leitor_id,
        nome: r.name,
        email: r.email,
        statusLeitor: 'ATIVO',
        multaTotal: 0,
        multas: [],
      });
    }
    const leitor = porLeitor.get(r.leitor_id);
    const valor = Number(r.amount);
    leitor.multaTotal = Math.round((leitor.multaTotal + valor) * 100) / 100;
    leitor.multas.push({
      emprestimoId: r.emprestimo_id,
      livroTitulo: r.title,
      dataDevolucaoPrevista: r.due_at,
      dataDevolucaoReal: r.devolvido_em ?? null,
      diasAtraso: r.lates_days,
      valor,
    });
  }

  const leitores = [...porLeitor.values()];
  for (const leitor of leitores) {
    if (estaBloqueado(leitor.multaTotal)) leitor.statusLeitor = 'BLOQUEADO_MULTA';
  }
  return leitores;
}

// POST /multas/:leitorId/quitar: quitação TOTAL das multas pendentes do leitor (ADR-006)
export async function quitarMultas(leitorId, ator) {
  if (!ehUuid(leitorId)) throw new ErroHttp(404, 'Leitor não encontrado.');

  return comTransacao(async (client) => {
    const { rows } = await client.query(
      `UPDATE fines SET status = 'paid', "paidAt" = now()
       WHERE reader_id = $1 AND status = 'pending'
       RETURNING id, amount`,
      [leitorId],
    );
    if (rows.length === 0) throw new ErroHttp(404, 'Este leitor não tem multas pendentes.');

    const total = rows.reduce((soma, r) => soma + Number(r.amount), 0);
    await registrarAuditoria(client, {
      operacao: 'fine.paid',
      ator,
      entidade: 'user',
      entidadeId: leitorId,
      detalhes: { multas: rows.length, total: Math.round(total * 100) / 100 },
    });
    return { message: 'Multas quitadas com sucesso.', quitadas: rows.length, total: Math.round(total * 100) / 100 };
  });
}

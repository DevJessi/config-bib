import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';
import { logErro } from '../infra/logger.js';
import { comTransacao } from '../infra/transacao.js';
import { registrarAuditoria } from '../infra/auditoria.js';
import { sqlExemplarLivre } from '../infra/disponibilidade.js';
import { ehUuid } from '../infra/validacao.js';
import { garantirLeitorSemBloqueio } from './multaService.js';

// Status no banco (reservations.status) -> status que o front mostra
// active = na fila | ready = livro guardado para o leitor retirar
const STATUS_PARA_FRONT = { active: 'PENDENTE', ready: 'CONFIRMADA' };

export async function promoverProximaReserva(client, exemplarId) {
  const { rows } = await client.query(
    `SELECT (
        NOT EXISTS (SELECT 1 FROM loans WHERE exemplar_id = $1 AND status = 'active')
        AND NOT EXISTS (SELECT 1 FROM reservations WHERE exemplar_id = $1 AND status = 'ready' AND "expiresAt" > now())
     ) AS livre`,
    [exemplarId],
  );
  if (!rows[0].livre) return null;

  const promovida = await client.query(
    `UPDATE reservations
     SET status = 'ready', ready_at = now(), "expiresAt" = now() + ($2::int * interval '1 day')
     WHERE id = (
       SELECT id FROM reservations
       WHERE exemplar_id = $1 AND status = 'active'
       ORDER BY "createdAt", id
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id`,
    [exemplarId, env.reservaDiasRetirada],
  );
  return promovida.rows[0]?.id ?? null;
}

// Rotina automática: reservas "ready" que passaram do prazo de retirada expiram e a fila anda
export async function expirarReservasVencidas() {
  const { rows } = await pool.query(
    `UPDATE reservations SET status = 'expired'
     WHERE status = 'ready' AND "expiresAt" <= now()
     RETURNING exemplar_id`,
  );
  const exemplares = [...new Set(rows.map((r) => r.exemplar_id))];
  for (const exemplarId of exemplares) {
    try {
      await comTransacao((client) => promoverProximaReserva(client, exemplarId));
    } catch (error) {
      logErro('reserva.erro_ao_promover', error, { exemplarId });
    }
  }
  return rows.length;
}

// GET /reservas/minhas
export async function listarMinhasReservas(usuario) {
  const { rows } = await pool.query(
    `SELECT r.id, r.status, r."createdAt" AS criada_em, r."expiresAt" AS expira_em, b.title, b.author,
            (SELECT count(*) FROM reservations q
             WHERE q.exemplar_id = r.exemplar_id AND q.status IN ('active', 'ready')
               AND (q."createdAt" < r."createdAt" OR (q."createdAt" = r."createdAt" AND q.id <= r.id))) AS posicao
     FROM reservations r
     JOIN exemplars e ON e.id = r.exemplar_id
     JOIN books b ON b.id = e.books_id
     WHERE r.reader_id = $1
       AND r.status IN ('active', 'ready')
       AND NOT (r.status = 'ready' AND r."expiresAt" <= now())
     ORDER BY r."createdAt" DESC`,
    [usuario.id],
  );

  return rows.map((r) => ({
    id: r.id,
    livro: { titulo: r.title, autor: r.author },
    dataSolicitacao: r.criada_em,
    dataExpiracao: r.expira_em ?? null,
    status: STATUS_PARA_FRONT[r.status],
    posicaoFila: Number(r.posicao),
  }));
}

// POST /reservas: o leitor entra na fila de um livro que está sem exemplar disponível
export async function reservarLivro(usuario, livroId) {
  if (!ehUuid(livroId)) throw new ErroHttp(400, 'Informe o livro que deseja reservar.');

  return comTransacao(async (client) => {
    // Trava o livro (2 reservas do mesmo livro)
    const livro = await client.query('SELECT id, title FROM books WHERE id = $1 FOR UPDATE', [livroId]);
    if (livro.rowCount === 0) throw new ErroHttp(404, 'Livro não encontrado.');

    await garantirLeitorSemBloqueio(client, usuario.id);

    const { rows: exemplares } = await client.query(
      `SELECT e.id,
              ${sqlExemplarLivre('e', '$2')} AS livre,
              (SELECT count(*) FROM reservations q WHERE q.exemplar_id = e.id AND q.status IN ('active', 'ready')) AS fila,
              (SELECT ld.due_at FROM loans ld WHERE ld.exemplar_id = e.id AND ld.status = 'active' LIMIT 1) AS devolve_em
       FROM exemplars e
       WHERE e.books_id = $1
       ORDER BY e."createdAt"`,
      [livroId, usuario.id],
    );

    if (exemplares.length === 0) throw new ErroHttp(400, 'Este livro ainda não tem exemplares cadastrados.');
    if (exemplares.some((e) => e.livre)) {
      throw new ErroHttp(409, 'Este livro está disponível. Faça o empréstimo diretamente.');
    }

    const jaReservou = await client.query(
      `SELECT 1 FROM reservations r
       JOIN exemplars e ON e.id = r.exemplar_id
       WHERE e.books_id = $1 AND r.reader_id = $2 AND r.status IN ('active', 'ready')
       LIMIT 1`,
      [livroId, usuario.id],
    );
    if (jaReservou.rowCount > 0) throw new ErroHttp(409, 'Você já reservou este livro.');

    const jaEstaComLivro = await client.query(
      `SELECT 1 FROM loans ld
       JOIN exemplars e ON e.id = ld.exemplar_id
       WHERE e.books_id = $1 AND ld.reader_id = $2 AND ld.status = 'active'
       LIMIT 1`,
      [livroId, usuario.id],
    );
    if (jaEstaComLivro.rowCount > 0) throw new ErroHttp(409, 'Você já está com um exemplar deste livro emprestado.');

    // Entra na fila do exemplar com menos gente esperando e que volta primeiro
    const escolhido = [...exemplares].sort(
      (a, b) =>
        Number(a.fila) - Number(b.fila) ||
        new Date(a.devolve_em ?? 0).getTime() - new Date(b.devolve_em ?? 0).getTime(),
    )[0];

    const { rows } = await client.query(
      "INSERT INTO reservations (reader_id, exemplar_id, status) VALUES ($1, $2, 'active') RETURNING id",
      [usuario.id, escolhido.id],
    );
    await registrarAuditoria(client, {
      operacao: 'reservation.created',
      ator: usuario,
      entidade: 'reservation',
      entidadeId: rows[0].id,
      detalhes: { livroId },
    });

    return { id: rows[0].id, livro: livro.rows[0].title, posicaoFila: Number(escolhido.fila) + 1 };
  });
}

// DELETE /reservas/:id: o leitor cancela a própria reserva
export async function cancelarReserva(usuario, reservaId) {
  if (!ehUuid(reservaId)) throw new ErroHttp(404, 'Reserva não encontrada.');

  await comTransacao(async (client) => {
    const { rows } = await client.query(
      'SELECT id, status, exemplar_id FROM reservations WHERE id = $1 AND reader_id = $2 FOR UPDATE',
      [reservaId, usuario.id],
    );
    const reserva = rows[0];
    if (!reserva || !['active', 'ready'].includes(reserva.status)) {
      throw new ErroHttp(404, 'Reserva não encontrada.');
    }

    await client.query(
      `UPDATE reservations SET status = 'cancelled', "cancelledAt" = now() WHERE id = $1`,
      [reservaId],
    );
    // Se o livro estava guardado para este leitor, passa para o próximo da fila
    if (reserva.status === 'ready') await promoverProximaReserva(client, reserva.exemplar_id);

    await registrarAuditoria(client, {
      operacao: 'reservation.cancelled',
      ator: usuario,
      entidade: 'reservation',
      entidadeId: reservaId,
    });
  });
}

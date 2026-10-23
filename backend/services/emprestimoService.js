import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';
import { logErro } from '../infra/logger.js';
import { comTransacao } from '../infra/transacao.js';
import { registrarAuditoria } from '../infra/auditoria.js';
import { travarSeLivre } from '../infra/disponibilidade.js';
import { localizarExemplarPorCodigo, SQL_CODIGO } from '../infra/patrimonio.js';
import { SQL_DIA_BR, SQL_JOIN_DEVOLUCAO } from '../infra/sqlEmprestimo.js';
import { ehUuid, padraoBusca, textoLimpo } from '../infra/validacao.js';
import { garantirLeitorSemBloqueio } from './multaService.js';
import { promoverProximaReserva } from './reservaService.js';
import { notificar, TIPO_DEVOLUCAO_CONFIRMADA, TIPOS_LEMBRETE } from './lembreteService.js';

const SQL_EMPRESTIMOS = `
  SELECT l.id, l.status, l.due_at, l."createdAt" AS emprestado_em,
         u.name AS leitor_nome, u.email AS leitor_email,
         b.title, b.author, ${SQL_CODIGO('e')} AS codigo,
         dev.occured_at AS devolvido_em, f.amount AS multa
  FROM loans l
  JOIN users u ON u.id = l.reader_id
  JOIN exemplars e ON e.id = l.exemplar_id
  JOIN books b ON b.id = e.books_id
  LEFT JOIN fines f ON f.loan_id = l.id
  ${SQL_JOIN_DEVOLUCAO}`;

// Linha do banco -> formato que o front espera
function paraEmprestimoDoFront(r) {
  const ativo = r.status === 'active';
  const vencido = ativo && new Date(r.due_at).getTime() < Date.now();
  return {
    id: r.id,
    leitor: { nome: r.leitor_nome, email: r.leitor_email },
    livro: { titulo: r.title, autor: r.author },
    codigoPatrimonio: r.codigo,
    dataEmprestimo: r.emprestado_em,
    dataDevolucaoPrevista: r.due_at,
    dataDevolucaoReal: r.devolvido_em ?? null,
    status: ativo ? (vencido ? 'VENCIDO' : 'ATIVO') : 'DEVOLVIDO',
    multa: r.multa === null ? undefined : Number(r.multa),
  };
}

// GET /emprestimos?busca=&status=  (bibliotecário)
export async function listarEmprestimos({ busca, status }) {
  const condicoes = [];
  const params = [];

  const padrao = padraoBusca(busca);
  if (padrao) {
    params.push(padrao);
    condicoes.push(`(u.name ILIKE $1 OR u.email ILIKE $1 OR b.title ILIKE $1 OR b.author ILIKE $1)`);
  }
  if (status === 'ATIVO') condicoes.push("(l.status = 'active' AND l.due_at >= now())");
  if (status === 'VENCIDO') condicoes.push("(l.status = 'active' AND l.due_at < now())");
  if (status === 'DEVOLVIDO') condicoes.push("l.status <> 'active'");

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${SQL_EMPRESTIMOS} ${where} ORDER BY (l.status = 'active') DESC, l."createdAt" DESC LIMIT 500`,
    params,
  );
  return rows.map(paraEmprestimoDoFront);
}

// Empréstimos de um leitor (usado em "Meu Perfil")
export async function listarEmprestimosDoLeitor(leitorId) {
  const { rows } = await pool.query(`${SQL_EMPRESTIMOS} WHERE l.reader_id = $1 ORDER BY l."createdAt" DESC`, [leitorId]);
  return rows.map(paraEmprestimoDoFront);
}

async function buscarLeitor(client, referencia) {
  const ref = textoLimpo(referencia);
  if (!ref) throw new ErroHttp(400, 'Informe o e-mail ou o ID do leitor.');

  const { rows } = ehUuid(ref)
    ? await client.query('SELECT id FROM users WHERE id = $1 AND active = true', [ref])
    : await client.query('SELECT id FROM users WHERE email = $1 AND active = true', [ref.toLowerCase()]);
  if (rows.length === 0) throw new ErroHttp(404, 'Leitor não encontrado.');
  return rows[0].id;
}

async function registrarEmprestimo(client, { leitorId, exemplarId, ator }) {
  const { rows } = await client.query(
    `INSERT INTO loans (reader_id, exemplar_id, due_at, status)
     VALUES ($1, $2,
       (((now() AT TIME ZONE 'America/Sao_Paulo')::date + $3::int) + time '23:59:59') AT TIME ZONE 'America/Sao_Paulo',
       'active')
     RETURNING id, due_at`,
    [leitorId, exemplarId, env.prazoEmprestimoDias],
  );
  const emprestimo = rows[0];

  // Se o leitor estava esperando por este exemplar, a reserva dele é concluída
  await client.query(
    `UPDATE reservations SET status = 'completed'
     WHERE reader_id = $1 AND exemplar_id = $2 AND status IN ('ready', 'active')`,
    [leitorId, exemplarId],
  );

  const livro = await client.query(
    `SELECT b.title, ${SQL_CODIGO('e')} AS codigo FROM exemplars e JOIN books b ON b.id = e.books_id WHERE e.id = $1`,
    [exemplarId],
  );

  await registrarAuditoria(client, {
    operacao: 'loan.created',
    ator,
    entidade: 'loan',
    entidadeId: emprestimo.id,
    detalhes: { leitorId, exemplarId, devolucaoPrevista: emprestimo.due_at },
  });

  return {
    id: emprestimo.id,
    livro: livro.rows[0].title,
    codigoPatrimonio: livro.rows[0].codigo,
    dataDevolucaoPrevista: emprestimo.due_at,
  };
}

// POST /emprestimos (bibliotecário registra o empréstimo para um leitor)
// leitorId aceita o UUID ou o e-mail do leitor
export async function registrarEmprestimoPelaEquipe(corpo, ator) {
  const { leitorId, codigoPatrimonio } = corpo ?? {};

  return comTransacao(async (client) => {
    const idDoLeitor = await buscarLeitor(client, leitorId);
    await garantirLeitorSemBloqueio(client, idDoLeitor);

    const exemplarId = await localizarExemplarPorCodigo(client, codigoPatrimonio);
    if (!(await travarSeLivre(client, exemplarId, idDoLeitor))) {
      throw new ErroHttp(409, 'Este exemplar não está disponível (já emprestado ou guardado para outro leitor).');
    }
    return registrarEmprestimo(client, { leitorId: idDoLeitor, exemplarId, ator });
  });
}

// POST /emprestimos/solicitar (o próprio leitor pega um livro disponível do acervo)
export async function solicitarEmprestimo(usuario, livroId) {
  if (!ehUuid(livroId)) throw new ErroHttp(400, 'Informe o livro que deseja emprestar.');

  return comTransacao(async (client) => {
    const livro = await client.query('SELECT id FROM books WHERE id = $1', [livroId]);
    if (livro.rowCount === 0) throw new ErroHttp(404, 'Livro não encontrado.');

    await garantirLeitorSemBloqueio(client, usuario.id);

    const jaEstaComLivro = await client.query(
      `SELECT 1 FROM loans ld JOIN exemplars e ON e.id = ld.exemplar_id
       WHERE e.books_id = $1 AND ld.reader_id = $2 AND ld.status = 'active' LIMIT 1`,
      [livroId, usuario.id],
    );
    if (jaEstaComLivro.rowCount > 0) throw new ErroHttp(409, 'Você já está com um exemplar deste livro emprestado.');

    // Prefere o exemplar que estava guardado para o próprio leitor; depois, o mais antigo
    const { rows: candidatos } = await client.query(
      `SELECT e.id FROM exemplars e
       WHERE e.books_id = $1
       ORDER BY (CASE WHEN EXISTS (
                   SELECT 1 FROM reservations r
                   WHERE r.exemplar_id = e.id AND r.reader_id = $2 AND r.status = 'ready' AND r."expiresAt" > now()
                 ) THEN 0 ELSE 1 END), e."createdAt", e.id`,
      [livroId, usuario.id],
    );

    for (const { id } of candidatos) {
      if (await travarSeLivre(client, id, usuario.id)) {
        return registrarEmprestimo(client, { leitorId: usuario.id, exemplarId: id, ator: usuario });
      }
    }
    throw new ErroHttp(409, 'Não há exemplares disponíveis deste livro no momento. Você pode reservá-lo.');
  });
}

// POST /emprestimos/:id/devolver (bibliotecário registra a devolução)
export async function devolverEmprestimo(emprestimoId, ator) {
  if (!ehUuid(emprestimoId)) throw new ErroHttp(404, 'Empréstimo não encontrado.');

  const resultado = await comTransacao(async (client) => {
    const { rows } = await client.query(
      `SELECT l.id, l.status, l.reader_id, l.exemplar_id,
              GREATEST(0, ${SQL_DIA_BR('now()')} - ${SQL_DIA_BR('l.due_at')}) AS dias_atraso
       FROM loans l WHERE l.id = $1 FOR UPDATE`,
      [emprestimoId],
    );
    const emprestimo = rows[0];
    if (!emprestimo) throw new ErroHttp(404, 'Empréstimo não encontrado.');
    if (emprestimo.status !== 'active') throw new ErroHttp(409, 'Este empréstimo já foi devolvido.');

    await client.query("UPDATE loans SET status = 'returned' WHERE id = $1", [emprestimoId]);

    // ADR-008: multa automática = dias de atraso x valor por dia
    const diasAtraso = Number(emprestimo.dias_atraso);
    const multa = Math.round(diasAtraso * env.multaPorDia * 100) / 100;
    if (diasAtraso > 0) {
      await client.query(
        "INSERT INTO fines (loan_id, reader_id, amount, lates_days, status) VALUES ($1, $2, $3, $4, 'pending')",
        [emprestimoId, emprestimo.reader_id, multa, diasAtraso],
      );
    }

    await registrarAuditoria(client, {
      operacao: 'loan.returned',
      ator,
      entidade: 'loan',
      entidadeId: emprestimoId,
      detalhes: { diasAtraso, multa },
    });

    // O livro voltou: se tem gente na fila de reserva, o primeiro da fila passa a ter o livro guardado
    await promoverProximaReserva(client, emprestimo.exemplar_id);

    return { id: emprestimoId, status: 'DEVOLVIDO', diasAtraso, multa };
  });

  // E-mail de confirmação: sai DEPOIS de gravar a devolução, se falhar, o cadastro continua valendo
  notificar(TIPO_DEVOLUCAO_CONFIRMADA, emprestimoId).catch((error) =>
    logErro('email.devolucao_falhou', error, { emprestimoId }),
  );

  return resultado;
}

// POST /emprestimos/:id/renovar (o próprio leitor renova um empréstimo ativo)
export async function renovarEmprestimo(usuario, emprestimoId) {
  if (!ehUuid(emprestimoId)) throw new ErroHttp(404, 'Empréstimo não encontrado.');

  return comTransacao(async (client) => {
    const { rows } = await client.query(
      `SELECT l.id, l.status, l.reader_id, l.renewal_count, (l.due_at < now()) AS vencido, e.books_id
       FROM loans l JOIN exemplars e ON e.id = l.exemplar_id
       WHERE l.id = $1 FOR UPDATE OF l`,
      [emprestimoId],
    );
    const emprestimo = rows[0];
    if (!emprestimo || emprestimo.reader_id !== usuario.id) throw new ErroHttp(404, 'Empréstimo não encontrado.');
    if (emprestimo.status !== 'active') throw new ErroHttp(409, 'Este empréstimo já foi devolvido.');
    if (emprestimo.vencido) {
      throw new ErroHttp(409, 'Empréstimo vencido não pode ser renovado. Devolva o livro na biblioteca.');
    }
    if (emprestimo.renewal_count >= env.maxRenovacoes) {
      throw new ErroHttp(409, `Limite de ${env.maxRenovacoes} renovações atingido. Devolva o livro na biblioteca.`);
    }

    await garantirLeitorSemBloqueio(client, usuario.id);

    const fila = await client.query(
      `SELECT 1 FROM reservations r JOIN exemplars e ON e.id = r.exemplar_id
       WHERE e.books_id = $1 AND r.status = 'active' LIMIT 1`,
      [emprestimo.books_id],
    );
    if (fila.rowCount > 0) {
      throw new ErroHttp(409, 'Renovação negada: há reserva na fila para este livro.');
    }

    // Soma o prazo padrão à data de devolução atual (sempre até o fim do dia, horário de Brasília)
    const atualizado = await client.query(
      `UPDATE loans
       SET due_at = (((due_at AT TIME ZONE 'America/Sao_Paulo')::date + $2::int) + time '23:59:59') AT TIME ZONE 'America/Sao_Paulo',
           renewal_count = renewal_count + 1
       WHERE id = $1
       RETURNING due_at, renewal_count`,
      [emprestimoId, env.prazoEmprestimoDias],
    );

    // Novo prazo = novos lembretes (2 dias, 1 dia e último dia)
    await client.query('DELETE FROM notifications WHERE entity_id = $1 AND type = ANY($2::text[])', [
      emprestimoId,
      TIPOS_LEMBRETE,
    ]);

    await registrarAuditoria(client, {
      operacao: 'loan.renewed',
      ator: usuario,
      entidade: 'loan',
      entidadeId: emprestimoId,
      detalhes: { renovacoes: atualizado.rows[0].renewal_count },
    });

    return {
      id: emprestimoId,
      dataDevolucaoPrevista: atualizado.rows[0].due_at,
      renovacoes: atualizado.rows[0].renewal_count,
    };
  });
}

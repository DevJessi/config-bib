import { ErroHttp } from '../infra/erros.js';
import { comTransacao } from '../infra/transacao.js';
import { registrarAuditoria } from '../infra/auditoria.js';
import { promoverProximaReserva } from './reservaService.js';

const FRASE_CONFIRMACAO = 'DESEJO_EXCLUIR_MEUS_DADOS';

// DELETE /leitores/me/lgpd 
export async function excluirMeusDados(usuario, corpo) {
  if (corpo?.confirmacao !== FRASE_CONFIRMACAO) {
    throw new ErroHttp(400, 'A frase de confirmação não confere.');
  }

  await comTransacao(async (client) => {
    const conta = await client.query('SELECT id FROM users WHERE id = $1 AND active = true FOR UPDATE', [usuario.id]);
    if (conta.rowCount === 0) throw new ErroHttp(404, 'Conta não encontrada.');

    const emprestimos = await client.query(
      "SELECT 1 FROM loans WHERE reader_id = $1 AND status = 'active' LIMIT 1",
      [usuario.id],
    );
    if (emprestimos.rowCount > 0) {
      throw new ErroHttp(409, 'Você ainda tem livros emprestados. Devolva-os antes de solicitar a exclusão dos dados.');
    }

    const multas = await client.query(
      "SELECT 1 FROM fines WHERE reader_id = $1 AND status = 'pending' LIMIT 1",
      [usuario.id],
    );
    if (multas.rowCount > 0) {
      throw new ErroHttp(409, 'Você tem multas pendentes. Quite-as na biblioteca antes de solicitar a exclusão dos dados.');
    }

    const canceladas = await client.query(
      `UPDATE reservations SET status = 'cancelled', "cancelledAt" = now()
       WHERE reader_id = $1 AND status IN ('active', 'ready')
       RETURNING exemplar_id, status`,
      [usuario.id],
    );
    for (const reserva of canceladas.rows) {
      if (reserva.status === 'ready') await promoverProximaReserva(client, reserva.exemplar_id);
    }

    await client.query(
      `UPDATE users
       SET name = 'Usuário removido', email = $2, password_hash = '!', course = NULL,
           active = false, "updateAt" = now()
       WHERE id = $1`,
      [usuario.id, `removido-${usuario.id}@anonimizado.invalid`],
    );
    await client.query('DELETE FROM notifications WHERE reader_id = $1', [usuario.id]);

    await registrarAuditoria(client, {
      operacao: 'user.anonymized',
      ator: usuario,
      entidade: 'user',
      entidadeId: usuario.id,
    });
  });

  return { message: 'Seus dados foram excluídos e sua conta foi encerrada.' };
}

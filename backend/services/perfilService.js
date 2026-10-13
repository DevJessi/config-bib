import { estaBloqueado, totalMultasPendentes } from './multaService.js';
import { pool } from '../infra/database.js';
import { listarEmprestimosDoLeitor } from './emprestimoService.js';

// GET /leitores/me/perfil: multa total, situação (bloqueado ou não) e histórico de empréstimos do leitor logado
export async function obterPerfil(usuario) {
  const [multaTotal, emprestimos] = await Promise.all([
    totalMultasPendentes(pool, usuario.id),
    listarEmprestimosDoLeitor(usuario.id),
  ]);

  return {
    multaTotal,
    statusLeitor: estaBloqueado(multaTotal) ? 'BLOQUEADO_MULTA' : 'ATIVO',
    emprestimos,
  };
}

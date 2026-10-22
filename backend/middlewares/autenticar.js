import jwt from 'jsonwebtoken';
import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';
import { paraUsuarioDoFront } from '../services/authService.js';

const SESSAO_INVALIDA = 'Sessão inválida ou expirada. Faça login novamente.';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lê o cabeçalho "Authorization: Bearer <token>" que o front envia (ver api.ts)
function extrairToken(authorization) {
  const partes = /^Bearer\s+(\S+)$/i.exec(authorization ?? '');
  if (!partes) throw new ErroHttp(401, SESSAO_INVALIDA);
  return partes[1];
}

// Use em rotas que exigem login: router.post('/', autenticar, handler)
// Depois, req.usuario tem { id, nome, email, papel }
export async function autenticar(req, res, next) {
  let payload;
  try {
    // Só aceita HS256, o algoritmo que o próprio login usa para assinar
    payload = jwt.verify(extrairToken(req.headers.authorization), env.jwtSecret, { algorithms: ['HS256'] });
  } catch (error) {
    if (error instanceof ErroHttp) throw error;
    throw new ErroHttp(401, SESSAO_INVALIDA);
  }

  if (!UUID.test(payload.sub ?? '')) throw new ErroHttp(401, SESSAO_INVALIDA);

  // Confere no banco a cada requisição: se a conta foi desativada, o token antigo deixa de valer
  const { rows } = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1 AND active = true',
    [payload.sub],
  );
  if (rows.length === 0) throw new ErroHttp(401, SESSAO_INVALIDA);

  req.usuario = paraUsuarioDoFront(rows[0]);
  next();
}

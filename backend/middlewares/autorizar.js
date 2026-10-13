import { ErroHttp } from '../infra/erros.js';

const PAPEIS_DA_EQUIPE = ['BIBLIOTECARIO', 'ADMIN'];

// O papel vem do banco (users.role = 'technician'), ele só vai mudar por código/SQL, nunca por rota da API
export function exigirBibliotecario(req, res, next) {
  if (!PAPEIS_DA_EQUIPE.includes(req.usuario?.papel)) {
    throw new ErroHttp(403, 'Apenas bibliotecários podem realizar esta ação.');
  }
  next();
}

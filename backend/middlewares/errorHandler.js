import { ErroHttp } from '../infra/erros.js';
import { logErro } from '../infra/logger.js';

// Rota que não existe (ex.: as telas que ainda não têm API no back)
export function naoEncontrado(req, res) {
  res.status(404).json({ message: 'Rota não encontrada.' });
}

export function tratarErros(error, req, res, next) {
  if (error instanceof ErroHttp) {
    return res.status(error.status).json({ message: error.message, ...error.extras });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'O corpo da requisição não é um JSON válido.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'O corpo da requisição é grande demais.' });
  }

  logErro('http.erro_interno', error, { method: req.method, url: req.originalUrl });
  return res.status(500).json({ message: 'Erro interno do servidor. Tente novamente em instantes.' });
}

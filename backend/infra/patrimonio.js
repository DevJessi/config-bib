import { ErroHttp } from './erros.js';
import { ehUuid, textoLimpo } from './validacao.js';

// Trecho SQL que calcula o código (use com o alias da tabela, ex.: SQL_CODIGO('e'))
export const SQL_CODIGO = (alias) => `('PAT-' || upper(substr(${alias}.id::text, 1, 8)))`;

// Mesmo cálculo do SQL_CODIGO, para quando o id já está em memória
export const codigoDoExemplar = (id) => `PAT-${String(id).slice(0, 8).toUpperCase()}`;

// Procura o exemplar pelo código digitado (PAT-XXXXXXXX) ou pelo UUID completo e devolve o id
export async function localizarExemplarPorCodigo(client, codigoDigitado) {
  const codigo = textoLimpo(codigoDigitado).toUpperCase();

  if (ehUuid(codigo.toLowerCase())) {
    const { rows } = await client.query('SELECT id FROM exemplars WHERE id = $1', [codigo.toLowerCase()]);
    if (rows.length === 0) throw new ErroHttp(404, 'Exemplar não encontrado para este código de patrimônio.');
    return rows[0].id;
  }

  const partes = /^PAT-([0-9A-F]{8})$/.exec(codigo);
  if (!partes) throw new ErroHttp(400, 'Código de patrimônio inválido. Use o formato PAT-XXXXXXXX.');

  const { rows } = await client.query('SELECT id FROM exemplars WHERE upper(substr(id::text, 1, 8)) = $1', [partes[1]]);
  if (rows.length === 0) throw new ErroHttp(404, 'Exemplar não encontrado para este código de patrimônio.');
  if (rows.length > 1) throw new ErroHttp(409, 'Mais de um exemplar com este código. Informe o ID completo do exemplar.');
  return rows[0].id;
}
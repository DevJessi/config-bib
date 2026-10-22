import { pool } from './database.js';

export async function comTransacao(funcao) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await funcao(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

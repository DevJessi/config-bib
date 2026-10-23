// Trecho SQL (booleano). `alias` é o alias da tabela exemplars e `paramLeitor` o placeholder do id do leitor ($2, $3...)
export const sqlExemplarLivre = (alias, paramLeitor) => `(
  NOT EXISTS (
    SELECT 1 FROM loans ld WHERE ld.exemplar_id = ${alias}.id AND ld.status = 'active'
  )
  AND NOT EXISTS (
    SELECT 1 FROM reservations rd
    WHERE rd.exemplar_id = ${alias}.id AND rd.status = 'ready' AND rd."expiresAt" > now()
      AND rd.reader_id <> ${paramLeitor}::uuid
  )
)`;

// Trava a linha do exemplar (ninguém mais empresta ele ao mesmo tempo) e confere de novo, já com a trava, se ele realmente está livre, ou seja, só chama dentro de uma transação
export async function travarSeLivre(client, exemplarId, leitorId) {
  const trava = await client.query('SELECT id FROM exemplars WHERE id = $1 FOR UPDATE', [exemplarId]);
  if (trava.rowCount === 0) return false;

  const { rows } = await client.query(
    `SELECT ${sqlExemplarLivre('e', '$2')} AS livre FROM exemplars e WHERE e.id = $1`,
    [exemplarId, leitorId],
  );
  return rows[0]?.livre === true;
}

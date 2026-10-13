// Grava um registro na tabela audit_events (já criada pela migration inicial)
export async function registrarAuditoria(client, { operacao, ator, entidade, entidadeId, detalhes = null }) {
  await client.query(
    `INSERT INTO audit_events (operation, actor_id, actor_role, entity_type, entity_id, result, details)
     VALUES ($1, $2, $3, $4, $5, 'success', $6)`,
    [
      operacao,
      ator?.id ?? null,
      ator?.papel ?? null,
      entidade,
      String(entidadeId),
      detalhes ? JSON.stringify(detalhes) : null,
    ],
  );
}

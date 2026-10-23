export const SQL_JOIN_DEVOLUCAO = `
  LEFT JOIN LATERAL (
    SELECT a.occured_at
    FROM audit_events a
    WHERE a.entity_type = 'loan' AND a.operation = 'loan.returned' AND a.entity_id = l.id::text
    ORDER BY a.occured_at DESC
    LIMIT 1
  ) dev ON true`;

// Data e horário de Brasília, coluna timestamptz
export const SQL_DIA_BR = (coluna) => `(${coluna} AT TIME ZONE 'America/Sao_Paulo')::date`;

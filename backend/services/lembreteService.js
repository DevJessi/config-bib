import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { emailConfigurado } from '../infra/mailer.js';
import { logErro, logInfo } from '../infra/logger.js';
import { SQL_DIA_BR, SQL_JOIN_DEVOLUCAO } from '../infra/sqlEmprestimo.js';
import { enviarDevolucaoConfirmada, enviarLembreteDevolucao } from './emailService.js';
import { expirarReservasVencidas } from './reservaService.js';

// Cada e-mail automático tem um "tipo". A tabela notifications (migration inicial) tem
// UNIQUE (type, entity_id): com entity_id = id do empréstimo, cada tipo sai no máximo UMA vez por empréstimo
const TIPO_POR_DIAS = { 2: 'devolucao_2_dias', 1: 'devolucao_1_dia', 0: 'devolucao_ultimo_dia' };
const DIAS_POR_TIPO = Object.fromEntries(Object.entries(TIPO_POR_DIAS).map(([dias, tipo]) => [tipo, Number(dias)]));
// Usado na renovação: apaga os lembretes antigos para o novo prazo receber os seus
export const TIPOS_LEMBRETE = Object.values(TIPO_POR_DIAS);
export const TIPO_DEVOLUCAO_CONFIRMADA = 'devolucao_confirmada';

// Se o Gmail recusar, tenta de novo nas próximas verificações, até 5x
const MAX_TENTATIVAS = 5;

// "Reserva" o direito de enviar: grava a linha em notifications com status 'failed' (tentativa 1)
// Se já existe linha que falhou antes (e ainda tem tentativas), conta mais uma tentativa
// Se já foi entregue (ou esgotou as tentativas), não devolve linha e nada é enviado
const SQL_RESERVAR_ENVIO = `
  INSERT INTO notifications (type, entity_id, reader_id, channel, status, attempts, playload)
  VALUES ($1, $2, $3, 'email', 'failed', 1, $4)
  ON CONFLICT (type, entity_id) DO UPDATE SET attempts = notifications.attempts + 1
    WHERE notifications.status = 'failed' AND notifications.attempts < $5
  RETURNING id`;

const SQL_DADOS_DO_EMPRESTIMO = `
  SELECT l.id, l.status, l.due_at, l.reader_id, u.name, u.email, b.title,
         dev.occured_at AS devolvido_em, f.amount AS multa, f.lates_days AS dias_atraso,
         (${SQL_DIA_BR('l.due_at')} - ${SQL_DIA_BR('now()')}) AS dias_restantes
  FROM loans l
  JOIN users u ON u.id = l.reader_id
  JOIN exemplars e ON e.id = l.exemplar_id
  JOIN books b ON b.id = e.books_id
  LEFT JOIN fines f ON f.loan_id = l.id
  ${SQL_JOIN_DEVOLUCAO}
  WHERE l.id = $1`;

// Envia (uma única vez) o e-mail de `tipo` do empréstimo, volta "true" se enviou.
export async function notificar(tipo, emprestimoId) {
  if (!emailConfigurado) return false;

  const { rows } = await pool.query(SQL_DADOS_DO_EMPRESTIMO, [emprestimoId]);
  const dados = rows[0];
  if (!dados) return false;

  const ehLembrete = tipo in DIAS_POR_TIPO;
  if (ehLembrete) {
    // Só vale se o empréstimo continua ativo e HOJE é mesmo o dia certo (não manda lembrete atrasado)
    if (dados.status !== 'active' || Number(dados.dias_restantes) !== DIAS_POR_TIPO[tipo]) return false;
  } else if (dados.status === 'active') {
    return false; // confirmação de devolução só para empréstimo já devolvido
  }

  const reserva = await pool.query(SQL_RESERVAR_ENVIO, [
    tipo,
    emprestimoId,
    dados.reader_id,
    JSON.stringify({ titulo: dados.title }),
    MAX_TENTATIVAS,
  ]);
  if (reserva.rowCount === 0) return false;

  try {
    const leitor = { nome: dados.name, email: dados.email };
    if (ehLembrete) {
      await enviarLembreteDevolucao(leitor, {
        titulo: dados.title,
        dataDevolucao: dados.due_at,
        diasRestantes: DIAS_POR_TIPO[tipo],
      });
    } else {
      await enviarDevolucaoConfirmada(leitor, {
        titulo: dados.title,
        devolvidoEm: dados.devolvido_em ?? new Date(),
        multa: dados.multa,
        diasAtraso: Number(dados.dias_atraso) || 0,
      });
    }
    await pool.query(`UPDATE notifications SET status = 'delivered', "deliveredAt" = now() WHERE id = $1`, [
      reserva.rows[0].id,
    ]);
    logInfo('lembrete.enviado', { tipo, emprestimoId });
    return true;
  } catch (error) {
    // Fica 'failed' na tabela e a próxima verificação tenta de novo 
    logErro('lembrete.falha_no_envio', error, { tipo, emprestimoId });
    return false;
  }
}

// Empréstimos ativos que vencem em 2 dias, 1 dia ou hoje e ainda não receberam o e-mail daquele tipo, só volta resultados a partir da hora configurada (LEMBRETES_HORA).
const SQL_LEMBRETES_DO_DIA = `
  WITH base AS (
    SELECT l.id, (${SQL_DIA_BR('l.due_at')} - ${SQL_DIA_BR('now()')}) AS dias
    FROM loans l
    JOIN users u ON u.id = l.reader_id
    WHERE l.status = 'active' AND u.active = true
  ), alvo AS (
    SELECT id, CASE dias WHEN 2 THEN '${TIPO_POR_DIAS[2]}' WHEN 1 THEN '${TIPO_POR_DIAS[1]}' WHEN 0 THEN '${TIPO_POR_DIAS[0]}' END AS tipo
    FROM base
    WHERE dias IN (0, 1, 2)
  )
  SELECT a.id, a.tipo
  FROM alvo a
  WHERE EXTRACT(HOUR FROM (now() AT TIME ZONE 'America/Sao_Paulo')) >= $1
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.type = a.tipo AND n.entity_id = a.id AND (n.status = 'delivered' OR n.attempts >= $2)
    )`;

// Confirmações de devolução que falharam há pouco (ex.: Gmail fora do ar) e ainda têm tentativas
const SQL_CONFIRMACOES_PENDENTES = `
  SELECT entity_id FROM notifications
  WHERE type = '${TIPO_DEVOLUCAO_CONFIRMADA}' AND status = 'failed' AND attempts < $1
    AND "createdAt" > now() - interval '3 days'`;

export async function enviarLembretesPendentes() {
  if (!emailConfigurado) return;

  const { rows: lembretes } = await pool.query(SQL_LEMBRETES_DO_DIA, [env.lembretesHora, MAX_TENTATIVAS]);
  for (const lembrete of lembretes) await notificar(lembrete.tipo, lembrete.id);

  const { rows: confirmacoes } = await pool.query(SQL_CONFIRMACOES_PENDENTES, [MAX_TENTATIVAS]);
  for (const confirmacao of confirmacoes) await notificar(TIPO_DEVOLUCAO_CONFIRMADA, confirmacao.entity_id);
}

// Execuções automáticas (vão funcionar sozinhas enquanto o servidor está no ar)
let intervalo = null;
let atraso = null;
let emExecucao = false;

async function executarRotinas() {
  if (emExecucao) return; 
  emExecucao = true;
  try {
    await expirarReservasVencidas();
    await enviarLembretesPendentes();
  } catch (error) {
    logErro('rotinas.erro', error);
  } finally {
    emExecucao = false;
  }
}

export function iniciarRotinas() {
  if (intervalo) return;
  // 1ª verificação logo depois da subida (recupera o que ficou pendente com o servidor desligado)
  atraso = setTimeout(executarRotinas, 10_000);
  intervalo = setInterval(executarRotinas, env.lembretesIntervaloMin * 60 * 1000);
  atraso.unref();
  intervalo.unref();
  logInfo('rotinas.iniciadas', { intervaloMin: env.lembretesIntervaloMin, horaLembretes: env.lembretesHora });
}

export function pararRotinas() {
  clearTimeout(atraso);
  clearInterval(intervalo);
  atraso = null;
  intervalo = null;
}

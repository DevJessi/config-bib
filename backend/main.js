import env from './infra/env.js';
import { pool } from './infra/database.js';
import { logErro, logInfo } from './infra/logger.js';
import { criarApp } from './app.js';
import { iniciarRotinas, pararRotinas } from './services/lembreteService.js';
import { verificarConexaoEmail } from './services/emailService.js';

// Confere se o banco responde antes de subir a API
async function prepararBanco() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    logErro('server.banco_indisponivel', error, {
      dica: 'Confira o DATABASE_URL, se o Postgres está no ar e se rodou: npm run migrations:migrate',
    });
    process.exit(1);
  }
}

// Ao receber SIGTERM (docker stop) ou Ctrl+C: para de aceitar conexões, fecha o banco e sai
function encerrarComCalma(server) {
  let encerrando = false;

  async function encerrar(sinal) {
    if (encerrando) return;
    encerrando = true;
    logInfo('server.encerrando', { sinal });

    const limite = setTimeout(() => {
      logErro('server.encerramento_forcado', new Error('tempo esgotado'));
      process.exit(1);
    }, env.shutdownTimeoutMs);
    limite.unref();

    pararRotinas();
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => encerrar('SIGTERM'));
  process.on('SIGINT', () => encerrar('SIGINT'));
}

await prepararBanco();

const server = criarApp().listen(env.port, () => {
  logInfo('server.iniciado', { port: env.port, nodeEnv: env.nodeEnv });
  verificarConexaoEmail();
  // Rotinas automáticas: e-mails de lembrete de devolução e expiração de reservas
  iniciarRotinas();
});
encerrarComCalma(server);

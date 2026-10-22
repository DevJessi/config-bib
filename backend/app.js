import express from 'express';
import cors from 'cors';
import env from './infra/env.js';
import { logInfo } from './infra/logger.js';
import healthRoutes from './routes/health.routes.js';
import leitoresRoutes from './routes/leitores.routes.js';
import authRoutes from './routes/auth.routes.js';
import perfilRoutes from './routes/perfil.routes.js';
import livrosRoutes from './routes/livros.routes.js';
import emprestimosRoutes from './routes/emprestimos.routes.js';
import reservasRoutes from './routes/reservas.routes.js';
import multasRoutes from './routes/multas.routes.js';
import { naoEncontrado, tratarErros } from './middlewares/errorHandler.js';

export function criarApp() {
  const app = express();
  app.disable('x-powered-by');

  // CORS: o navegador só deixa o front (porta 8443) chamar esta API (porta 3000) se ela autorizar
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '10kb' }));

  // Um log por requisição (método, rota, status e tempo), não vai registrar o corpo, que tem senha
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on('finish', () => {
      if (req.originalUrl.startsWith('/health')) return;
      logInfo('http.requisicao', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - inicio,
      });
    });
    next();
  });

  app.use('/health', healthRoutes);

  // O front chama http://localhost:3000/api/v1/... (ver baseURL em frontend/src/services/api.ts)
  const api = express.Router();
  api.use('/leitores/me', perfilRoutes);
  api.use('/leitores', leitoresRoutes);
  api.use('/auth', authRoutes);
  api.use('/livros', livrosRoutes);
  api.use('/emprestimos', emprestimosRoutes);
  api.use('/reservas', reservasRoutes);
  api.use('/multas', multasRoutes);
  app.use('/api/v1', api);

  app.use(naoEncontrado);
  app.use(tratarErros);

  return app;
}

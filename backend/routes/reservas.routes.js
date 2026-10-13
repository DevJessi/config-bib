import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { cancelarReserva, listarMinhasReservas, reservarLivro } from '../services/reservaService.js';

const router = Router();

// GET /api/v1/reservas/minhas: tela Minhas Reservas
router.get('/minhas', autenticar, async (req, res) => {
  res.json(await listarMinhasReservas(req.usuario));
});

// POST /api/v1/reservas: botão "Solicitar Reserva" do Acervo
router.post('/', autenticar, async (req, res) => {
  res.status(201).json(await reservarLivro(req.usuario, req.body?.livroId));
});

// DELETE /api/v1/reservas/:id: botão "Cancelar" de Minhas Reservas
router.delete('/:id', autenticar, async (req, res) => {
  await cancelarReserva(req.usuario, req.params.id);
  res.status(204).end();
});

export default router;

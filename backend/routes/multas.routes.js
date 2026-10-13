import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { exigirBibliotecario } from '../middlewares/autorizar.js';
import { listarMultasPendentes, quitarMultas } from '../services/multaService.js';

const router = Router();

// Somente para bibliotecário
// GET /api/v1/multas/pendentes?busca=: tela Quitação de Multas 
router.get('/pendentes', autenticar, exigirBibliotecario, async (req, res) => {
  res.json(await listarMultasPendentes(req.query));
});

// POST /api/v1/multas/:leitorId/quitar: quita todas as multas pendentes do leitor
router.post('/:leitorId/quitar', autenticar, exigirBibliotecario, async (req, res) => {
  res.json(await quitarMultas(req.params.leitorId, req.usuario));
});

export default router;

import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { obterPerfil } from '../services/perfilService.js';
import { excluirMeusDados } from '../services/lgpdService.js';

const router = Router();

// Depois de logado
// GET /api/v1/leitores/me/perfil: tela Meu Perfil 
router.get('/perfil', autenticar, async (req, res) => {
  res.json(await obterPerfil(req.usuario));
});

// DELETE /api/v1/leitores/me/lgpd: botão "Solicitar Exclusão (LGPD)" do Meu Perfil
router.delete('/lgpd', autenticar, async (req, res) => {
  res.json(await excluirMeusDados(req.usuario, req.body));
});

export default router;

import { Router } from 'express';
import { autenticarUsuario } from '../services/authService.js';

const router = Router();

// POST /api/v1/auth/login: tela de Login
router.post('/login', async (req, res) => {
  res.json(await autenticarUsuario(req.body));
});

export default router;

import { Router } from 'express';
import { cadastrarLeitor } from '../services/authService.js';
import { enviarBoasVindas } from '../services/emailService.js';
import { logErro } from '../infra/logger.js';

const router = Router();

// POST /api/v1/leitores: tela de Cadastro
router.post('/', async (req, res) => {
  const usuario = await cadastrarLeitor(req.body);
  res.status(201).json(usuario);

  // O e-mail de boas-vindas sai DEPOIS da resposta, caso o Gmail demore ou recuse, o cadastro já está feito e o usuário não percebe (o erro vai para o log)
  enviarBoasVindas(usuario).catch((error) => logErro('email.boas_vindas_falhou', error, { usuarioId: usuario.id }));
});

export default router;

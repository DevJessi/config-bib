import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { exigirBibliotecario } from '../middlewares/autorizar.js';
import {
  devolverEmprestimo,
  listarEmprestimos,
  registrarEmprestimoPelaEquipe,
  renovarEmprestimo,
  solicitarEmprestimo,
} from '../services/emprestimoService.js';

const router = Router();

// Tela do bibliotecário
// GET /api/v1/emprestimos?busca=&status=: tela Gestão de Empréstimos
router.get('/', autenticar, exigirBibliotecario, async (req, res) => {
  res.json(await listarEmprestimos(req.query));
});

// POST /api/v1/emprestimos: bibliotecário registra empréstimo para um leitor
router.post('/', autenticar, exigirBibliotecario, async (req, res) => {
  res.status(201).json(await registrarEmprestimoPelaEquipe(req.body, req.usuario));
});

// POST /api/v1/emprestimos/solicitar: o leitor logado pega um livro disponível do acervo
router.post('/solicitar', autenticar, async (req, res) => {
  res.status(201).json(await solicitarEmprestimo(req.usuario, req.body?.livroId));
});

// POST /api/v1/emprestimos/:id/renovar: o leitor logado renova o próprio empréstimo
router.post('/:id/renovar', autenticar, async (req, res) => {
  res.json(await renovarEmprestimo(req.usuario, req.params.id));
});

// POST /api/v1/emprestimos/:id/devolver: bibliotecário registra a devolução
router.post('/:id/devolver', autenticar, exigirBibliotecario, async (req, res) => {
  res.json(await devolverEmprestimo(req.params.id, req.usuario));
});

export default router;

import { Router } from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { exigirBibliotecario } from '../middlewares/autorizar.js';
import { cadastrarLivro, listarLivros } from '../services/livroService.js';

const router = Router();

// GET /api/v1/livros?busca=: tela Acervo 
router.get('/', autenticar, async (req, res) => {
  res.json(await listarLivros(req.query, req.usuario));
});

// Somente para bibliotecário
// POST /api/v1/livros: tela Cadastrar Livro 
router.post('/', autenticar, exigirBibliotecario, async (req, res) => {
  res.status(201).json(await cadastrarLivro(req.body, req.usuario));
});

export default router;

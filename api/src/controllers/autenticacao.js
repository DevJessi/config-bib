const router = require('express').Router();
const aut_service = require('../services/aut_service');
const { autenticar } = require('../middlewares/autenticar');

router.post('/cadastro', async (req, res) => {
  try {
    const usuario = await aut_service.cadastrar(req.body);
    res.status(201).json(usuario);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ erro: 'CPF ou EMAIL já cadastrado' });
    res.status(e.status || 500).json({ erro: e.status ? e.message : 'Erro back' });
  }
});

router.post('/login', async (req, res) => {
  try {
    res.json(await aut_service.login(req.body));
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.status ? e.message : 'Erro back' });
  }
});

router.get('/perfil', autenticar, (req, res) => res.json(req.usuario));

module.exports = router;
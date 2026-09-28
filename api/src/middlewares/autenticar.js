const jwt = require('jsonwebtoken');

exports.autenticar = (req, res, next) => {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token não existe' });
  }

  try {
    const { sub, papel } = jwt.verify(token, process.env.ASSINATURA_TOKEN, { algorithms: ['HS256'] });
    req.usuario = { id: sub, papel };
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

exports.exigirPapel = (...papeis) => (req, res, next) => {
  if (!papeis.includes(req.usuario?.papel)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
};
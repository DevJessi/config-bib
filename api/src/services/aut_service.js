const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const usuario_repositorio = require('../repositories/usuario_repositorio');

function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(cpf[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

function hashCpf(cpf) {
  return crypto.createHmac('sha256', process.env.CPF_HASH).update(cpf).digest('hex');
}

exports.cadastrar = async ({ nome, cpf, email, senha }) => {
  const cpfLimpo = String(cpf ?? '').replace(/\D/g, '');
  const erroDados =
    !nome?.trim() ? 'Nome é obrigatório'
    : !email?.trim() ? 'Email é obrigatório'
    : !cpfValido(cpfLimpo) ? 'CPF inválido'
    : typeof senha !== 'string' || senha.length < 8 ? 'Senha deve ter no mínimo 8 caracteres'
    : null;
  if (erroDados) {
    const erro = new Error(erroDados);
    erro.status = 400;
    throw erro;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  return usuario_repositorio.criar({
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    cpfHash: hashCpf(cpfLimpo),
    senhaHash,
  });
};

exports.login = async ({ email, senha }) => {
  const usuario = typeof email === 'string'
    ? await usuario_repositorio.buscarEmail(email.trim().toLowerCase())
    : null;
  const ok = usuario && typeof senha === 'string' && (await bcrypt.compare(senha, usuario.senhaHash));
  if (!ok) {
    const erro = new Error('Email ou Senha inválidos');
    erro.status = 401;
    throw erro;
  }

  const token = jwt.sign(
    { sub: usuario.id, papel: usuario.papel },
    process.env.ASSINATURA_TOKEN,
    { expiresIn: '7d' } // Token expirá em 7 dias, exigindo logar novamente
  );
  return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel } };
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../infra/env.js';
import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';

// No banco o papel é "reader" ou "technician", já o front espera LEITOR / BIBLIOTECARIO / ADMIN
const PAPEL_PARA_FRONT = {
  reader: 'LEITOR',
  technician: 'BIBLIOTECARIO',
};

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERRO_UNIQUE_VIOLATION = '23505'; // código do Postgres para "já existe" (e-mail repetido)
const BCRYPT_LIMITE_BYTES = 72; // o bcrypt ignora tudo que passa de 72 bytes da senha
// Mesma mensagem para "e-mail não existe" e "senha errada": não revela qual dos dois falhou
const CREDENCIAIS_INVALIDAS = 'E-mail ou senha incorretos.';

// Formato que o front espera
export function paraUsuarioDoFront(linha) {
  return {
    id: linha.id,
    nome: linha.name,
    email: linha.email,
    papel: PAPEL_PARA_FRONT[linha.role] ?? 'LEITOR',
  };
}

export function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validarNome(nome) {
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  if (!nomeLimpo) throw new ErroHttp(400, 'Preencha todos os campos obrigatórios.');
  if (nomeLimpo.length > 200) throw new ErroHttp(400, 'O nome pode ter no máximo 200 caracteres.');
  return nomeLimpo;
}

function validarEmail(email) {
  const emailLimpo = normalizarEmail(email);
  if (!emailLimpo) throw new ErroHttp(400, 'Preencha todos os campos obrigatórios.');
  if (emailLimpo.length > 256 || !EMAIL_VALIDO.test(emailLimpo)) {
    throw new ErroHttp(400, 'Informe um e-mail válido.');
  }
  return emailLimpo;
}

function validarSenha(senha) {
  if (typeof senha !== 'string' || !senha) throw new ErroHttp(400, 'Preencha todos os campos obrigatórios.');
  if (senha.length < 8) throw new ErroHttp(400, 'A senha deve ter pelo menos 8 caracteres.');
  if (Buffer.byteLength(senha, 'utf8') > BCRYPT_LIMITE_BYTES) {
    throw new ErroHttp(400, 'A senha deve ter no máximo 72 caracteres.');
  }
  return senha;
}

// POST /leitores
export async function cadastrarLeitor(corpo) {
  const { nome, email, senha } = corpo ?? {};
  const dados = {
    nome: validarNome(nome),
    email: validarEmail(email),
    senha: validarSenha(senha),
  };

  // A senha não vai para o banco: só o hash
  const passwordHash = await bcrypt.hash(dados.senha, env.bcryptSaltRounds);

  try {
    // O papel não vem do front: todo cadastro novo é leitor (default 'reader' da tabela)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [dados.nome, dados.email, passwordHash],
    );
    return paraUsuarioDoFront(rows[0]);
  } catch (error) {
    if (error.code === ERRO_UNIQUE_VIOLATION) {
      throw new ErroHttp(409, 'Já existe uma conta cadastrada com este e-mail.');
    }
    throw error;
  }
}

const hashDeMentira = bcrypt.hash('senha-que-nao-existe', env.bcryptSaltRounds);

function lerCredenciais(corpo) {
  const { email, senha } = corpo ?? {};
  const emailLimpo = normalizarEmail(email);
  if (!emailLimpo || typeof senha !== 'string' || !senha) {
    throw new ErroHttp(400, 'Informe o e-mail e a senha.');
  }
  return { emailLimpo, senha };
}

// POST /auth/login
export async function autenticarUsuario(corpo) {
  const { emailLimpo, senha } = lerCredenciais(corpo);

  // O cadastro não aceita senha com mais de 72 bytes, então uma maior que isso nunca está certa
  if (Buffer.byteLength(senha, 'utf8') > BCRYPT_LIMITE_BYTES) {
    throw new ErroHttp(401, CREDENCIAIS_INVALIDAS);
  }

  const { rows } = await pool.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1 AND active = true',
    [emailLimpo],
  );
  const usuario = rows[0];

  const hash = usuario ? usuario.password_hash : await hashDeMentira;
  const senhaConfere = await bcrypt.compare(senha, hash);

  if (!usuario || !senhaConfere) {
    throw new ErroHttp(401, CREDENCIAIS_INVALIDAS);
  }

  const dadosDoFront = paraUsuarioDoFront(usuario);
  const token = jwt.sign({ papel: dadosDoFront.papel }, env.jwtSecret, {
    algorithm: 'HS256',
    subject: usuario.id,
    expiresIn: env.jwtExpiresIn,
  });

  return { token, usuario: dadosDoFront };
}

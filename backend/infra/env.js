// Serve para ler as variaveis de ambiente em um só lugar

function obg(nome) {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável ${nome} não definida`);
  }
  return valor;
}

// Tira a barra do final ("http://localhost:8443/" vira "http://localhost:8443")
function semBarraFinal(url) {
  return url.replace(/\/+$/, '');
}

// Hora cheia de 0 a 23 (ex.: "8"), caso venha vazia ou invalida, usa o padrao
function horaValida(valor, padrao) {
  const hora = Number(valor);
  return valor !== undefined && valor !== '' && Number.isInteger(hora) && hora >= 0 && hora <= 23 ? hora : padrao;
}

//o Vite deste projeto roda na porta 8443
const frontendUrl = semBarraFinal(process.env.FRONTEND_URL || 'http://localhost:8443');

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: obg('DATABASE_URL'),
  // Quantas conexoes o pool do Postgres pode abrir ao mesmo tempo
  databasePoolMax: Number(process.env.DATABASE_POOL_MAX) || 10,
  // Custo do bcrypt, quanto maior, maior o custo de processamento
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  // Segredo usado para assinar os tokens de login (qualquer texto longo e aleatorio)
  jwtSecret: obg('JWT_SECRET'),
  // Por quanto tempo o token de login vale (ex.: 30m, 8h, 7d)
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // Prazo padrao de devolucao, em dias (ADR-001: 15 dias)
  prazoEmprestimoDias: Number(process.env.PRAZO_EMPRESTIMO_DIAS) || 15,
  // Quantas vezes um mesmo emprestimo pode ser renovado (cada renovacao soma o prazo padrao)
  maxRenovacoes: Number(process.env.MAX_RENOVACOES) || 2,
  // Valor da multa por dia de atraso, em reais
  multaPorDia: Number(process.env.MULTA_POR_DIA) || 1,
  // Multas pendentes acima deste valor (em reais) bloqueiam novos emprestimos e reservas (ADR-006)
  limiteBloqueioMulta: Number(process.env.LIMITE_BLOQUEIO_MULTA) || 20,
  // Dias que o livro fica guardado para quem estava na fila de reserva
  reservaDiasRetirada: Number(process.env.RESERVA_DIAS_RETIRADA) || 3,
  // Lembretes de devolucao: de quantos em quantos minutos o servidor confere e a partir de que hora (Brasilia) envia
  lembretesIntervaloMin: Number(process.env.LEMBRETES_INTERVALO_MIN) || 15,
  lembretesHora: horaValida(process.env.LEMBRETES_HORA, 8),
  // Conta do Gmail que envia os e-mails (opcional: sem elas a API funciona, so nao envia e-mail)
  emailUsuario: process.env.EMAIL_USUARIO || '',
  // Senha de app do Gmail (16 letras). O Google mostra com espacos, aqui eles sao removidos
  emailSenha: (process.env.EMAIL_SENHA || '').replace(/\s+/g, ''),
  // Endereco do front-end: vai nos botoes/links dos e-mails
  frontendUrl,
  // Enderecos que podem chamar a API pelo navegador (CORS), separados por virgula.
  // Se nao for definido, libera so o front-end acima
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origem) => semBarraFinal(origem.trim())).filter(Boolean)
    : [frontendUrl],
  // Tempo maximo para o servidor encerrar com calma ao receber SIGTERM/SIGINT
  shutdownTimeoutMs: Number(process.env.SHUTDOWN_TIMEOUT_MS) || 10000,
};

// Em producao um segredo curto deixa o token facil de falsificar
if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres em produção');
}

export default env;
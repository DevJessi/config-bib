function escrever(nivel, evento, dados) {
  const linha = JSON.stringify({ level: nivel, event: evento, ...dados });
  if (nivel === 'error') {
    console.error(linha);
  } else {
    console.log(linha);
  }
}

export function logInfo(evento, dados = {}) {
  escrever('info', evento, dados);
}

export function logAviso(evento, dados = {}) {
  escrever('warn', evento, dados);
}

export function logErro(evento, error, dados = {}) {
  escrever('error', evento, { message: error?.message, ...dados });
}

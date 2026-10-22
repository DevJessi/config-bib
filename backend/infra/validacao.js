const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ehUuid(valor) {
  return typeof valor === 'string' && UUID.test(valor);
}

export function textoLimpo(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

export function padraoBusca(busca) {
  const texto = textoLimpo(busca);
  if (!texto) return null;
  return `%${texto.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function formatarReais(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

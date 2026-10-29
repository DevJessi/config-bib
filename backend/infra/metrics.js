const contadores = new Map();
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;


export function normalizarRota(url) {
    if (!url) return 'desconhecida';
    const [caminho] = String(url).split('?');
    if (caminho.startsWith('/health')) return '/health';
    return caminho.replace(UUID_RE, ':id').replace(/\/\d+/g, '/:id');
}

function chave(prefixo, rotas) {
    return prefixo + '\u0000' + rotas;
}

function inc(mapa, k, delta = 1) {
    mapa.set(k, (mapa.get(k) ?? 0) + delta);
}

export function registrarRequest(rota, method, status, ms) {
    const statusLabel = String(status);
    inc(contadores, chave('http_requests_total', rota + '|' + method + '|' + status));
    const k = chave('http_request_duration_ms', rota + '|' + method);
    const hist = contadores.get(k) ?? { count: 0, buckets: new Map() };
    hist.count += 1;
    hist.sum += ms;
    for (const limiar of [50, 100, 250, 500, 1000, 2500, 5000]) {
        if (ms <= limiar) inc(hist.buckets, String(limiar));
    }
}

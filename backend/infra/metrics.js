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
    contadores.set(k, hist);
}

export function registrarErroInterno(rota, method) {
    inc(contadores, chave('http_errors_total', rota + '|' + method));
}

function escapeLabel(valor) {
    return String(valor).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

export function renderizarMetrics() {
    const linhas = [];

    linhas.push('# TYPE http_requests_total Requisicaoes HTTP processadas.');
    linhas.push('# TYPE http_requests_total counter');
    for (const [k, v] of contadores) {
        if (!k.startsWith('http_requests_total\u0000')) continue;
        const [rota, method, status] = k.slice('http_requests_total'.length + 1).split('|');
        linhas.push(
            'http_requests_total{route="' + escapeLabel(rota) + '",method="' + escapeLabel(method) + '".status="' + escapeLabel(status) + '"} ' + v,
        );
    }

    linhas.push('# HELP http_request_duration_ms Duracao das requisicoes em milissegundos.');
    linhas.push('# TYPE http_request_duration_ms summary');
    for (const [k, v] of contadores) {
        if (!k.startsWith('http_request_duration_ms\u0000')) continue;
        const [rota, method] = k.slice('http_request_duration_ms'.length + 1).split('|');
        const rotulo = 'route="' + escapeLabel(rota) + '",method="' + escapeLabel(method) + '"';
        linhas.push('http_request_duration_ms_count{' + rotulo + '} ' + v.count);
        linhas.push('http_request_duration_ms_sum{' + rotulo + '} ' + v.sum);
        for (const [limiar, qtd] of [...v.buckets.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
            linhas.push('http_request_duration_ms_bucket{' + rotulo + ',le="' + limiar + '"} ' + qtd);
        }
    }

    linhas.push('# HELP http_errors_total Erros internos por rota.');
    linhas.push('# TYPE http_errors_total counter');
    for (const [k, v] of contadores) {
        if (!k.startsWith('http_errors_total\u0000')) continue;
        const [rota, method] = k.slice('http_errors_total'.length + 1).split('|');
        linhas.push('http_errors_total{route="' + escapeLabel(rota) + '", method="' + escapeLabel(method) + '"} ' + v);
    }

    return linhas.join('\n') + '\n';
}

export function zerarMetrics() {
    contadores.clear();
}
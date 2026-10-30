import { describe, expect, it } from "vitest";
import { normalizarRota, zerarMetrics, registrarRequest, registrarErroInterno, renderizarMetrics } from './metrics';

describe ('metrics', () => {
    it('normaliza rotas com UUID e query string', () => {
        expect(normalizarRota('/api/v1/livros/8b2a1c10-1111-2222-3333-444455556666? busca=x')).toBe('/api/v1/livros/:id');
        expect(normalizarRota('/api/v1/leitores/12/situacao')).toBe('/api/v1/leitores/:id/situacao');
        expect(normalizarRota('/health/ready')).toBe('/health');
        expect(normalizarRota(undefined)).toBe('desconhecida');
    });

    it('acumula contadores e renderiza texto Prometheus', () => {
        zerarMetrics();
        registrarRequest('/api/v1/livros', 'GET', 200, 12);
        registrarRequest('/api/v1/livros', 'GET', 200, 80);
        registrarErroInterno('/api/v1/livros', 'GET');
        const texto = renderizarMetrics();
        expect(texto).toContain('http_requests_total{route="/api/v1/livros", method="GET".status="200"} 2');
        expect(texto).toContain('http_request_duration_ms_count{route="/api/v1/livros", method="GET"} 2');
        expect(texto).toContain('http_errors_total{route="/api/v1/livros", method="GET"} 1');
        expect(texto).toContain('# TYPE http_requests_total counter');
    });
});
import { describe, expect, it } from "vitest";
import { normalizarRota } from './metrics';

describe('normalizarRota', () => {
    it('healt', () => {
        // /health/status
        expect(normalizarRota('/health/status')).toBe('/health')

        // /health/live
        expect(normalizarRota('/health/live')).toBe('/health')
    });

    it('leitores', () => {
        expect(normalizarRota("/leitores/123e4567-e89b-12d3-a456-426614174000")).toBe('/leitores/:id');
        expect(normalizarRota("/leitores/123e4567-e89b-12d3-a456-426614174000/emprestimos/?q=harry")).toBe('/leitores/:id/emprestimos/');
        expect(normalizarRota("/leitores/123e4567-e89b-12d3-a456-426614174000/multas/?data=2026-10-27")).toBe('/leitores/:id/multas/');

    });

    it('exemplares', () => {
        expect(normalizarRota("/livros/123e4567-e89b-12d3-a456-426614174000/exemplares/1")).toBe('/livros/:id/exemplares/:id');
    });

    it.each(['', null, undefined])('rota falsy: %s', (url) => {
        expect(normalizarRota(url)).toBe('desconhecida');
    },);

    it('acumula contadores e renderiza texto Prometheus', () => {
        zeraMatrics();
        registrarRequest('/api/v1/liros', 'GET', 200, 12);
        registrarRequest('/api/v1/liros', 'GET', 200, 80);
        registrarErroInterno('/api/v1/livros', 'GET',);

        const texto = renderizarMatrics();
        expect(texto).toContain('http_resquests_total{route="/api/v1/livros",method="GET",status="200"}2');
        expect(texto).toContain('http_resquests_duration_ms_count{route="/api/v1/livros",method="GET"}2');
        expect(texto).toContain('http_errors_total{route="/api/v1/livros",method="GET"}1');
        expect(texto).toContain('# TYPE http_requests_total counter');
    });
});



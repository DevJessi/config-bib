import { describe, expect, it } from 'vitest';
import { formatarData, formatarReais, iniciais } from './formatadores';

describe('formatarData', () => {
    it('formata data ISO no padrão: dd/mm/aaaa', () => {
        expect(formatarData('2026-03-05T12:00:00.000Z')).toBe('05/03/2026');
        expect(formatarData('2026-12-31T15:00:00.000Z')).toBe('31/12/2026');
        });
    });

describe('formatarReais', () => {
    it('número decimal com vírgula e 2 casas decimais', () => {
        expect(formatarReais(12.5)).toBe('R$ 12,50');
        expect(formatarReais(1234.56)).toBe('R$ 1234,56');
    });

    it('formata zero e inteiros', () => {
        expect(formatarReais(0)).toBe('R$ 0,00');
        expect(formatarReais(3)).toBe('R$ 3,00');
    });

    it('arredonda para duas casas', () => {
        expect(formatarReais(0.456)).toBe('R$ 0,46');
    });
});

describe('iniciais', () => {
    it('retorna as iniciais dos 2 primeiros nomes em maiúsculo', () => {
        expect(iniciais('maria silva')).toBe('MS');
        expect(iniciais('João Pedro da Silva')).toBe('JP');
    });

    it('funciona com nome único', () => {
        expect(iniciais('ana')).toBe('A');
    });
});
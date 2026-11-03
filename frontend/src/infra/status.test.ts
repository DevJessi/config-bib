import { describe, expect, it } from 'vitest';
import { getDisponibilidade, getStatusClass, statusClass } from './status';

describe('statusClass', () => {
    it.each([   ['ATIVO', 'ativo'],
                ['VENCIDO', 'vencido'],
                ['DEVOLVIDO', 'devolvido'],
                ['PENDENTE', 'pendente'],
                ['CONFIRMADA', 'confirmada'],
                ['CANCELADA', 'cancelada'],
            ])('converte %s em %s', (entrada, esperado) => {
        expect(statusClass(entrada)).toBe(esperado);
    });
});

describe('getStatusClass', () => {
    it('mapeia ATIVO e DEVOLVIDO', () => {
        expect(getStatusClass('ATIVO')).toBe('ativo');
        expect(getStatusClass('DEVOLVIDO')).toBe('devolvido');
    });

    it('trata qualquer outro status como vencido', () => {
        expect(getStatusClass('VENCIDO')).toBe('vencido');
        expect(getStatusClass('qualquer-coisa')).toBe('vencido');
    });
});

describe('getDisponibilidade', () => {
    const ex = (disponivel: boolean) => ({ disponivel });

    it('informa 1 exemplar no singular', () => {
        expect(getDisponibilidade({ exemplares: [ex(true), ex(false)] })).toEqual({
            status: 'disponivel',
            texto: '1 disponível',
    });
});

  it('informa vários exemplares no plural', () => {
    expect(getDisponibilidade({ exemplares: [ex(true), ex(true), ex(true)] })).toEqual({
        status: 'disponivel',
        texto: '3 disponíveis',
        });
  });

  it('marca como indisponível quando todos estão emprestados', () => {
        expect(getDisponibilidade({ exemplares: [ex(false), ex(false)] })).toEqual({
            status: 'indisponivel',
            texto: 'Indisponível',
        });
  });

    it('informa quando o livro não tem exemplares', () => {
        expect(getDisponibilidade({ exemplares: [] })).toEqual({
            status: 'indisponivel',
            texto: 'Sem exemplares',
        });
    });
});
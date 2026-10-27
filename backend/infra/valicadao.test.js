import { describe, expect, it } from "vitest";
import { ehUuid, formatarReais, padraoBusca, textoLimpo } from './validacao.js';


describe("ehUuid", () => {
    it.each([null, undefined, 42, {}, "not-a-uuid", "123e4567-e89b-12d3-a456-42661417400g"])(
        'rejeita entrada invalida:%s',
        (valor) => {
            expect(ehUuid(valor)).toBe(false);
        },
    );

    it("aceita UUID valida em minuscula e maiuscula", () => {
        expect(ehUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        expect(ehUuid('123E4567-E89b-12D3-A456-426614174000')).toBe(true);
    });
});

describe("padraoBusca", () => {
    it.each(['', '  ', null, undefined])('retorna null para busca vazio: %s', (busca) => {
        expect(padraoBusca(busca)).toBeNull();
    });

    it('envolve a busca em curingas e escapa caracteres LIKE', () => {
        expect(padraoBusca('a%b_c\\d')).toBe('%a\\%b\\_c\\\\d%');
    });
});

describe('textoLimpo', () => {
    it('remove espaços das extremidades sem alterar o texto interno', () => {
        expect(textoLimpo('  livro de teste  ')).toBe('livro de teste');
    });

    it.each(['', '  ', null, undefined, 42])('retorna string vazia para entrada semtexto: %s', (valor) => {
        expect(textoLimpo(valor)).toBe('');

    });
});

describe('formatarReais', () => {
    it('formata centavos com virgula decimal', () => {
        expect(formatarReais(12.5)).toBe('R$ 12,50');
        expect(formatarReais(1234.56)).toBe('R$ 1234,56');
    });
});

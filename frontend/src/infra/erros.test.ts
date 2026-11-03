import { describe, expect, it } from 'vitest';
import { mensagemDaApi } from './erros';

describe('mensagemDaApi', () => {
    it('retorna a mensagem enviada pela API', () => { 
        expect(mensagemDaApi({ response: { data: { message: 'Leitor com multa' } } })).toBe('Leitor com multa');
    });

    it.each([null, undefined, 42, 'erro', new Error('falha'), {}, { response: {} }, { response: { data: {} } }])('retorna undefined quando não a mensagens: %s', (err) => {
        expect(mensagemDaApi(err)).toBeUndefined();
        },
    );
});
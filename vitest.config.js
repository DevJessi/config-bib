export default {
    test: {
        coverage: {
            provider: 'v8',
            include: ['infra/validacao.js'],
            reporter: ['text', 'html'],
        },
    },
};
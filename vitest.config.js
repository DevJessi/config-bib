export default {
    test: {
        include: ['tests/**/*.test.js'],
        coverage: {
            provider: 'v8',
            include: ['infra/validacao.js'],
            reporter: ['text', 'html'],
        },
    },
};
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
  
    test: {
        environment: 'jsdom', globals: false, setupFiles: ['./src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'],

        env: { TZ: 'America/Sao_Paulo' },
    
        coverage: {
            provider: 'v8',
            include: [
                'src/infra/**/*.ts',
                'src/services/**/*.ts',
                'src/contexts/**/*.tsx',
                'src/components/ProtectedRoute/**/*.tsx',
        ],
    
    exclude: ['src/**/*.test.{ts,tsx}'],
        },
    },
})
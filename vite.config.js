import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.js'],
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
        },
        deps: {
            inline: [
                /\/js\//,  // Incluir módulos de js para pruebas
                'vitest'
            ]
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./js', import.meta.url))
        }
    }
});

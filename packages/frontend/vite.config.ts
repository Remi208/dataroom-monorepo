import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            supported: {
                bigint: true,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'pdfjs': ['pdfjs-dist'],
                    'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-scroll-area', '@radix-ui/react-toast'],
                    'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                },
            },
        },
    },
})

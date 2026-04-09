import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        proxy: {
            '/api/v1': {
                target: 'https://firefly.cacoebloke.shop',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})

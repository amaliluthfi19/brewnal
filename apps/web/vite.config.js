import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        // Emit SVGs as files instead of data: URIs so a strict `img-src 'self'` CSP works
        assetsInlineLimit: function (filePath) { return (filePath.endsWith('.svg') ? false : undefined); },
    },
});

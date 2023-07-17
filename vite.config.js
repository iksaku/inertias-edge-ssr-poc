import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import solid from "vite-plugin-solid";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.ts',
            refresh: false,
        }),
        solid({ ssr: true }),
    ],
    ssr: {
        noExternal: ['inertia-adapter-solid']
    }
});

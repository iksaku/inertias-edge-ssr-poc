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
        noExternal: ['solid-js', 'html-entities', 'inertia-adapter-solid'],
    },
    resolve: {
        alias: {
            'util': 'node:util',
        },
        dedupe: ['solid-js', '@solidjs/meta']
    }
});

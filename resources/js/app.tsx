import { createInertiaApp } from 'inertia-adapter-solid'
import {hydrate} from 'solid-js/web'

createInertiaApp({
    resolve(name) {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
        return pages[`./pages/${name}.tsx`]
    },
    setup({ el, App, props }) {
        hydrate(() => <App {...props} />, el)
    },
})

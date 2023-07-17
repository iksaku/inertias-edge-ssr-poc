import { createInertiaApp } from 'inertia-adapter-solid'
import { decode } from "html-entities"

export default {
    async fetch(request: Request) {
        // When a Cloudflare Worker tries to "fetch" the same url that it's serving, it will
        // not trigger an infinite loop, instead, it will forward the request to the origin
        // server.
        // See: https://developers.cloudflare.com/workers/runtime-apis/fetch
        let response = await fetch(request)

        if (!response.headers.get('content-type')?.includes('text/html')) {
            // console.log('Not an HTML request, skipping...')
            return response
        }

        // console.log('Detected HTML request, inspecting for Inertia page data...')

        let head: string = undefined

        response = await new HTMLRewriter()
            .on('#app', {
                async element(element) {
                    if (!element.hasAttribute('data-page')) {
                        // console.log('Unable to find Inertia page data, skipping...')
                        return
                    }

                    const encodedData = element.getAttribute('data-page')
                    // console.log('Found Inertia (encoded) page data, decoding...', decode(encodedData))

                    let pageData
                    try {
                        pageData = JSON.parse(decode(encodedData))
                    } catch (e) {
                        console.error('Unable to parse Inertia page data:', e)
                        return
                    }

                    // console.log('Rendering Inertia page with decoded data:', pageData)

                    const { head: renderedHead, body } = await createInertiaApp({
                        id: 'app',
                        page: pageData,
                        resolve(name) {
                            const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
                            return pages[`./pages/${name}.tsx`]
                        }
                    })

                    head = renderedHead

                    element.replace(body, { html: true })
                }
            })
            .transform(response)

        // Double rewriter is used to have proper sync access to the generated head
        response = new HTMLRewriter()
            .on('head', {
                element(element) {
                    if (!head) return

                    // console.log('Appending rendered head to initial request...', head)
                    element.append(head, { html: true })
                }
            })
            .transform(response)

        return response
    }
}

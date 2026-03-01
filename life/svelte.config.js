import adapter from '@sveltejs/adapter-cloudflare'
import { sveltePreprocess } from 'svelte-preprocess'
import { mdsvex } from 'mdsvex'
import { fileURLToPath } from 'node:url'
import { remarkDocImages } from './src/lib/docs/remark-doc-images.js'

/** mdsvex powers the in-app docs system (`src/lib/docs/**`): markdown compiled to Svelte
 *  components so docs can embed components (DocButton/Figure) and use co-located images.
 *  The layout maps element styling (e.g. `##` → SectionSeparator look); remarkDocImages
 *  rewrites relative `![](./x.webp)` to the served `/docs/...` path (images copied by the
 *  doc-images Vite plugin). See src/lib/docs/. */
const mdsvexConfig = {
	extensions: ['.md'],
	layout: fileURLToPath(new URL('./src/lib/docs/_layout.svelte', import.meta.url)),
	remarkPlugins: [remarkDocImages],
}

const config = {
	// `.md` are Svelte components (mdsvex). Existing `src/lib/md/**` help files are imported with
	// `?raw` (raw strings), which bypasses this — they coexist until migrated to src/lib/docs.
	extensions: ['.svelte', '.md'],
	// mdsvex FIRST (markdown → svelte), then svelte-preprocess (ts/scss in the result).
	preprocess: [mdsvex(mdsvexConfig), sveltePreprocess()],

	kit: {
		adapter: adapter(),
	},
}

export default config

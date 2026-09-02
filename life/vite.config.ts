import { paraglideVitePlugin } from "@inlang/paraglide-js";
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { sveltePreprocess } from 'svelte-preprocess';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { syncDocImages } from './scripts/sync-doc-images.mjs';
import { remarkDocImages } from './src/lib/docs/remark-doc-images.js';

const DOCS_DIR = fileURLToPath(new URL('./src/lib/docs', import.meta.url));
const isDocImage = (f: string) =>
	f.replace(/\\/g, '/').includes('/src/lib/docs/') && /\.(webp|png|jpe?g|gif|svg|avif)$/i.test(f);

/** Mirror co-located doc images (src/lib/docs/**) into static/docs/** so `/docs/...` URLs
 *  (rewritten by remark-doc-images) resolve. Runs on build, and re-copies + reloads on change
 *  in dev (HMR for images). `yarn docs:sync` is the manual equivalent. */
function docImages(): Plugin {
	return {
		name: 'doc-images',
		buildStart() {
			syncDocImages();
		},
		configureServer(server) {
			syncDocImages();
			server.watcher.add(DOCS_DIR);
			const onChange = (file: string) => {
				if (!isDocImage(file)) return;
				syncDocImages();
				server.ws.send({ type: 'full-reload' });
			};
			server.watcher.on('add', onChange);
			server.watcher.on('change', onChange);
			server.watcher.on('unlink', onChange);
		},
	};
}

/** mdsvex powers the in-app docs system (`src/lib/docs/**`): markdown compiled to Svelte
 *  components so docs can embed components (DocButton/Figure) and use co-located images.
 *  The layout maps element styling (e.g. `##` → SectionSeparator look); remarkDocImages
 *  rewrites relative `![](./x.webp)` to the served `/docs/...` path (images copied by the
 *  doc-images Vite plugin). See src/lib/docs/. */
const mdsvexConfig = {
	extensions: ['.md'],
	layout: fileURLToPath(new URL('./src/lib/docs/_layout.svelte', import.meta.url)),
	remarkPlugins: [remarkDocImages],
};

export default defineConfig({
	plugins: [
		docImages(),
		sveltekit({
			// `.md` files are Svelte components (mdsvex).
			extensions: ['.svelte', '.md'],
			// mdsvex FIRST (markdown → svelte), then svelte-preprocess (ts/scss in the result).
			preprocess: [mdsvex(mdsvexConfig), sveltePreprocess()],
			adapter: adapter(),
			alias: { $lib: 'src/lib' }
		}),
		tailwindcss(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			strategy: ['url', 'cookie', 'baseLocale']
		})
	],
	test: {
		// Unit tests only; the Playwright e2e suite under e2e/ runs via `playwright test`.
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});

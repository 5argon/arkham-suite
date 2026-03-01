import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import { syncDocImages } from './scripts/sync-doc-images.mjs';

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

export default defineConfig({
	plugins: [
		docImages(),
		sveltekit(),
		tailwindcss(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			strategy: ['url', 'cookie', 'baseLocale']
		})
	]
});

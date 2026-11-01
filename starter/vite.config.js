// vite.config.js
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltePreprocess } from 'svelte-preprocess';

/**
 * Starter deck archives stay verbatim on disk, but the site renders each deck's
 * guide from guides/<slug>.md, so the archived copy would ship the same text twice.
 * @type {import('vite').Plugin}
 */
const stripArchivedStarterGuides = {
	name: 'strip-archived-starter-guides',
	enforce: 'pre',
	transform(code, id) {
		if (!/\/starter-content\/starter\/[^/]+\/[^/]+\/decks\/[^/]+\.json(\?|$)/.test(id)) return;
		const { description_md: _, ...deck } = JSON.parse(code);
		return { code: JSON.stringify(deck), map: null };
	}
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		stripArchivedStarterGuides,
		tailwindcss(),
		sveltekit({
			// Consult https://github.com/sveltejs/svelte-preprocess
			// for more information about preprocessors
			preprocess: sveltePreprocess(),
			adapter: adapter(),
			alias: { '$lib': 'src/lib' }
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'baseLocale']
		})
	]
};

export default config;

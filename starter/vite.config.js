// vite.config.js
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
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

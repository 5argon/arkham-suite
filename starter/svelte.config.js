import adapter from '@sveltejs/adapter-cloudflare'
import { sveltePreprocess } from 'svelte-preprocess'
// import decksJson from './src/lib/data/decks.json'
// import type { DeckEntryBeforeProcess } from './src/lib/deck/deck'
// import { Config } from '@sveltejs/kit'

// const rawDecks = decksJson as unknown as DeckEntryBeforeProcess[]

const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sveltePreprocess(),

	kit: {
		adapter: adapter({
			platformProxy: {
				// The `arkham_card_images` R2 binding in `wrangler.jsonc` is `remote: true`, so
				// adapter-cloudflare opens a remote proxy session against Cloudflare while
				// serving `vite dev`. On a machine that has never run `wrangler login` that
				// throws and every dev request answers 500. No app code reads the binding, so
				// emulate bindings locally by default; set `CF_REMOTE_BINDINGS=1` to opt back in.
				// Only affects `vite dev` — `wrangler deploy` reads `wrangler.jsonc` directly.
				remoteBindings: process.env.CF_REMOTE_BINDINGS === '1',
			},
		}),
		// prerender: { entries: rawDecks.map<`/${string}`>((x) => `/deck/${x.raw.id}`) },
	},
}

export default config

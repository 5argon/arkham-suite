import type { Config } from 'tailwindcss';

// Tailwind v4 uses CSS-based configuration (@custom-variant in app.css)
// This file is kept for compatibility with tools that expect it
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'../ui/dist/**/*.{html,js,svelte,ts}'
	]
} satisfies Config;

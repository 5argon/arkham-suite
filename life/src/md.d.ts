// mdsvex compiles `.md` files into Svelte components (see svelte.config.js). This types a direct
// static import of a doc (e.g. `import GuideDoc from '$lib/docs/guide/en.md'`) as a component.
// The lazy `import.meta.glob` path in src/lib/docs/index.ts casts its own type.
declare module '*.md' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
}

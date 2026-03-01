import type { Component } from 'svelte';
import { getLocale, baseLocale } from '$lib/paraglide/runtime.js';

/**
 * The in-app documentation system. Docs are markdown files compiled to Svelte components by mdsvex
 * (see svelte.config.js), organized folder-per-doc under `src/lib/docs/` and addressed by a string
 * path (e.g. `"widget/tsk/dead-heat"`). Each folder holds per-locale files (`en.md`, later `th.md`)
 * and any co-located images. Resolve + render with `<Doc path="..." />` (Doc.svelte).
 */

/** All doc modules, lazily loadable. Keys are project-root-absolute, e.g.
 *  '/src/lib/docs/archive/extra/en.md'. */
const modules = import.meta.glob('/src/lib/docs/**/*.md') as Record<
	string,
	() => Promise<{ default: Component }>
>;

const PREFIX = '/src/lib/docs/';

/**
 * Loader for the doc at `path` in the active locale, falling back to the base locale, or null if no
 * such doc exists. Locale is read once per render — `setLocale` reloads the page, so static
 * selection is correct (revisit if a no-reload locale switch is ever added).
 */
export function resolveDoc(path: string): (() => Promise<{ default: Component }>) | null {
	const locale = getLocale();
	return (
		modules[`${PREFIX}${path}/${locale}.md`] ?? modules[`${PREFIX}${path}/${baseLocale}.md`] ?? null
	);
}

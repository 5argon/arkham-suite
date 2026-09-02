import { resolve } from '$app/paths';

export interface LinkTarget {
	href: string | undefined;
	target: '_blank' | undefined;
	rel: 'noreferrer' | undefined;
	clickHandler: (() => void) | undefined;
}

function isExternalUrl(url: string): boolean {
	return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Turn a button's `onClick` into anchor attributes: a handler renders a `<button>` (no href),
 * a route path resolves through the app's base path, and an external URL (or `newTab`) opens in
 * a new tab.
 */
export function resolveLinkTarget(onClick: string | (() => void), newTab = false): LinkTarget {
	if (typeof onClick === 'function') {
		return { href: undefined, target: undefined, rel: undefined, clickHandler: onClick };
	}
	const external = isExternalUrl(onClick);
	const blank = external || newTab;
	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		href: external ? onClick : resolve(onClick as any),
		target: blank ? '_blank' : undefined,
		rel: blank ? 'noreferrer' : undefined,
		clickHandler: undefined
	};
}

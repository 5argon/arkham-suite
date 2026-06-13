// The tags package ships its data only as JSON (no TS-tagged cards are exported). The
// subpath is resolved at build time by Vite via the package's `exports` map; this ambient
// declaration gives it a precise type (`RawCard[]`) so `hydrate()` consumes it directly.
declare module '@5argon/arkham-tags/cards.json' {
	import type { RawCard } from '@5argon/arkham-tags';
	const cards: RawCard[];
	export default cards;
}

<!--
@component
The back button of every page, rendered by the root layout. A beginner relies on this instead of the
browser's: it follows where they came from and goes back through history, which restores what they
picked and where they scrolled, while a plain link would start a fresh visit. Otherwise it leads to
the page's parent, walking up to home, where it is the only page without one.
Pages are named in `$lib/navigation/back-routes`.
-->
<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { BackButton } from '@5argon/arkham-life-ui';

	import { backRoutes } from '$lib/navigation/back-routes';

	interface Target {
		href: string;
		label: string;
	}

	const addressOf = (url: URL) => url.pathname + url.search;

	let leaving: Target | null = null;
	let cameFrom = $state<Target | null>(null);

	const route = $derived(backRoutes[page.route.id ?? '']);
	const target: Target | null = $derived.by(() => {
		const parent = route === undefined ? '/' : route.parent;
		if (parent === null) return null;
		if (cameFrom !== null) return cameFrom;
		return { href: parent, label: backRoutes[parent]!.label({}) };
	});

	beforeNavigate(({ from, to, type, cancel }) => {
		if (type === 'link' && to !== null && !to.url.hash && addressOf(to.url) === cameFrom?.href) {
			cancel();
			history.back();
			return;
		}
		// Going up to the parent is the end of a trip back, offering to come back down again would
		// keep them bouncing between the two pages and never reach home.
		const isGoingUp = to !== null && addressOf(to.url) === target?.href;
		leaving =
			from !== null && route !== undefined && !isGoingUp
				? { href: addressOf(from.url), label: route.label(page.data) }
				: null;
	});

	afterNavigate((navigation) => {
		// Arriving with the browser's back button leaves the page they came from ahead in history,
		// where going back would not return to it.
		const previousIsBehind = navigation.type !== 'popstate' || navigation.delta === 1;
		// The first navigation of a client-rendered page has a `from` with no url, despite its type.
		const isSamePage = navigation.from?.url?.pathname === navigation.to?.url.pathname;
		cameFrom = previousIsBehind && !isSamePage ? leaving : null;
	});
</script>

{#if target !== null}
	<div class="mb-2 print:hidden">
		<BackButton label={target.label} onClick={target.href} />
	</div>
{/if}

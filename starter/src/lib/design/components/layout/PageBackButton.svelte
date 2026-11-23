<!--
@component
The back button of every page, rendered by the root layout. A beginner relies on this instead of the
browser's: it follows where they came from and goes back through history, which restores what they
picked and where they scrolled, while a plain link would start a fresh visit. Where they came from
belongs to the history entry, so it survives a reload and comes back with the browser's back and
forward buttons. Otherwise it leads to the page it belongs to, such as a card's pack page, or else the page's parent, walking up to home,
where it is the only page without one.
Pages are named in `$lib/navigation/back-routes`.
-->
<script lang="ts">
	import { afterNavigate, beforeNavigate, snapshot } from '$app/navigation';
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
		const own = route?.ownParent?.(page.data);
		if (own !== undefined) return own;
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

	// No reset: a page's own `replaceState` drops this entry's snapshot and would reset it while they
	// are still on the page. Fresh navigations set it below anyway.
	snapshot({
		id: 'page-back-button',
		capture: () => cameFrom,
		restore: (value) => {
			cameFrom = value;
		}
	});

	afterNavigate((navigation) => {
		// Landing on a page and moving through history leave it to the snapshot of that entry.
		if (navigation.type === 'enter' || navigation.type === 'popstate') return;
		// The first navigation of a client-rendered page has a `from` with no url, despite its type.
		const isSamePage = navigation.from?.url?.pathname === navigation.to?.url.pathname;
		cameFrom = isSamePage ? null : leaving;
	});
</script>

{#if target !== null}
	<div class="mb-2 print:hidden">
		<BackButton label={target.label} onClick={target.href} />
	</div>
{/if}

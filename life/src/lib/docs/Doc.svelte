<!--
@component
Renders a localized markdown doc addressed by folder path under `src/lib/docs`, e.g.
`<Doc path="widget/tsk/dead-heat" />`. Resolves `<locale>.md` with base-locale fallback and
lazy-loads its chunk. Body-only (no chrome), so it works inline (Guides page) and inside modals
(widget notes, form-field help). Renders nothing if the doc is missing or still loading.
-->
<script lang="ts">
	import { resolveDoc } from './index';

	let { path }: { path: string } = $props();

	// Static per render — setLocale reloads the page, so this resolves the right locale on load.
	const loader = $derived(resolveDoc(path));
</script>

{#if loader}
	{#await loader() then mod}
		{@const Body = mod.default}
		<Body />
	{:catch}
		<!-- Doc chunk failed to load (e.g. stale-deploy 404). Degrade silently — docs are
		     non-critical, so a load failure must never crash the host page/modal. -->
	{/await}
{/if}

<!--
@component
Shared widget date — a campaign play's finish date (ms-since-epoch) rendered as a short, muted,
locale-aware "MMM D, YYYY" (or an em dash when unrecorded). The one place per-play timestamps render
across the campaign widgets (TSK Erased From Existence, PtC random-weakness lists), so they all match.
Format lives in `format-date.ts`; callers pass the precomputed `finishDate`.
-->
<script lang="ts">
	import { formatFinishDate } from '$lib/campaign/utils/format-date';

	let { ms, class: cls = '' }: { ms: number | null | undefined; class?: string } = $props();
</script>

<span class="text-primary-400 tabular-nums whitespace-nowrap {cls}">{formatFinishDate(ms)}</span>

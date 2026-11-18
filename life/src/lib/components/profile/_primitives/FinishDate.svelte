<!-- @component A play's finish date, short and muted, or a dash when unrecorded. -->
<script lang="ts">
	import { formatFinishDate } from '$lib/campaign/utils/format-date';

	let { ms, class: cls = '' }: { ms: number | null | undefined; class?: string } = $props();
</script>

<span class="text-primary-400 tabular-nums whitespace-nowrap {cls}">{formatFinishDate(ms)}</span>

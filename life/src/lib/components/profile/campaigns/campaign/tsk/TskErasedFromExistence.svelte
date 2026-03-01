<!--
@component
TSK bespoke widget — Erased From Existence. In Dancing Mad and On Thin Ice the cell can exile a
unique card "from existence", recorded as a card-level campaign-log note (`erased_from_existence_*`).
Because it's a log fact (not deck data) it's shared across the cell, regardless of who bore the card.
Shows the 10 most recently erased unique cards — each as a CardLine, with the finish date of the
campaign it happened in. Fed by the shared `tsk` aggregate.
-->
<script lang="ts">
	import { CardLine } from '@5argon/arkham-life-ui';
	import { getAllCards } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignTsk } from '$lib/campaign/tsk-profile';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	// Resolve each erased code to its card (dropping any that don't resolve); the aggregate already
	// caps the list at 10, newest first.
	const rows = $derived(
		(tsk?.erasedFromExistence ?? []).flatMap((e) => {
			const card = byCode.get(e.code);
			return card ? [{ card, finishDate: e.finishDate }] : [];
		})
	);

	function formatDate(ms: number | null): string {
		if (ms == null) return '—';
		return new Date(ms).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

{#if rows.length}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<tbody>
				{#each rows as r (r.card.code)}
					<tr class="border-primary-100 dark:border-primary-800/60 border-b last:border-0">
						<td class="w-px py-1 pr-3"><CardLine card={r.card} hideQuantity /></td>
						<td class="text-primary-400 py-1 text-xs tabular-nums whitespace-nowrap">
							{formatDate(r.finishDate)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_erased_empty()}</p>
{/if}

<!--
@component
Per-campaign ending collection: every win / better-win / special / loss ending,
and which the player has reached across plays. "Better" wins (harder / more
heroic) are highlighted, and unreached losses surface as endings still to see.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import type { CampaignEndings, Ending, EndingKind } from '$lib/campaign/outcomes/clear-status';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';

	let { endings, showFamilyName = true }: { endings: CampaignEndings[]; showFamilyName?: boolean } =
		$props();

	const withData = $derived(endings.filter((e) => e.endings.length > 0));

	const order: EndingKind[] = ['best', 'win', 'special', 'loss'];
	function sorted(list: Ending[]): Ending[] {
		return [...list].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
	}
</script>

{#if withData.length}
	<div class="space-y-4">
		{#each withData as camp (camp.family)}
			<details class="border-primary-200 dark:border-primary-700 rounded border p-3">
				<summary class="flex cursor-pointer items-center justify-between gap-3">
					{#if showFamilyName}
						<span class="font-bold text-black dark:text-white">{camp.name}</span>
					{/if}
					<span class="text-primary-500 text-sm tabular-nums">
						{m.campaign_endings_reached({
							reached: camp.reachedCount,
							total: camp.endings.length,
						})}{#if camp.bestReached} · ★{/if}
					</span>
				</summary>
				<ul class="mt-3 space-y-1">
					{#each sorted(camp.endings) as e (e.key)}
						<li class="flex items-center gap-2 text-sm">
							<OutcomeFace kind={e.kind} label={capitalizeFirst(e.text)} reached={e.reached} />
							<span
								class="text-black dark:text-white {e.reached ? '' : 'opacity-45'}"
								title={capitalizeFirst(e.text)}>{capitalizeFirst(e.text)}</span
							>
							{#if e.count > 0}
								<span class="text-primary-500 ml-auto shrink-0 text-xs tabular-nums">×{e.count}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</details>
		{/each}
	</div>
{/if}

<!--
@component
TDE shared widget — "The Black Cat". The companion's terminal disposition across the
interconnected interludes (at your side with the Dream-Quest party / the Web of Dreams party,
or it abandoned you / grew distrustful / you went on your own), the mid-arc flags (had a hunch,
searched for the truth), and — the part the log keeps that nothing else surfaces — the trail of
messages you gave the cat across the three interludes. Reconstructed from BOTH logs (own + the
linked sibling); the message text is read verbatim from campaign-data. Full-width.
-->
<script lang="ts">
	import type { CampaignTdeShared } from '$lib/campaign/campaigns/tde-shared';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { shared }: { shared: CampaignTdeShared | null } = $props();
	const c = $derived(shared?.blackCat);
	const hasData = $derived(
		!!c &&
			c.withDreamQuest + c.withWebOfDreams + c.abandoned + c.distrustful + c.onYourOwn +
				c.hadHunch + c.searched + Object.keys(c.choices).length >
				0
	);

	// The cat's disposition + arc flags, packed 2/3/2 so it reads cleanly at any width.
	const rows = $derived<Stat[][]>(
		hasData && c
			? [
					[
						{ value: c.withDreamQuest, label: m.campaign_tde_cat_with_dream_quest() },
						{ value: c.withWebOfDreams, label: m.campaign_tde_cat_with_web_of_dreams() },
						...(c.unresolved > 0
							? [{ value: c.unresolved, label: m.campaign_tde_cat_unresolved() }]
							: [])
					],
					[
						{ value: c.abandoned, label: m.campaign_tde_cat_abandoned() },
						{ value: c.distrustful, label: m.campaign_tde_cat_distrustful() },
						{ value: c.onYourOwn, label: m.campaign_tde_cat_on_your_own() }
					],
					[
						{ value: c.hadHunch, label: m.campaign_tde_cat_hunch() },
						{ value: c.searched, label: m.campaign_tde_cat_searched() }
					]
				].filter((r) => r.length)
			: []
	);

	// The message trail, keyed by campaign_notes id → count. Order Dream-Quest choices first, then
	// the Web-of-Dreams-only ones; the text is the verbatim campaign-log entry (either arc's log).
	const CHOICE_ORDER = [
		'black_cat_delivered_news',
		'black_cat_shared_knowledge_of_the_dreamlands',
		'black_cat_spoke_of_nyarlathotep',
		'black_cat_spoke_of_atlach_nacha',
		'threaten_black_cat',
		'black_cat_warned_the_others',
		'black_cat_requested_aid',
		'black_cat_shared_knowledge_of_the_underworld'
	];
	const logA = getCampaignLog('tdea');
	const logB = getCampaignLog('tdeb');
	function noteText(id: string): string {
		const key = `campaign_notes.${id}`;
		const raw = logA?.en.entries?.[key]?.text ?? logB?.en.entries?.[key]?.text;
		if (!raw) return id;
		return capitalizeFirst(raw).replace(/\.$/, '');
	}
	const trail = $derived(
		c
			? CHOICE_ORDER.filter((id) => (c.choices[id] ?? 0) > 0).map((id) => ({
					id,
					text: noteText(id),
					count: c.choices[id]
				}))
			: []
	);
</script>

{#if hasData && c}
	<div class="@container">
		<div class="flex flex-col items-center gap-4 @md:flex-row @md:items-start @md:gap-6">
			<CardThumb code="06285" alt="The Black Cat" size="h-24 w-24" objectTop />
			<div class="flex-1 space-y-4">
				<StatNumbers {rows} />
				{#if trail.length}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_tde_cat_trail_heading()}</SectionLabel
						>
						<ul class="flex flex-col items-center gap-1 text-sm">
							{#each trail as t (t.id)}
								<li class="text-center">
									<span class="text-black dark:text-white">{t.text}</span>
									{#if t.count > 1}
										<span class="text-primary-500 tabular-nums"> ×{t.count}</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
		<p class="text-primary-500 mt-4 text-center text-xs">{m.campaign_tde_cat_note()}</p>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tde_cat_empty()}</p>
{/if}

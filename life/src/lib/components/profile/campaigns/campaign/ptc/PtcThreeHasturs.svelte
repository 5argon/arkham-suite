<!--
@component
PtC bespoke widget — the Three Hasturs. Dim Carcosa is fought against one of
three Hastur versions (chosen from doubt/conviction; the log never records
which), entered as an "Extra". This crosses that choice with the winning
outcome: which version you've faced, and which you've actually beaten.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignScenarioXp } from '$lib/campaign/extra-imports';
	import { choicesForScenario } from '$lib/campaign/scenario-extras';
	import * as m from '$lib/paraglide/messages.js';

	let { scenarioXp, code = 'ptc' }: { scenarioXp: CampaignScenarioXp[]; code?: string } = $props();

	// The full option space (I/II/III), declared on dim_carcosa in campaign-data.
	const options = $derived.by(() => {
		const log = getCampaignLog(code);
		const choice = log
			? choicesForScenario(log, 'dim_carcosa').find((c) => c.id === 'hastur_version')
			: undefined;
		return choice?.options.map((o) => o.value) ?? ['I', 'II', 'III'];
	});
	// Recorded play/won counts per chosen version (absent = never faced).
	const stats = $derived(
		new Map(
			scenarioXp
				.flatMap((c) => c.scenarios)
				.flatMap((s) => s.choices ?? [])
				.filter((ch) => ch.id === 'hastur_version')
				.flatMap((ch) => ch.values)
				.map((v) => [v.value, v]),
		),
	);
	const rows = $derived(
		options.map((opt) => {
			const s = stats.get(opt);
			return { opt, played: s?.played ?? 0, won: s?.won ?? 0 };
		}),
	);
	const anyData = $derived(rows.some((r) => r.played > 0));
</script>

{#if anyData}
	<div class="space-y-1.5">
		{#each rows as r (r.opt)}
			<div class="flex items-center gap-3 rounded border border-primary-200 dark:border-primary-700 p-2 text-sm">
				<span class="w-16 shrink-0 font-semibold text-black dark:text-white">{m.campaign_ptc_hasturs_version_label({ version: r.opt })}</span>
				{#if r.played === 0}
					<span class="text-primary-400">{m.campaign_ptc_hasturs_never_faced()}</span>
				{:else}
					<span class="text-primary-600 dark:text-primary-300">{m.campaign_ptc_hasturs_faced_count({ count: r.played })}</span>
					<span class="ml-auto shrink-0 {r.won > 0 ? 'text-secondary-600 dark:text-secondary-400' : 'text-amber-600 dark:text-amber-400'}">
						{r.won > 0 ? m.campaign_ptc_hasturs_beaten_count({ count: r.won }) : m.campaign_ptc_hasturs_never_beaten()}
					</span>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-primary-500 text-sm">
		{m.campaign_ptc_hasturs_empty()}
	</p>
{/if}

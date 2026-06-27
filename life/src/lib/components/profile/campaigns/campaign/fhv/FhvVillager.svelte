<!--
@component
FHV bespoke widget — ONE dedicated per-villager view (reused for all 8 via `villager`). Shows
the relationship score (N / max), the villager's portrait, and EVERY milestone lit/greyed,
each annotated with the scenario it's found in — a completionist "light up your favourite
character" view. Mother Rachel & Simeon Atwood carry extra story-relevant notes. Half-width.
-->
<script lang="ts">
	import { FHV_VILLAGERS, fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import * as m from '$lib/paraglide/messages.js';

	let { villager, fhv }: { villager: string; fhv: CampaignFhv | null } = $props();
	const def = $derived(FHV_VILLAGERS.find((v) => v.id === villager) ?? null);
	const t = $derived(fhv?.villagers[villager] ?? null);
	let photoFailed = $state(false);

	const SCEN: Record<string, () => string> = {
		written_in_rock: m.campaign_fhv_sc_written_in_rock,
		the_silent_heath: m.campaign_fhv_sc_silent_heath,
		the_lost_sister: m.campaign_fhv_sc_lost_sister,
		the_thing_in_the_depths: m.campaign_fhv_sc_thing_depths,
		the_twisted_hollow: m.campaign_fhv_sc_twisted_hollow,
		the_longest_night: m.campaign_fhv_sc_longest_night,
		'07_the_first_evening': m.campaign_fhv_sc_first_evening,
		'09_dawn_of_the_second_day': m.campaign_fhv_sc_second_day,
		'10_the_second_evening': m.campaign_fhv_sc_second_evening,
		'12_dawn_of_the_final_day': m.campaign_fhv_sc_final_day,
		'13_the_final_evening': m.campaign_fhv_sc_final_evening
	};
	const scenName = (s: string) => (SCEN[s] ?? (() => s))();

	// Story-relevant extras for the two pivotal villagers.
	const extras = $derived.by<{ label: string; hit: boolean }[]>(() => {
		if (villager === 'rachel' && fhv) {
			const r = fhv.rachelExtra;
			return [
				{ label: m.campaign_fhv_rachel_showed(), hit: r.showedTheWay > 0 },
				{ label: m.campaign_fhv_rachel_lost(), hit: r.lostThePath > 0 },
				{ label: m.campaign_fhv_rachel_believed(), hit: r.believed > 0 },
				{ label: m.campaign_fhv_rachel_lied(), hit: r.liedTo > 0 }
			];
		}
		if (villager === 'simeon' && fhv) {
			const s = fhv.simeonExtra;
			return [
				{ label: m.campaign_fhv_simeon_plan(), hit: s.planUnderway > 0 },
				{ label: m.campaign_fhv_simeon_fireworks(), hit: s.fireworks > 0 }
			];
		}
		return [];
	});

	const hasData = $derived(
		!!t && (t.maxScore !== null || Object.values(t.milestones).some((n) => n > 0) || t.saved > 0)
	);
</script>

{#if def && t && hasData}
	<div class="flex gap-3">
		{#if !photoFailed}
			<img
				src={portraitUrl('fhv', villager)}
				alt=""
				onerror={() => (photoFailed = true)}
				class="border-primary-200 dark:border-primary-700 h-24 w-20 shrink-0 rounded border object-cover"
			/>
		{/if}
		<div class="flex-1">
			<div class="mb-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
				<span class="text-2xl font-bold text-black tabular-nums dark:text-white">{t.maxScore ?? 0}</span>
				<span class="text-primary-400 text-sm">/ {def.max} · {m.campaign_fhv_relationship()}</span>
				{#if t.saved > 0}
					<span class="text-rogue-600 dark:text-rogue-400 ml-1 text-xs font-medium"
						>{m.campaign_fhv_saved()}</span
					>
				{/if}
			</div>
			<div class="space-y-1">
				{#each def.milestones as ms (ms.id)}
					{@const hit = (t.milestones[ms.id] ?? 0) > 0}
					<div
						class="flex items-start gap-1.5 text-xs {hit
							? 'text-black dark:text-white'
							: 'text-primary-400'}"
					>
						<span class="mt-px shrink-0">{hit ? '●' : '○'}</span>
						<span>{fhvText(`${villager}.${ms.id}`)}
							<span class="text-primary-400">· {scenName(ms.scenario)}</span></span
						>
					</div>
				{/each}
				{#if extras.length}
					<div class="border-primary-200 dark:border-primary-700 mt-2 space-y-1 border-t pt-1.5">
						{#each extras as ex (ex.label)}
							<div
								class="flex items-start gap-1.5 text-xs {ex.hit
									? 'text-black dark:text-white'
									: 'text-primary-400'}"
							>
								<span class="mt-px shrink-0">{ex.hit ? '●' : '○'}</span>
								<span>{ex.label}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_fhv_villager_empty()}</p>
{/if}

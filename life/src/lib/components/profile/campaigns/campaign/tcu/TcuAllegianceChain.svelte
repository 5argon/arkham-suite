<!--
@component
Reusable TCU Lodge/Coven allegiance chain. ALWAYS renders the five allegiance decision points in
book order (The Price of Progress · The Secret Name · The Inner Circle · Union and Disillusion · In
the Clutches of Chaos) so the whole arc is visible — a slot with no lean is drawn dimmed. Each slot
is the decision's encounter-set icon with a letter beneath: blue "L" for the Silver Twilight Lodge,
green "C" for the Coven (a superscript ² for the ×2 weight at Union, the campaign's pivot). Hover
names the exact decision. The two interludes have no encounter set, so they borrow their parent
scenario's icon (Price of Progress ← At Death's Doorstep, Inner Circle ← For the Greater Good).
Rendered through the shared IconTrack. Reused by the Lodge vs Coven spine widget.
-->
<script lang="ts">
	import { type EncounterSet } from '@5argon/arkham-kohaku';
	import { TCU_ALLEGIANCE_SOURCES, type AllegianceBead } from '$lib/campaign/campaigns/tcu';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import { allegianceIconSet, allegianceScenName } from './tcu-allegiance-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { beads, size = '1.4rem' }: { beads: AllegianceBead[]; size?: string } = $props();

	// (scenario, side) → the decision that produced this lean, for the tooltip.
	const SOURCE: Record<string, { lodge: () => string; coven: () => string }> = {
		the_price_of_progress: {
			lodge: m.campaign_tcu_alleg_src_price_lodge,
			coven: m.campaign_tcu_alleg_src_price_coven
		},
		the_secret_name: {
			lodge: m.campaign_tcu_alleg_src_secret_lodge,
			coven: m.campaign_tcu_alleg_src_secret_coven
		},
		the_inner_circle: {
			lodge: m.campaign_tcu_alleg_src_inner_lodge,
			coven: m.campaign_tcu_alleg_src_inner_coven
		},
		union_and_disillusion: {
			lodge: m.campaign_tcu_alleg_src_union_lodge,
			coven: m.campaign_tcu_alleg_src_union_coven
		},
		in_the_clutches_of_chaos: {
			lodge: m.campaign_tcu_alleg_src_clutches_lodge,
			coven: m.campaign_tcu_alleg_src_clutches_coven
		}
	};
	function earnedTitle(b: AllegianceBead): string {
		const src = SOURCE[b.scenario];
		const decision = src ? (b.side === 'lodge' ? src.lodge() : src.coven()) : b.scenario;
		const deceiving = b.deceiving ? ` ${m.campaign_tcu_alleg_deceiving_tip()}` : '';
		return `${decision}${deceiving}`;
	}
	const neutralTitle = (scenario: string) =>
		`${allegianceScenName(scenario)} — ${m.campaign_tcu_alleg_neutral()}`;
	const letter = (b: AllegianceBead) =>
		b.side === 'lodge' ? m.campaign_tcu_alleg_lodge_abbr() : m.campaign_tcu_alleg_coven_abbr();
	const tintColor = (b: AllegianceBead) =>
		b.side === 'lodge'
			? 'text-sky-600 dark:text-sky-400'
			: 'text-emerald-600 dark:text-emerald-400';
	const initials = (scenario: string) =>
		scenario
			.split('_')
			.filter((w) => !['of', 'the', 's', 'a'].includes(w))
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');

	// At most one bead per scenario per run → look the earned lean up by scenario.
	const byScenario = $derived(new Map(beads.map((b) => [b.scenario, b] as const)));

	interface AllegItem extends IconTrackItem {
		bead: AllegianceBead | undefined;
		iconSet: EncounterSet | null;
		fallback: string;
	}
	const items = $derived<AllegItem[]>(
		TCU_ALLEGIANCE_SOURCES.map((scenario) => {
			const bead = byScenario.get(scenario);
			return {
				bead,
				iconSet: allegianceIconSet(scenario),
				fallback: initials(scenario),
				tooltip: bead ? earnedTitle(bead) : neutralTitle(scenario),
				dim: !bead,
				tint: bead ? tintColor(bead) : 'text-primary-300 dark:text-primary-600'
			};
		})
	);
</script>

<IconTrack {items} {size} cellWidth="0.9em" gap="0.3em">
	{#snippet icon(it)}
		<ScenarioSetIcon iconSet={it.iconSet} fallback={it.fallback} />
	{/snippet}
	{#snippet sub(it)}
		<span class="text-[0.7rem] font-bold">
			{#if it.bead}{letter(it.bead)}{#if it.bead.amount > 1}<sup>{it.bead.amount}</sup
					>{/if}{:else}—{/if}
		</span>
	{/snippet}
</IconTrack>

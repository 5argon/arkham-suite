<!--
@component
Reusable PtC Doubt/Conviction chain. ALWAYS renders the seven Doubt/Conviction decision points
in book order (Curtain Call · Reality's Shadow · Echoes · Lost Soul · A Phantom of Truth · The
Pallid Mask · Black Stars Rise) so the whole picture is visible — a slot with no earned mark is
drawn dimmed (a neutral / not-reached outcome). Each slot is the scenario's encounter-set icon
with a small letter beneath: amber Conviction, violet Doubt (a superscript for the +2 marks at
Lost Soul / The Pallid Mask), or a muted "—" when neutral. Hover names the exact decision. The
two interludes have no encounter set of their own, so they borrow their parent scenario's icon
(The Last King / The Unspeakable Oath). Rendered through the shared IconTrack. Reused by the
Doubt & Conviction widget and the A Phantom of Truth version breakdown.
-->
<script lang="ts">
	import { getScenarioData, Scenario, type EncounterSet } from '@5argon/arkham-kohaku';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { DcBead } from '$lib/campaign/campaigns/ptc';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { beads, size = '1.4rem' }: { beads: DcBead[]; size?: string } = $props();

	// The seven sources, in book order — mirrors buildDcRun() in ptc.ts. Always all seven.
	const SOURCES = [
		'curtain_call',
		'reality_s_shadow',
		'echoes_of_the_past',
		'lost_soul',
		'a_phantom_of_truth',
		'the_pallid_mask',
		'black_stars_rise'
	];

	// Interludes carry no encounter set — borrow the parent scenario's icon.
	const ICON_SCENARIO: Record<string, string> = {
		reality_s_shadow: 'the_last_king',
		lost_soul: 'the_unspeakable_oath'
	};
	const KOHAKU = new Set<string>(Object.values(Scenario));
	function iconSet(scenario: string): EncounterSet | null {
		const id = ICON_SCENARIO[scenario] ?? scenario;
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}

	// Scenario display name (the 2 interludes aren't in campaign-data scenarioNames).
	const log = getCampaignLog('ptc');
	const INTERLUDE_NAME: Record<string, () => string> = {
		reality_s_shadow: m.campaign_ptc_dc_scen_reality,
		lost_soul: m.campaign_ptc_dc_scen_lost_soul
	};
	const scenName = (id: string) => log?.en.scenarioNames?.[id] ?? INTERLUDE_NAME[id]?.() ?? id;

	// (scenario, side) → the decision that granted this mark, for the tooltip. The 4 log sources
	// reuse their outcome messages; the 3 Extra sources name the in-scenario prompt.
	const SOURCE: Record<string, { conviction: () => string; doubt: () => string }> = {
		curtain_call: {
			conviction: m.campaign_ptc_curtain_warned,
			doubt: m.campaign_ptc_curtain_not_warned
		},
		reality_s_shadow: {
			conviction: m.campaign_ptc_lastking_slayed,
			doubt: m.campaign_ptc_lastking_intruded
		},
		echoes_of_the_past: {
			conviction: m.campaign_ptc_echoes_took_onyx,
			doubt: m.campaign_ptc_echoes_left_onyx
		},
		lost_soul: {
			conviction: m.campaign_ptc_oath_daniel_heeded,
			doubt: m.campaign_ptc_oath_daniel_ignored
		},
		a_phantom_of_truth: {
			conviction: m.campaign_ptc_dc_src_phantom,
			doubt: m.campaign_ptc_dc_src_phantom
		},
		the_pallid_mask: {
			conviction: m.campaign_ptc_dc_src_pallid,
			doubt: m.campaign_ptc_dc_src_pallid
		},
		black_stars_rise: { conviction: m.campaign_ptc_dc_src_bsr, doubt: m.campaign_ptc_dc_src_bsr }
	};
	function earnedTitle(b: DcBead): string {
		const src = SOURCE[b.scenario];
		const decision = src ? (b.side === 'conviction' ? src.conviction() : src.doubt()) : b.scenario;
		const side =
			b.side === 'conviction'
				? m.campaign_ptc_dc_conviction_full()
				: m.campaign_ptc_dc_doubt_full();
		return `${decision} (+${b.amount} ${side})`;
	}
	const neutralTitle = (scenario: string) =>
		`${scenName(scenario)} — ${m.campaign_ptc_dc_neutral()}`;
	const letter = (b: DcBead) =>
		b.side === 'conviction' ? m.campaign_ptc_dc_conviction_abbr() : m.campaign_ptc_dc_doubt_abbr();
	const tintColor = (b: DcBead) =>
		b.side === 'conviction'
			? 'text-amber-600 dark:text-amber-400'
			: 'text-violet-600 dark:text-violet-400';
	const initials = (scenario: string) =>
		scenario
			.split('_')
			.filter((w) => !['of', 'the', 's', 'a'].includes(w))
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');

	// At most one bead per scenario per run → look the earned mark up by scenario.
	const byScenario = $derived(new Map(beads.map((b) => [b.scenario, b] as const)));

	interface DcItem extends IconTrackItem {
		bead: DcBead | undefined;
		iconSet: EncounterSet | null;
		fallback: string;
	}
	const items = $derived<DcItem[]>(
		SOURCES.map((scenario) => {
			const bead = byScenario.get(scenario);
			return {
				bead,
				iconSet: iconSet(scenario),
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

<!-- @component Smoke and Mirrors: which suspects were interrogated, who was revealed as the harbinger, whether the cult was found, and the most interrogated in one play. -->
<script lang="ts">
	import {
		BOA_MARK_OF_ELOKOSS_CODE,
		BOA_SUSPECTS,
		type CampaignBoa
	} from '$lib/campaign/campaigns/boa';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { times } from '$lib/profile/plural';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: boa, ctx }: CampaignWidgetProps<CampaignBoa> = $props();

	const sm = $derived(boa?.smokeAndMirrors);
	const interrogated = $derived<LitTile[]>(
		BOA_SUSPECTS.map(({ id, code }) => {
			const n = boa?.suspects[id].interrogated.total ?? 0;
			return {
				id,
				code,
				count: n,
				detail: n
					? m.campaign_boa_interrogated_detail({ times: times(n) })
					: m.campaign_boa_never_detail()
			};
		})
	);
	const harbinger = $derived<LitTile[]>(
		BOA_SUSPECTS.map(({ id, code }) => {
			const s = boa?.suspects[id];
			const n = s?.harbinger.total ?? 0;
			const unmasked = s?.unmaskedInFinale.total ?? 0;
			const detail = [
				n ? m.campaign_boa_harbinger_detail({ times: times(n) }) : m.campaign_boa_never_detail(),
				unmasked ? m.campaign_boa_harbinger_unmasked_detail({ times: times(unmasked) }) : ''
			]
				.filter(Boolean)
				.join(' · ');
			return { id, code, count: n, detail };
		})
	);
</script>

<ScenarioInfo
	{ctx}
	headerCards={[{ code: BOA_MARK_OF_ELOKOSS_CODE, tone: 'danger', objectTop: true }]}
	empty={sm?.played.total ? null : m.campaign_boa_smoke_empty()}
>
	{#snippet stats()}
		<div class="space-y-4">
			<!-- Two 3-wide grids side by side need ~34rem; narrower, one above the other. -->
			<div class="@container">
				<div class="grid grid-cols-1 gap-4 @xl:grid-cols-2">
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_boa_interrogated_heading()}</SectionLabel
						>
						<LitTileGrid tiles={interrogated} objectTop />
					</div>
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_boa_harbinger_heading()}</SectionLabel
						>
						<LitTileGrid tiles={harbinger} objectTop />
					</div>
				</div>
			</div>
			<StatNumbers
				rows={[
					{
						heading: m.campaign_boa_most_interrogated_heading(),
						stats: (sm?.bestInterrogated ?? []).map((b) => ({
							value: b.interrogated,
							label: difficultyLabel(b.tier)
						}))
					},
					[
						{ value: sm?.totalInterrogated, label: m.campaign_boa_total_interrogated() },
						{ tally: sm?.foundTheCult, label: m.campaign_boa_found_cult() },
						{ tally: sm?.searchFailed, label: m.campaign_boa_search_failed() }
					],
					{
						heading: m.campaign_boa_six_elites_heading(),
						stats: [
							{ tally: sm?.scouredArkham, label: m.campaign_boa_scoured_arkham() },
							{ tally: sm?.stirredUpTrouble, label: m.campaign_boa_stirred_up_trouble() }
						]
					}
				]}
			/>
		</div>
	{/snippet}
</ScenarioInfo>

<!--
@component
The Achievements tab: the campaign's achievements (Return-to shared ones included) grouped by
scenario in play order, campaign-wide last. Inferred ones check themselves from the live logs.
-->
<script lang="ts">
	import {
		achievementInferScope,
		achievementsFor,
		checkPrerequisite,
		describeAchievementInference,
		evaluateAchievement,
		isCleared,
		type AchievementDef,
		type AchievementProgress,
		type CampaignLog,
		type RecordedCampaignState,
		type ResolvedAchievement,
	} from '@5argon/arkham-campaign-data';
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { tskTrustAchievements } from '$lib/campaign/campaigns/tsk/rules';
	import { tskTrustAchievementConditions } from '$lib/components/profile/campaigns/campaign/tsk/tsk-labels';
	import AchievementRow from './AchievementRow.svelte';
	import { scenarioTitle } from '../scenario-title';

	interface Props {
		log: CampaignLog;
		recorded: RecordedCampaignState;
		/** Manual tick keys (see `manualTickKey`). */
		manual: Set<string>;
		onToggle: (def: AchievementDef, itemId: string | undefined, earned: boolean) => void;
	}

	let { log, recorded, manual, onToggle }: Props = $props();

	// TSK's `lifeInfer` Trust achievements need Extra inputs campaign-data's rules can't express.
	function progressFor(def: AchievementDef): AchievementProgress {
		if (def.lifeInfer && (def.id === 'trust_nobody' || def.id === 'trust_everybody')) {
			return {
				earned: tskTrustAchievements({
					recordedLogs: recorded.recordedLogs ?? new Set<string>(),
					crossedLogs: recorded.crossedLogs,
					scenarioChoices: recorded.scenarioChoiceValues,
					finalChaosBag: recorded.finalChaosBag,
					won: isCleared(log, recorded) === true,
				})[def.id],
			};
		}
		return evaluateAchievement(def, recorded);
	}

	/** The gear modal's condition lines. */
	function conditionsFor(def: AchievementDef): string[] {
		const fromRule = describeAchievementInference(def, log);
		if (fromRule.length) return fromRule;
		return def.lifeInfer ? tskTrustAchievementConditions(def.id) : [];
	}

	interface Group {
		key: string;
		title: string;
		items: ResolvedAchievement[];
	}

	const groups = $derived.by((): Group[] => {
		const all = achievementsFor(log);
		const byScenario = new Map<string, ResolvedAchievement[]>();
		const wide: ResolvedAchievement[] = [];
		for (const a of all) {
			if (a.def.scenario) {
				const arr = byScenario.get(a.def.scenario);
				if (arr) arr.push(a);
				else byScenario.set(a.def.scenario, [a]);
			} else {
				wide.push(a);
			}
		}
		const out: Group[] = [];
		for (const code of log.db.scenarios) {
			const items = byScenario.get(code);
			if (items) {
				out.push({ key: code, title: scenarioTitle(log, code), items });
				byScenario.delete(code);
			}
		}
		// Any scenario not in the ordered list (e.g. ArkhamCards numeric-prefixed ids).
		for (const [code, items] of byScenario) out.push({ key: code, title: scenarioTitle(log, code), items });
		if (wide.length) out.push({ key: '__wide', title: m.archive_ach_campaign_wide(), items: wide });
		return out;
	});
</script>

<div class="mt-4 max-w-xl space-y-5">
	{#each groups as group (group.key)}
		<div class="space-y-2">
			<SectionSeparator title={group.title} />
			<ul class="space-y-3">
				{#each group.items as a (a.def.id)}
					<AchievementRow
						resolved={a}
						progress={progressFor(a.def)}
						scope={achievementInferScope(a.def)}
						conditions={conditionsFor(a.def)}
						{manual}
						prereq={a.def.requires ? checkPrerequisite(a.def, recorded) : 'ok'}
						onToggle={(itemId, earned) => onToggle(a.def, itemId, earned)}
					/>
				{/each}
			</ul>
		</div>
	{/each}
</div>

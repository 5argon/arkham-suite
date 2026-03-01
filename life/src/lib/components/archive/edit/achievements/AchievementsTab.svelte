<!--
@component
The Achievements tab. Lists every achievement for the campaign (including the
`shared` ones campaign-data injects from a Return-to box), grouped by the
scenario each is earned in (in `db.scenarios` play order, campaign-wide last).
Inferred achievements auto-check from the live recorded state; manual ones are
ticked and persisted. Read-only when the player cannot edit.
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
	import { tskTrustAchievementConditions, tskTrustAchievements } from '$lib/campaign/tsk-profile';
	import AchievementRow from './AchievementRow.svelte';

	interface Props {
		log: CampaignLog;
		recorded: RecordedCampaignState;
		/** All manual tick keys: `def.id` and `def.id::itemId`. */
		manual: Set<string>;
		canEdit: boolean;
		onToggle: (def: AchievementDef, itemId: string | undefined, earned: boolean) => void;
	}

	let { log, recorded, manual, canEdit, onToggle }: Props = $props();

	function humanize(code: string): string {
		return code.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	// arkham.life can auto-check `lifeInfer` achievements (Extra-aware) that the DSL can't express.
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

	// Condition lines for the gear modal — from the rule, or (for the rule-less lifeInfer ones) from life.
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
				out.push({ key: code, title: humanize(code), items });
				byScenario.delete(code);
			}
		}
		// Any scenario not in the ordered list (e.g. ArkhamCards numeric-prefixed ids).
		for (const [code, items] of byScenario) out.push({ key: code, title: humanize(code), items });
		if (wide.length) out.push({ key: '__wide', title: 'Throughout the campaign', items: wide });
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
						recordable={canEdit}
						{manual}
						prereq={a.def.requires ? checkPrerequisite(a.def, recorded) : 'ok'}
						onToggle={(itemId, earned) => onToggle(a.def, itemId, earned)}
					/>
				{/each}
			</ul>
		</div>
	{/each}
</div>

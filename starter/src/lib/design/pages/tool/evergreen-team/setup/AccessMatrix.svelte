<!--
@component
Card Access Summary: one row per class (neutral excluded), one column per
level band. Each cell holds the strips of the selected team members whose
deckbuilding reaches that spot, so overlapping access - members competing for
the same physical copies - is visible before the team is locked in.
-->
<script lang="ts">
	import { CardStrip, ImageIconClassSlots } from '@5argon/arkham-life-ui';
	import { type Card, CardClass } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import { accessSummary } from '$lib/tool/evergreen-team/pool';

	interface Prop {
		/**
		 * The selected team, in player order.
		 */
		investigators: Card[];
	}
	const { investigators }: Prop = $props();

	const classes = [
		CardClass.Guardian,
		CardClass.Seeker,
		CardClass.Rogue,
		CardClass.Mystic,
		CardClass.Survivor
	];
	const bands: { label: () => string; min: number }[] = [
		{ label: () => m.tool_evergreen_team_access_lv0(), min: 0 },
		{ label: () => m.tool_evergreen_team_access_lv1_2(), min: 1 },
		{ label: () => m.tool_evergreen_team_access_lv3_5(), min: 3 }
	];

	function membersReaching(cardClass: CardClass, bandMin: number): Card[] {
		return investigators.filter((investigator) =>
			accessSummary(investigator).lines.some(
				(line) => line.cardClass === cardClass && line.max >= bandMin
			)
		);
	}
</script>

<div class="overflow-x-auto">
	<table class="access-matrix w-full">
		<thead>
			<tr>
				<th></th>
				{#each bands as band (band.min)}
					<th class="text-primary-900 dark:text-primary-100">{band.label()}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each classes as cardClass (cardClass)}
				<tr>
					<th class="text-primary-900 dark:text-primary-100 class-header">
						<span class="flex items-center gap-1.5">
							<ImageIconClassSlots classSlots={{ class1: cardClass }} />
							{stringUtils.cardClass(cardClass)}
						</span>
					</th>
					{#each bands as band (band.min)}
						<td>
							<div class="flex flex-row flex-wrap items-center gap-1">
								{#each membersReaching(cardClass, band.min) as member (member.code)}
									<CardStrip card={member} />
								{/each}
							</div>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.access-matrix th,
	.access-matrix td {
		border: 1px solid var(--color-primary-300);
		padding: 0.25rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	.access-matrix thead th {
		font-size: 0.875rem;
	}

	.class-header {
		font-size: 0.875rem;
		white-space: nowrap;
		width: 1%;
	}

	:global(.dark) .access-matrix th,
	:global(.dark) .access-matrix td {
		border-color: var(--color-primary-700);
	}
</style>

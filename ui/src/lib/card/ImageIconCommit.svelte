<!--
@component
This correctly checks if the card is an investigator then it won't
misinterpret the data as commit icons.
-->
<script lang="ts">
	import { CardType, SkillIcon, type Card } from '@5argon/arkham-kohaku';
	import ImageIconSkill from './ImageIconSkill.svelte';
	interface Prop {
		card: Card;
		/**
		 * Investigator stats at or above this value render emphasized (dark
		 * red), so beginners spot an investigator's strengths at a glance.
		 */
		highlightAtLeast?: number;
		/**
		 * Investigator stats at or below this value render dimmed (grey), so
		 * weaknesses stand out as much as strengths.
		 */
		dimAtMost?: number;
	}
	const { card, highlightAtLeast, dimAtMost }: Prop = $props();

	function statClass(amount: number): string {
		if (highlightAtLeast !== undefined && amount >= highlightAtLeast) {
			return 'text-survivor-700 dark:text-survivor-400 font-bold';
		}
		if (dimAtMost !== undefined && amount <= dimAtMost) {
			return 'text-primary-400 dark:text-primary-500';
		}
		return 'dark:text-white';
	}
</script>

{#snippet investigatorSkill(amount: number, skill: SkillIcon)}
	<span
		class="bg-primary-100 dark:bg-primary-800 flex h-5 shrink-0 cursor-default items-center gap-0.5 rounded p-1 select-none"
		><span class={statClass(amount)}>{amount}</span>
		<ImageIconSkill icon={skill} />
	</span>
{/snippet}

{#if card.cardType === CardType.Asset || card.cardType === CardType.Event || card.cardType === CardType.Skill}
	<span class="flex items-center">
		{#each { length: card.skillWillpower ?? 0 }}
			<ImageIconSkill icon={SkillIcon.Willpower} />
		{/each}
		{#each { length: card.skillIntellect ?? 0 }}
			<ImageIconSkill icon={SkillIcon.Intellect} />
		{/each}
		{#each { length: card.skillCombat ?? 0 }}
			<ImageIconSkill icon={SkillIcon.Combat} />
		{/each}
		{#each { length: card.skillAgility ?? 0 }}
			<ImageIconSkill icon={SkillIcon.Agility} />
		{/each}
		{#each { length: card.skillWild ?? 0 }}
			<ImageIconSkill icon={SkillIcon.Wild} />
		{/each}
	</span>
{:else if card.cardType === CardType.Investigator}
	<!-- Intrinsically sized: squeezed containers (table cells, tight rows) must not shrink the chips. -->
	<span class="flex w-max items-center gap-1">
		{@render investigatorSkill(card.skillWillpower ?? 0, SkillIcon.Willpower)}
		{@render investigatorSkill(card.skillIntellect ?? 0, SkillIcon.Intellect)}
		{@render investigatorSkill(card.skillCombat ?? 0, SkillIcon.Combat)}
		{@render investigatorSkill(card.skillAgility ?? 0, SkillIcon.Agility)}
	</span>
{/if}

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
	}
	const { card }: Prop = $props();
</script>

{#snippet investigatorSkill(amount: number, skill: SkillIcon)}
	<span
		class="bg-primary-100 dark:bg-primary-800 flex h-5 cursor-default select-none items-center gap-0.5 rounded p-1"
		><span class="dark:text-white">{amount}</span>
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
	<span class="flex items-center gap-1">
		{@render investigatorSkill(card.skillWillpower ?? 0, SkillIcon.Willpower)}
		{@render investigatorSkill(card.skillIntellect ?? 0, SkillIcon.Intellect)}
		{@render investigatorSkill(card.skillCombat ?? 0, SkillIcon.Combat)}
		{@render investigatorSkill(card.skillAgility ?? 0, SkillIcon.Agility)}
	</span>
{/if}

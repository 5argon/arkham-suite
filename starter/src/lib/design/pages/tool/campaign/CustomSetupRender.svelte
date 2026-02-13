<script lang="ts">
	import {
		type EncounterSet,
		isEncounterSetWithModification,
		type ScenarioSetupSub
	} from '$lib/core/campaign';
	import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
	import { ChaosTokenDisplay, FaIcon, FaIconType } from '@5argon/arkham-life-ui';
	import { Campaign as KohakuCampaign, ChaosToken } from '@5argon/arkham-kohaku';

	import EncounterIconWithLabel from './EncounterIconWithLabel.svelte';
	import { m } from '@5argon/arkham-string';
	import type { Snippet } from 'svelte';

	interface Props {
		setup: ScenarioSetupSub;
		notCommon?: boolean;
		campaign?: KohakuCampaign;
	}

	let { setup, notCommon = false, campaign = undefined }: Props = $props();

	function parseMarkdown(text: string): string {
		// Replace **bold** with <strong>bold</strong>
		let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		// Replace *italic* with <em>italic</em>
		parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
		// Replace [number]x with [number]×
		parsed = parsed.replace(/(\d+)x/g, '$1×');
		return parsed;
	}

	function getTopicIcon(): FaIconType | undefined {
		if (!campaign) return undefined;

		// The Forgotten Age uses Exploration Deck
		if (
			campaign === KohakuCampaign.TheForgottenAge ||
			campaign === KohakuCampaign.ReturnToTheForgottenAge
		) {
			return FaIconType.SetupReferenceExplorationDeck;
		}

		// The Circle Undone uses Spectral Deck
		if (
			campaign === KohakuCampaign.TheCircleUndone ||
			campaign === KohakuCampaign.ReturnToTheCircleUndone
		) {
			return FaIconType.SetupReferenceSpectralDeck;
		}

		// The Scarlet Keys uses Concealed Mini-Cards
		if (campaign === KohakuCampaign.TheScarletKeys) {
			return FaIconType.SetupReferenceConcealedMiniCards;
		}

		return undefined;
	}
</script>

{#snippet difficultyTokens(tokens: ChaosToken[] | undefined)}
	{#if tokens !== undefined}
		{#each tokens as gc, i (i)}
			<ChaosTokenDisplay token={gc} hideLabel />
		{/each}
	{:else}
		-
	{/if}
{/snippet}

{#snippet difficultySection(labelFn: () => string, tokens: ChaosToken[] | undefined)}
	<div class="flex items-center gap-1">
		<span class="text-primary-700 dark:text-primary-300">{labelFn()}</span>
		{@render difficultyTokens(tokens)}
	</div>
{/snippet}

{#snippet levelTwo(topic: string, content: Snippet)}
	<div class="pl-4 flex items-center gap-2 my-1">
		<span class="text-primary-700 dark:text-primary-300">{topic}:</span>
		<span class="text-primary-700 dark:text-primary-300">
			{@render content()}
		</span>
	</div>
{/snippet}

{#snippet encounterIcon(set: EncounterSet)}
	{@const flag = getEncounterSetFlag(set.kohakuEncounterSet)}
	<EncounterIconWithLabel
		coreSet={flag === 'core'}
		returnToSet={flag === 'return-to'}
		scenarioSet={flag === 'scenario'}
		kohakuEncounterSet={set.kohakuEncounterSet}
	/>
{/snippet}

<ul class="custom">
	{#if setup.addBasicWeakness !== undefined || setup.addChaosToken !== undefined || setup.addChaosTokenPerDifficulty !== undefined}
		{#if !notCommon}
			<div class="my-1">
				<FaIcon duotone icon={FaIconType.SetupReferenceSetupChanges} />
				<span class="text-primary-700 dark:text-primary-300">Setup Changes</span>
			</div>
		{/if}
		<div
			class={notCommon
				? 'pl-4 border-l-2 border-secondary-700/50 dark:border-secondary-300/50'
				: ''}
		>
			{#if setup.addBasicWeakness !== undefined}
				{@render levelTwo('Add ' + m.playerCategoryBasicWeakness(), basicWeaknessContent)}
			{/if}

			{#snippet basicWeaknessContent()}
				{#if setup.addBasicWeakness}
					<span class="italic">
						{setup.addBasicWeakness.map((x) => x.trait).join(', ')}
					</span>
				{/if}
			{/snippet}

			{#if setup.addChaosToken !== undefined || setup.addChaosTokenPerDifficulty !== undefined}
				{@render levelTwo('Add Chaos Token', chaosTokenContent)}
			{/if}

			{#snippet chaosTokenContent()}
				{#if setup.addChaosToken !== undefined}
					{#each setup.addChaosToken as gc, i (i)}
						<ChaosTokenDisplay token={gc} />
					{/each}
				{:else if setup.addChaosTokenPerDifficulty !== undefined}
					<div class="flex flex-wrap gap-x-2 gap-y-1">
						{@render difficultySection(m.gameDifficultyEasy, setup.addChaosTokenPerDifficulty.easy)}
						{@render difficultySection(
							m.gameDifficultyStandard,
							setup.addChaosTokenPerDifficulty.standard
						)}
						{@render difficultySection(m.gameDifficultyHard, setup.addChaosTokenPerDifficulty.hard)}
						{@render difficultySection(
							m.gameDifficultyExpert,
							setup.addChaosTokenPerDifficulty.expert
						)}
					</div>
				{/if}
			{/snippet}
		</div>
	{/if}
	{#if setup.notes !== undefined}
		<div class="mt-2">
			{#if !notCommon}
				<div class="my-1">
					<FaIcon duotone icon={FaIconType.SetupReferenceNotes} />
					<span class="text-primary-700 dark:text-primary-300">Notes</span>
				</div>
			{/if}
			{#each setup.notes as n, i (i)}
				<div
					class={notCommon
						? 'pl-4 border-l border-secondary-700/20 dark:border-secondary-300/20'
						: 'note-pad'}
				>
					{#if n.encounterSet !== undefined}
						{@const flag = getEncounterSetFlag(n.encounterSet.kohakuEncounterSet)}
						<EncounterIconWithLabel
							coreSet={flag === 'core'}
							returnToSet={flag === 'return-to'}
							scenarioSet={flag === 'scenario'}
							kohakuEncounterSet={n.encounterSet.kohakuEncounterSet}
							subText={n.what}
						/>
					{:else}
						{#if n.topic !== undefined}
							{@const topicIcon = getTopicIcon()}
							<span
								class="inline-flex items-center border rounded-l px-2 mr-1 text-sm border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
							>
								{#if topicIcon !== undefined}
									<span class="flex mr-1.5"><FaIcon duotone icon={topicIcon} /></span>
								{/if}
								{n.topic}
							</span>
						{/if}
						<span class="text-sm text-primary-500 dark:text-primary-300"
							>{@html parseMarkdown(n.what)}</span
						>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	{#if setup.specialGather !== undefined}
		<div class="my-1">
			<FaIcon duotone icon={FaIconType.SetupReferenceAdditionalCards} />
			<span class="text-primary-700 dark:text-primary-300">Additional Cards</span>
		</div>
		<div
			class={notCommon ? 'pl-4 border-l border-secondary-700/20 dark:border-secondary-300/20' : ''}
		>
			{#each setup.specialGather as sg, i (i)}
				{#if isEncounterSetWithModification(sg)}
					{@const flag = getEncounterSetFlag(sg.encounterSet.kohakuEncounterSet)}
					<EncounterIconWithLabel
						coreSet={flag === 'core'}
						returnToSet={flag === 'return-to'}
						scenarioSet={flag === 'scenario'}
						kohakuEncounterSet={sg.encounterSet.kohakuEncounterSet}
						subText={sg.what?.join(', ')}
					/>
				{:else}
					{@render encounterIcon(sg)}
				{/if}
			{/each}
		</div>
	{/if}
</ul>

<style>
	.custom {
		color: grey;
		font-size: small;
	}

	.note-pad {
		padding-bottom: 2px;
	}

	ul {
		list-style: none;
		padding-inline-start: 0px;
	}
</style>

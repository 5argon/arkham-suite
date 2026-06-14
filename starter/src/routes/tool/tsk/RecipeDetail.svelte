<script lang="ts">
	import { Button } from '@5argon/arkham-life-ui';
	import { labelFor, resolveRecipe, type Locale, type Recipe } from '@5argon/arkham-tsk-solver';
	import { stepIcon, stepTitle } from './helpers';
	import ScenarioIcons from './ScenarioIcons.svelte';

	interface Props {
		recipe: Recipe;
		locale: Locale;
		shareUrl: string;
		onBack: () => void;
	}
	let { recipe, locale, shareUrl, onBack }: Props = $props();

	const resolved = $derived(resolveRecipe(recipe, locale));
	let copied = $state(false);

	async function share() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			setTimeout(() => (copied = false), 1800);
		} catch {
			copied = false;
		}
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<div class="font-heading text-2xl text-primary-900 dark:text-primary-100">
				{recipe.scenarioCount} scenarios · {recipe.totalTime} time
			</div>
			<div class="mt-1"><ScenarioIcons scenarios={recipe.playedScenarios} size="1.5rem" /></div>
		</div>
		<div class="flex gap-2">
			<Button label={copied ? 'Link copied!' : 'Share this recipe'} onClick={share} highlighted />
			<Button label="Back to results" onClick={onBack} />
		</div>
	</div>

	<!-- Summary stats -->
	<div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
		{#each [['Time', recipe.totalTime], ['Scenarios', recipe.scenarioCount], ['Keys', recipe.keysHeld.length], ['Bonus XP', recipe.bonusXp], ['Trust/Dec', `${recipe.trust}/${recipe.deception}`]] as stat (stat[0])}
			<div class="rounded border border-primary-200 dark:border-primary-800 p-3 text-center">
				<div class="text-2xl font-bold text-primary-900 dark:text-primary-100">{stat[1]}</div>
				<div class="text-xs uppercase tracking-wide text-primary-500">{stat[0]}</div>
			</div>
		{/each}
	</div>

	{#if resolved.freebies.length}
		<div class="rounded-md border border-rogue-300 bg-rogue-50 dark:bg-rogue-950/30 dark:border-rogue-800 p-3 text-sm">
			<span class="font-semibold text-rogue-800 dark:text-rogue-200">Picked up along the way:</span>
			{resolved.freebies.join(' · ')}
		</div>
	{/if}

	<div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
		<div>
			<span class="font-semibold text-primary-700 dark:text-primary-300">Keys held:</span>
			{#if recipe.keysHeld.length}
				{recipe.keysHeld.map((k) => labelFor(k)).join(', ')}
			{:else}<span class="italic text-primary-400">none by an investigator</span>{/if}
		</div>
		{#if recipe.alliesRecruited.length}
			<div><span class="font-semibold text-primary-700 dark:text-primary-300">Allies:</span> {recipe.alliesRecruited.map((a) => labelFor(a)).join(', ')}</div>
		{/if}
		<div><span class="font-semibold text-primary-700 dark:text-primary-300">Predicted ending:</span> {recipe.endingBranch.replace(/_/g, ' ')}</div>
		<div><span class="font-semibold text-primary-700 dark:text-primary-300">Tablet / Elder Thing:</span> {recipe.tablet} / {recipe.elderThing}</div>
	</div>

	{#if resolved.warnings.length}
		<div class="rounded-md border border-secondary-300 bg-secondary-50 dark:bg-secondary-950/30 dark:border-secondary-800 p-3">
			<div class="font-semibold text-secondary-800 dark:text-secondary-200 mb-1">Warnings</div>
			<ul class="list-disc pl-5 text-sm text-secondary-700 dark:text-secondary-300">
				{#each resolved.warnings as w, i (i)}<li>{w}</li>{/each}
			</ul>
		</div>
	{/if}

	<!-- Step timeline -->
	<div>
		<div class="font-heading text-lg text-primary-900 dark:text-primary-100 mb-2">Route</div>
		<ol class="flex flex-col">
			{#each resolved.steps as step, i (i)}
				<li class="flex gap-3 border-l-2 border-primary-200 dark:border-primary-800 pl-4 pb-3 relative">
					<span class="absolute -left-3 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-xs">{stepIcon(step)}</span>
					<div class="flex-1">
						<div class="flex items-baseline justify-between gap-2">
							<span class="text-primary-900 dark:text-primary-100 {step.type === 'finale' ? 'font-bold' : ''}">
								{stepTitle(step)}{#if step.xp}<span class="ml-2 text-rogue-600 dark:text-rogue-400">+{step.xp} XP</span>{/if}
							</span>
							<span class="shrink-0 text-xs text-primary-400">t={step.timeAfter}</span>
						</div>
						{#if (step.type === 'play' || step.type === 'stop') && step.resolutionRequired}
							<span class="mt-0.5 inline-block rounded bg-mystic-100 px-1.5 py-0.5 text-xs text-mystic-800 dark:bg-mystic-900/50 dark:text-mystic-200">required resolution</span>
						{:else if step.type === 'play' || step.type === 'stop'}
							<span class="mt-0.5 inline-block rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-600 dark:bg-primary-900 dark:text-primary-300">any resolution OK</span>
						{/if}
						{#if step.scenarioLevel}
							<div class="mt-0.5 text-xs font-medium text-seeker-700 dark:text-seeker-300">{step.scenarioLevel}</div>
						{/if}
						{#if step.reason}<div class="mt-0.5 text-xs text-primary-500 dark:text-primary-400">{step.reason}</div>{/if}
					</div>
				</li>
			{/each}
		</ol>
	</div>

	<!-- Earnable achievements -->
	{#if resolved.earnableAchievements.length}
		<div>
			<div class="font-heading text-lg text-primary-900 dark:text-primary-100 mb-2">Achievements this route earns or enables</div>
			<div class="flex flex-wrap gap-2">
				{#each resolved.earnableAchievements as a (a.id)}
					<span
						class="rounded-full px-3 py-1 text-sm {a.status === 'guaranteed'
							? 'bg-rogue-100 text-rogue-900 dark:bg-rogue-900/40 dark:text-rogue-200'
							: 'bg-seeker-100 text-seeker-900 dark:bg-seeker-900/40 dark:text-seeker-200'}"
						title={a.status === 'guaranteed' ? 'Guaranteed by the route' : 'The route puts you in position; the feat is up to play'}
					>
						{a.requested ? '★ ' : ''}{a.label}
						<span class="ml-1 text-xs opacity-70">{a.status === 'guaranteed' ? '✓' : 'in-session'}</span>
					</span>
				{/each}
			</div>
		</div>
	{/if}

	{#if resolved.satisfies.length}
		<div class="text-sm text-primary-500 dark:text-primary-400">
			Satisfies your constraints: {resolved.satisfies.map((s) => `#${s.index + 1}`).join(', ')}
		</div>
	{/if}
</div>

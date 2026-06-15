<script lang="ts">
	import { Button } from '@5argon/arkham-life-ui';
	import { labelFor, resolveRecipe, type Locale, type Recipe } from '@5argon/arkham-tsk-solver';
	import { scenarioIconItems, stepIcon, stepTitle } from './helpers';
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

<div class="flex flex-col gap-5 text-primary-800 dark:text-primary-200">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<div class="font-heading text-2xl text-primary-900 dark:text-primary-100">
				{recipe.scenarioCount} scenarios · {recipe.totalTime} time
			</div>
			<div class="mt-1"><ScenarioIcons items={scenarioIconItems(recipe)} size="1.75rem" /></div>
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
		<div class="rounded-md border border-primary-200 bg-primary-50 dark:bg-primary-900/40 dark:border-primary-800 p-3 text-sm text-primary-700 dark:text-primary-200">
			<span class="font-semibold text-secondary-700 dark:text-secondary-300">Picked up along the way:</span>
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
					<span class="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary-200 text-[0.65rem] text-primary-600 dark:bg-primary-800 dark:text-primary-300">
						<i class={stepIcon(step)}></i>
					</span>
					<div class="flex-1">
						<div class="flex items-baseline justify-between gap-2">
							<span class="text-primary-900 dark:text-primary-100 {step.type === 'finale' ? 'font-bold' : ''}">
								{stepTitle(step)}{#if step.xp}<span class="ml-2 font-semibold text-secondary-600 dark:text-secondary-400">+{step.xp} XP</span>{/if}
							</span>
							<span class="shrink-0 text-xs text-primary-400">t={step.timeAfter}</span>
						</div>
						{#if (step.type === 'play' || step.type === 'stop') && step.resolutionRequired}
							<span class="mt-0.5 inline-block rounded bg-secondary-100 px-1.5 py-0.5 text-xs text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-200">required resolution</span>
						{:else if step.type === 'play' || step.type === 'stop'}
							<span class="mt-0.5 inline-block rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-600 dark:bg-primary-800 dark:text-primary-300">any resolution OK</span>
						{/if}
						{#if step.scenarioLevel}
							<div class="mt-0.5 text-xs font-medium text-primary-500 dark:text-primary-400">{step.scenarioLevel}</div>
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
							? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-900/40 dark:text-secondary-200'
							: 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200'}"
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

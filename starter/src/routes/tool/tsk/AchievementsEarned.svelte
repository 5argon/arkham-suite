<script lang="ts">
	import { catalog, evaluateAchievements, resolveLocalized, type PlanTrajectory } from '@5argon/arkham-tsk-solver';

	let { trajectory }: { trajectory: PlanTrajectory } = $props();

	// travel-only steps aren't plays, so exclude them.
	const earned = $derived(evaluateAchievements(trajectory.steps.filter((s) => !s.travelOnly), trajectory.finalState, trajectory.finale, new Set()));
	const descById = new Map(catalog().achievements.map((e) => [e.id, e.note]));
</script>

<p class="mb-2 text-sm text-primary-500 dark:text-primary-400">
	The achievements this plan earns or sets up. <b>✓</b> = guaranteed by the plan;
	<b>◐ in-session</b> = the plan sets it up, but pulling it off is on you at the table.
</p>
{#if earned.length}
	<ul class="flex flex-col gap-2">
		{#each earned as a (a.id)}
			<li class="flex items-start gap-2 text-sm">
				<span class="mt-0.5 shrink-0 text-base {a.status === 'guaranteed' ? 'text-secondary-600 dark:text-secondary-400' : 'text-primary-400'}">
					{a.status === 'guaranteed' ? '✓' : '◐'}
				</span>
				<div>
					<span class="font-medium text-primary-900 dark:text-primary-100">{resolveLocalized(a.label, 'en')}</span>
					{#if a.status !== 'guaranteed'}<span class="ml-1 text-xs uppercase tracking-wide text-primary-400">in-session</span>{/if}
					{#if descById.get(a.id)}<p class="text-xs text-primary-500 dark:text-primary-400">{descById.get(a.id)}</p>{/if}
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-sm italic text-primary-500 dark:text-primary-400">This plan doesn't earn or enable any tracked achievements yet.</p>
{/if}

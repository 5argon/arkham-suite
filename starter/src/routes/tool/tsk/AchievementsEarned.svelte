<script lang="ts">
	import { catalog, evaluateAchievements, resolveLocalized, type Constraint, type PlanTrajectory } from '@5argon/arkham-tsk-solver';

	let { trajectory, constraints }: { trajectory: PlanTrajectory; constraints: Constraint[] } = $props();

	const requested = $derived(new Set(constraints.filter((c): c is Extract<Constraint, { kind: 'achievement' }> => c.kind === 'achievement').map((c) => c.id)));
	// travel-only steps aren't plays, so exclude them.
	const earned = $derived(evaluateAchievements(trajectory.steps.filter((s) => !s.travelOnly), trajectory.finalState, trajectory.finale, requested));
	const descById = new Map(catalog().achievements.map((e) => [e.id, e.note]));
</script>

<p class="mb-2 text-sm text-primary-500 dark:text-primary-400">
	What this plan earns even if you didn't set it as a goal (★ = also a goal). <b>✓</b> = guaranteed by the plan;
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
					<span class="font-medium text-primary-900 dark:text-primary-100">{a.requested ? '★ ' : ''}{resolveLocalized(a.label, 'en')}</span>
					{#if a.status !== 'guaranteed'}<span class="ml-1 text-xs uppercase tracking-wide text-primary-400">in-session</span>{/if}
					{#if descById.get(a.id)}<p class="text-xs text-primary-500 dark:text-primary-400">{descById.get(a.id)}</p>{/if}
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-sm italic text-primary-500 dark:text-primary-400">This plan doesn't earn or enable any tracked achievements yet.</p>
{/if}

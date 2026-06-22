<script lang="ts">
	import { resolveLocalized, type ConstraintCheck, type Constraint } from '@5argon/arkham-tsk-solver';
	import { constraintLabel } from './helpers';

	interface Props {
		checks: ConstraintCheck[];
		constraints: Constraint[];
	}
	let { checks, constraints }: Props = $props();

	const met = $derived(checks.filter((c) => c.status === 'met').length);
	const icon = (s: ConstraintCheck['status']) => (s === 'met' ? 'fa-circle-check' : s === 'in_position' ? 'fa-circle-half-stroke' : 'fa-circle-xmark');
	const tone = (s: ConstraintCheck['status']) =>
		s === 'met'
			? 'text-secondary-600 dark:text-secondary-400'
			: s === 'in_position'
				? 'text-primary-500 dark:text-primary-400'
				: 'text-survivor-600 dark:text-survivor-400';
</script>

<div class="rounded-lg border border-primary-200 dark:border-primary-800 p-4">
	<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100 mb-2">
		Goals <span class="text-sm text-primary-400">({met}/{checks.length} met)</span>
	</h3>
	<ul class="flex flex-col gap-1.5">
		{#each checks as c (c.index)}
			<li class="flex items-start gap-2 text-sm">
				<i class="fa-solid {icon(c.status)} {tone(c.status)} mt-0.5"></i>
				<div class="flex-1 text-primary-800 dark:text-primary-200">
					{constraintLabel(constraints[c.index]!)}
					{#if c.status === 'in_position'}<span class="ml-1 text-xs text-primary-400">(in position — up to play)</span>{/if}
					{#if c.detail}<span class="ml-1 text-xs text-primary-500 dark:text-primary-400">· {resolveLocalized(c.detail, 'en')}</span>{/if}
				</div>
			</li>
		{/each}
	</ul>
</div>

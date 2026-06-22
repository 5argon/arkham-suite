<script lang="ts">
	import type { CampaignState, PlanTrajectory } from '@5argon/arkham-tsk-solver';
	import TskMap from './TskMap.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		trajectory: PlanTrajectory;
		/** Draw the planned course only through the first N steps (the route up to this step's departure). */
		untilStep: number;
		/** State this step departs from (its location is highlighted; its unlocks drive the hover preview). */
		fromState: CampaignState;
		onPick: (locationId: string) => void;
	}
	let { open, onClose, trajectory, untilStep, fromState, onPick }: Props = $props();
</script>

<svelte:window onkeydown={open ? (e) => e.key === 'Escape' && onClose() : undefined} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4" onclick={onClose} role="presentation">
		<div class="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg bg-primary-50 p-4 shadow-2xl dark:bg-primary-950" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="font-heading text-lg text-primary-900 dark:text-primary-100">Choose a destination</h3>
				<button class="px-2 text-xl text-primary-400 hover:text-primary-700" onclick={onClose} aria-label="Close">✕</button>
			</div>
			<p class="mb-2 text-xs italic text-primary-500 dark:text-primary-400">The drawn course runs up to your current position; hover a node to preview the hop-by-hop trip, click to travel there for this step.</p>
			<TskMap {trajectory} {untilStep} {fromState} onNodeClick={onPick} />
		</div>
	</div>
{/if}

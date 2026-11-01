<!--
@component
A grid of investigators to pick from, each showing the same block as the deck
banner's left side (name, health, sanity, stats) so the reader meets them
while choosing. Unpicked ones keep their class colors since that is what the
reader chooses by; the checkbox, border, and backdrop tell the two states
apart. Each row also opens the card's front and back in full screen.
-->
<script lang="ts">
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import clsx from 'clsx';
	import CardLine from '../card/CardLine.svelte';
	import CardMagnifiedModal from '../card/CardMagnifiedModal.svelte';
	import HealthSanity from '../card/HealthSanity.svelte';
	import ImageIconCommit from '../card/ImageIconCommit.svelte';
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		investigators: Card[];
		selected: ReadonlySet<CardCode>;
		onToggle: (investigator: Card, selected: boolean) => void;
		/**
		 * Investigator stats at or above this value render emphasized.
		 */
		highlightStatsAtLeast?: number;
		/**
		 * Investigator stats at or below this value render dimmed.
		 */
		dimStatsAtMost?: number;
	}
	const { investigators, selected, onToggle, highlightStatsAtLeast, dimStatsAtMost }: Prop =
		$props();

	let magnified = $state<Card | null>(null);
</script>

<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
	{#each investigators as investigator (investigator.code)}
		{@const on = selected.has(investigator.code)}
		{@const readLabel = m.form_read_investigator_card({ investigator: investigator.name })}
		<div
			class={clsx(
				'investigator-toggle flex items-stretch overflow-hidden rounded-md border-2',
				on
					? 'on border-secondary-500 dark:bg-primary-950 bg-white shadow-md'
					: 'border-primary-300 dark:border-primary-700 bg-primary-200/50 dark:bg-primary-900/50 border-dashed'
			)}
		>
			<button
				type="button"
				class="investigator-pick flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left"
				aria-pressed={on}
				onclick={() => onToggle(investigator, !on)}
			>
				<span
					class={clsx(
						'text-lg',
						on ? 'text-secondary-600 dark:text-secondary-400' : 'text-primary-500'
					)}
				>
					<FaIcon duotone={!on} icon={on ? FaIconType.CheckBoxChecked : FaIconType.CheckBox} />
				</span>
				<span class="flex min-w-0 flex-col items-start gap-1">
					<CardLine noReserveCardTypeIcon hideIcons card={investigator} />
					<span class="flex items-center gap-2">
						<HealthSanity health={investigator.health} sanity={investigator.sanity} />
						<ImageIconCommit
							card={investigator}
							highlightAtLeast={highlightStatsAtLeast}
							dimAtMost={dimStatsAtMost}
						/>
					</span>
				</span>
			</button>
			<button
				type="button"
				class="investigator-read text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700 shrink-0 border-l px-3"
				title={readLabel}
				aria-label={readLabel}
				onclick={() => (magnified = investigator)}
			>
				<FaIcon icon={FaIconType.Magnify} />
			</button>
		</div>
	{/each}
</div>

<CardMagnifiedModal
	card={magnified}
	isShowing={magnified !== null}
	onClose={() => (magnified = null)}
/>

<style>
	.investigator-pick,
	.investigator-read {
		cursor: pointer;
	}

	.investigator-pick:active {
		transform: scale(0.99);
	}

	.investigator-pick:hover,
	.investigator-read:hover {
		background-color: var(--color-primary-100);
	}

	.investigator-toggle.on .investigator-pick:hover,
	.investigator-toggle.on .investigator-read:hover {
		background-color: var(--color-secondary-50);
	}

	:global(.dark) .investigator-pick:hover,
	:global(.dark) .investigator-read:hover {
		background-color: var(--color-primary-800);
	}

	:global(.dark) .investigator-toggle.on .investigator-pick:hover,
	:global(.dark) .investigator-toggle.on .investigator-read:hover {
		background-color: var(--color-primary-900);
	}
</style>

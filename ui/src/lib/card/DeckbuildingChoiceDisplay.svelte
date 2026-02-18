<script lang="ts">
	import { type Card, type DecodedMeta, type CardClass } from '@5argon/arkham-kohaku';
	import SelectedClassBanner from './SelectedClassBanner.svelte';
	import { isMethodDeclaration } from 'typescript';

	interface Prop {
		/**
		 * The investigator card.
		 */
		investigator: Card;
		/**
		 * The decoded meta containing deckbuilding choices.
		 */
		meta: DecodedMeta;
		/**
		 * Hide the icon before the label.
		 */
		hideIcon?: boolean;
	}
	const { investigator, meta, hideIcon = false }: Prop = $props();

	interface ChoiceDisplay {
		cardClass?: CardClass;
		label?: string;
	}

	const choices = $derived.by((): ChoiceDisplay[] => {
		const result: ChoiceDisplay[] = [];

		// Check for faction selections
		if (meta.factionSelected) {
			result.push({ cardClass: meta.factionSelected });
		}

		if (meta.faction1 && meta.faction2) {
			// Both factions selected
			result.push({ cardClass: meta.faction1 });
			result.push({ cardClass: meta.faction2 });
		} else if (meta.faction1) {
			result.push({ cardClass: meta.faction1 });
		} else if (meta.faction2) {
			result.push({ cardClass: meta.faction2 });
		}

		if (meta.optionSelected && investigator.deckOptions) {
			// Find the matching option in deckOptions
			for (const deckOption of investigator.deckOptions) {
				if (deckOption.optionSelect) {
					const matchingOption = deckOption.optionSelect.find(
						(opt) => opt.id === meta.optionSelected
					);
					if (matchingOption && matchingOption.name) {
						// Use primary color for option selections (no cardClass)
						result.push({ label: matchingOption.name });
						break;
					}
				}
			}
		}

		return result;
	});
</script>

{#if choices.length > 0}
	<div class="flex flex-wrap items-center gap-1">
		{#each choices as choice, i (i)}
			<SelectedClassBanner cardClass={choice.cardClass} label={choice.label} {hideIcon} />
		{/each}
	</div>
{/if}

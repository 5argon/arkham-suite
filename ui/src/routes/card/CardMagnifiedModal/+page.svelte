<script lang="ts">
	import Button from '$lib/button/Button.svelte';
	import CardMagnifiedModal from '$lib/card/CardMagnifiedModal.svelte';
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardResolver } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';

	const resolver = new CardResolver(allCards);
	
	// Example cards to demonstrate
	const exampleCard = resolver.resolve('01516'); // Regular card
	const investigatorCard = resolver.resolve('01001'); // Roland Banks (investigator with front and back)
	
	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);
	let magnifiedInvestigatorCard = $state<Card | null>(null);
	let isInvestigatorModalShowing = $state(false);
</script>

<Button
	label="Show Card"
	onClick={() => {
		magnifiedCard = exampleCard;
		isModalShowing = true;
	}}
/>

<Button
	label="Show Investigator Card (Front & Back)"
	onClick={() => {
		magnifiedInvestigatorCard = investigatorCard;
		isInvestigatorModalShowing = true;
	}}
/>

<CardMagnifiedModal
	card={magnifiedCard}
	isShowing={isModalShowing}
	onClose={() => {
		isModalShowing = false;
		magnifiedCard = null;
	}}
/>

<CardMagnifiedModal
	card={magnifiedInvestigatorCard}
	isShowing={isInvestigatorModalShowing}
	onClose={() => {
		isInvestigatorModalShowing = false;
		magnifiedInvestigatorCard = null;
	}}
/>

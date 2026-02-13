<!--
@component
-->
<script lang="ts">
	import type { DeckPairedWithPlayer, Player } from './common-campaign-data';
	interface Prop {
		availablePlayers: Player[];
        participatingPlayers: Player[];
		pairedDecks: DeckPairedWithPlayer[];
	}
    const { availablePlayers, participatingPlayers, pairedDecks }: Prop = $props();
</script>
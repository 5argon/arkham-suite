<script lang="ts">
	import CardBlock from './CardBlock.svelte';

	export let cardId: string;
</script>

<CardBlock {cardId} text={'(Unknown card ID ' + cardId + ')'} small={true}/>

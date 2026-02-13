<script lang="ts">
	import { CardClass, type ClassSlots } from '@5argon/arkham-kohaku';
	import ImageIconClass from './ImageIconClass.svelte';
	interface Prop {
		classSlots: ClassSlots;
	}
	const { classSlots }: Prop = $props();
</script>

<div class="flex space-x-1">
	<ImageIconClass cardClass={classSlots.class1}></ImageIconClass>
	{#if classSlots.class2 !== undefined}
		<ImageIconClass cardClass={classSlots.class2}></ImageIconClass>
	{/if}
	{#if classSlots.class3 !== undefined}
		<ImageIconClass cardClass={classSlots.class3}></ImageIconClass>
	{/if}
</div>

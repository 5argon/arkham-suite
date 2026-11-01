<script lang="ts">
	import Foldout from '$lib/container/Foldout.svelte';
	import Checkbox from '$lib/form/Checkbox.svelte';

	let opened = $state(-1);
	let checked = $state(false);
</script>

<Foldout title="Bound, starts open" expanded>
	<p class="p-3">Content unmounts while folded.</p>
</Foldout>

<Foldout title="Keeps its content mounted" keepMounted>
	<div class="p-3">
		<Checkbox bind:checked label="Survives folding" />
	</div>
</Foldout>

{#each ['First', 'Second', 'Third'] as title, i (title)}
	<Foldout {title} expanded={opened === i} onToggle={() => (opened = opened === i ? -1 : i)}>
		{#snippet right()}
			<span class="text-sm">Accordion {i + 1}</span>
		{/snippet}
		<p class="p-3">Only one of these is open at a time.</p>
	</Foldout>
{/each}

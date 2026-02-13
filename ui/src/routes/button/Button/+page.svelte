<script>
	import Button from '$lib/button/Button.svelte';
</script>

{#snippet svg()}
	<svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
		><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg
	>
{/snippet}

<Button
	label="Click Me"
	icon={svg}
	onClick={() => {
		console.log('Button Clicked');
	}}
/>

<Button
	label="Highlighted"
	icon={svg}
	onClick={() => {
		console.log('Button Clicked');
	}}
	highlighted
/>

<Button
	label="Danger"
	icon={svg}
	onClick={() => {
		console.log('Button Clicked');
	}}
	danger
/>

<Button
	label="Hide Label"
	hideLabel
	icon={svg}
	onClick={() => {
		console.log('Button Clicked');
	}}
/>

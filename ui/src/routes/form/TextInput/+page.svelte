<script>
	import TextInput from '$lib/form/TextInput.svelte';
	let testValue = $state('initial');
</script>

<h1 style="height:100px">{testValue}</h1>

<TextInput label="Label" bind:value={testValue} />

<TextInput
	label="Label"
	bind:value={testValue}
	submittable={{ onSubmit: () => {}, submitText: 'Submit' }}
/>

<TextInput
	label="Label"
	bind:value={testValue}
	feedback={{ type: 'info', message: 'Info message' }}
	help="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
/>

<TextInput
	label="Label"
	bind:value={testValue}
	feedback={{ type: 'error', message: 'Info message' }}
/>

<TextInput
	label="Label"
	bind:value={testValue}
	feedback={{ type: 'success', message: 'Info message' }}
/>

<TextInput label="Label" bind:value={testValue} loading />

<TextInput
	label="Label"
	bind:value={testValue}
	submittable={{ onSubmit: () => {}, submitText: 'Submit' }}
	loading
/>

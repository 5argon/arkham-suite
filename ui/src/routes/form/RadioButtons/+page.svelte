<script>
	import RadioButtons from '../../../lib/form/RadioButtons.svelte';
	import { FaIconType } from '../../../lib/icon/fa-icon-type.js';
	let testValue = $state('1');
</script>

<div>{testValue}</div>

<div class="flex flex-col space-y-4">
	<RadioButtons
		label="Label"
		bind:selectedValue={testValue}
		choices={[
			{ value: '1', label: 'One' },
			{ value: '2', label: 'Two' },
			{ value: '3', label: 'Threeeee' }
		]}
	/>

	<RadioButtons
		label="Label"
		size="text"
		bind:selectedValue={testValue}
		choices={[
			{ value: '1', label: 'A' },
			{ value: '2', label: 'B' },
			{ value: '3', label: 'C' }
		]}
	/>

	<RadioButtons
		label="Label"
		help="Help"
		size="icon"
		bind:selectedValue={testValue}
		choices={[
			{ value: '1', label: 'One', icon: FaIconType.Investigator },
			{ value: '2', label: 'Two', icon: FaIconType.Customizable },
			{ value: '3', label: 'Three', icon: FaIconType.Myriad }
		]}
	/>
</div>

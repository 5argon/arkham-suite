<script lang="ts">
	import { Button, FaIconType } from '@5argon/arkham-life-ui';

	interface Props {
		label?: string;
		accept?: string;
		disabled?: boolean;
		highlighted?: boolean;
		onFile: (file: File) => void;
	}

	let {
		label = 'Choose a file…',
		accept = '.ahlifedb,.ahlifecam,.ahlifepro,.arkhamlife,.json,application/gzip,application/json',
		disabled = false,
		highlighted = false,
		onFile,
	}: Props = $props();

	let input = $state<HTMLInputElement | undefined>();

	function handleChange(event: Event) {
		const el = event.currentTarget as HTMLInputElement;
		const file = el.files?.[0];
		if (file) onFile(file);
		el.value = ''; // allow re-selecting the same file
	}
</script>

<!-- Native file input is unstyled (and black in dark mode); hide it and drive it from a themed Button. -->
<input bind:this={input} type="file" {accept} class="hidden" onchange={handleChange} />
<Button {label} {disabled} {highlighted} icon={FaIconType.Import} onClick={() => input?.click()} />

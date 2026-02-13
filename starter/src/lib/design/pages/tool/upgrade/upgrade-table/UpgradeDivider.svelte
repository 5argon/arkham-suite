<script lang="ts">
	import { InlineTextBox } from '@5argon/arkham-life-ui';
	interface Props {
		text: string;
		viewMode: boolean;
		onTextChanged?: (n: string) => void;
	}

	let { text, viewMode, onTextChanged = () => {} }: Props = $props();
</script>

<div class="ml-1 py-1">
	<InlineTextBox
		align="left"
		class="w-full"
		value={text}
		disabled={viewMode}
		onchange={(e) => onTextChanged(e.currentTarget.value)}
	/>
</div>

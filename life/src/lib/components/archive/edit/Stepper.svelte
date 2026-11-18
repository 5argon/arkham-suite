<!--
@component
A "− n +" counter. With `max`, it also shows "/max" and stops there.
-->
<script lang="ts">
	import { Button } from '@5argon/arkham-life-ui';

	interface Props {
		value: number;
		min?: number;
		max?: number;
		onChange: (value: number) => void;
	}
	let { value, min = 0, max, onChange }: Props = $props();
</script>

<span class="inline-flex items-center gap-1">
	<Button label="−" disabled={value <= min} onClick={() => onChange(value - 1)} />
	<span class="min-w-6 text-center text-sm font-bold text-black tabular-nums dark:text-white">
		{value}{#if max}<span class="text-primary-400">/{max}</span>{/if}
	</span>
	<Button label="+" disabled={max != null && value >= max} onClick={() => onChange(value + 1)} />
</span>

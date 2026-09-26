<!--
@component
A number box that commits on blur, clamped to [min, max]. Blank commits `null` (not recorded,
which is not the same as 0).
-->
<script lang="ts">
	import { TextInput } from '@5argon/arkham-life-ui';

	interface Props {
		label: string;
		value: number | null;
		min?: number;
		max?: number;
		placeholder?: string;
		helpMd?: string;
		onCommit: (value: number | null) => void;
	}
	let {
		label,
		value,
		min = Number.NEGATIVE_INFINITY,
		max = Number.POSITIVE_INFINITY,
		placeholder = '—',
		helpMd,
		onCommit
	}: Props = $props();

	/** What the player is typing; null when showing the committed value. */
	let draft = $state<string | null>(null);
	const shown = $derived(draft ?? (value == null ? '' : String(value)));

	function commit() {
		if (draft === null) return;
		const t = draft.trim();
		draft = null;
		const n = t === '' ? null : Math.max(min, Math.min(max, Number(t) || 0));
		if (n !== value) onCommit(n);
	}
</script>

<TextInput
	{label}
	{helpMd}
	{placeholder}
	value={shown}
	oninput={(v) => (draft = v)}
	onblur={commit}
/>

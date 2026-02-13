<!--
@component
A specialized button for navigation back actions with left-pointing chevrons.
Can render as either a clickable link (for SEO) or a button with custom behavior.
-->
<script lang="ts">
	import Button from './Button.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';
	import { fly } from 'svelte/transition';

	interface Prop {
		label: string;
		/** URL to navigate to (renders as <a> tag for SEO) or custom click handler (renders as <button>) */
		onClick: string | (() => void);
	}
	const { label, onClick }: Prop = $props();
</script>

<div in:fly={{ x: -20, duration: 200 }} out:fly={{ x: -20, duration: 100 }}>
	<Button {label} {onClick} icon={FaIconType.LeftDouble} />
</div>

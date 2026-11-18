<script lang="ts">
	import type { ChaosToken } from '@5argon/arkham-kohaku';
	import { ChaosTokenIcon } from '@5argon/arkham-icon';

	import { chaosTokenToString } from './chaos-token-helper.js';

	let {
		token,
		hideLabel = false,
		/** Sealed (outline ring + symbol) coin variant; the layered token-face glyph when false. */
		sealed = false,
		/** Render the token in the inherited font colour (currentColor) instead of its built-in colours. */
		noColor = false,
		/** Drop the gradient disc behind the (non-sealed) token face, leaving just the layered glyph. */
		noDisc = false,
		/** Icon size — a Tailwind text-size class. */
		size = 'text-2xl'
	}: {
		token: ChaosToken;
		hideLabel?: boolean;
		sealed?: boolean;
		noColor?: boolean;
		noDisc?: boolean;
		size?: string;
	} = $props();
</script>

<span class="flex items-center">
	<span class={`flex ${size} ${hideLabel ? '' : 'mr-1'}`}>
		<ChaosTokenIcon {sealed} {noColor} {noDisc} chaosToken={token} />
	</span>
	{#if !hideLabel}
		<span class="text-primary-800 dark:text-primary-200 leading-none"
			>{chaosTokenToString(token)}</span
		>
	{/if}
</span>

<script lang="ts">
	import type { ChaosToken } from '@5argon/arkham-kohaku'
	import { ChaosTokenIcon } from '@5argon/arkham-icon'

	import { chaosTokenToString } from './chaos-token-helper.js'

	let {
		token,
		hideLabel = false,
		circular = true,
	}: { token: ChaosToken; hideLabel?: boolean; circular?: boolean } = $props()
</script>

<span class="flex items-center">
	<span class="mr-1 flex text-2xl">
		<ChaosTokenIcon
			{circular}
			chaosToken={token}
			fillColor="text-primary-900 dark:text-primary-100"
		/>
	</span>
	{#if !hideLabel}
		<span class="leading-none text-primary-800 dark:text-primary-200"
			>{chaosTokenToString(token)}</span
		>
	{/if}
</span>

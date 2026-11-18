<!-- @component A bordered link to another profile page: a label, an optional detail line and an arrow. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BorderedContainer } from '@5argon/arkham-life-ui';

	let {
		href,
		label,
		detail,
		icon
	}: { href: string; label: string; detail?: string; icon?: Snippet } = $props();
</script>

<a {href} class="block">
	<BorderedContainer>
		<div class="flex items-center justify-between gap-3 p-3 transition hover:opacity-80">
			<div class="flex min-w-0 items-center gap-2">
				{#if icon}
					<span class="text-primary-600 dark:text-primary-300 shrink-0 text-lg leading-none">
						{@render icon()}
					</span>
				{/if}
				<div class="min-w-0">
					<p class="truncate font-medium text-black dark:text-white">{label}</p>
					{#if detail}
						<p class="text-primary-500 dark:text-primary-400 truncate text-xs">{detail}</p>
					{/if}
				</div>
			</div>
			<span class="text-secondary-500 shrink-0">→</span>
		</div>
	</BorderedContainer>
</a>

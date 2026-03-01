<script lang="ts">
	import { ToastHost } from '@5argon/arkham-life-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
</script>

<ToastHost>
	{@render children()}
</ToastHost>

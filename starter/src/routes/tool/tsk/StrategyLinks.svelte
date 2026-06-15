<script lang="ts">
	import { Button, FaIconType } from '@5argon/arkham-life-ui';

	// derbk's "Best-Laid Plans" deep-dives — the reference for engineering goals (Keys, the vote, routing).
	const links = [
		{ label: 'BLP: The Scarlet Keys', url: 'https://derbk.com/ancientevils/best-laid-plans-the-scarlet-keys/' },
		{ label: 'BLP: The Keys themselves', url: 'https://derbk.com/ancientevils/the-actual-keys-of-the-scarlet-keys/' },
		{ label: 'BLP: The Vote', url: 'https://derbk.com/ancientevils/best-laid-plans-scarlet-politics/' },
		{ label: 'BLP: Traveling', url: 'https://derbk.com/ancientevils/best-laid-plans-traveling-the-world/' },
	];
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="text-sm text-primary-500 dark:text-primary-400">Strategy guides (derbk · Best-Laid Plans):</span>
	{#each links as l (l.url)}
		<Button label={l.label} onClick={l.url} icon={FaIconType.ExternalLink} newTab />
	{/each}
</div>

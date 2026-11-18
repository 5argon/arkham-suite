<!-- @component A campaign's art filling its box: the wide banner, else the box art, else nothing. -->
<script lang="ts">
	import { campaignArtUrl, campaignBannerUrl } from './campaign-identity';

	let {
		campaignCode,
		banner = false,
		class: klass = ''
	}: { campaignCode: string | null | undefined; banner?: boolean; class?: string } = $props();

	// svelte-ignore state_referenced_locally
	let stage = $state(banner ? 0 : 1);
	const src = $derived(
		!campaignCode
			? null
			: stage === 0
				? campaignBannerUrl(campaignCode)
				: stage === 1
					? campaignArtUrl(campaignCode)
					: null
	);
</script>

{#if src}
	<img {src} alt="" class="h-full w-full object-cover {klass}" onerror={() => stage++} />
{/if}

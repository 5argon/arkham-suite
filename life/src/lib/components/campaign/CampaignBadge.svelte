<!-- @component A campaign's icon in a circle of the campaign's color. -->
<script lang="ts">
	import { ProductIcon } from '@5argon/arkham-icon';
	import { campaignPaletteStyle, campaignProduct } from './campaign-identity';

	let {
		campaignCode,
		size = 'md',
		class: klass = ''
	}: {
		campaignCode: string | null | undefined;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const product = $derived(campaignProduct(campaignCode));
	const style = $derived(campaignPaletteStyle(campaignCode));
	// The ring is inset and the small size, used in lists and tables, has no shadow: nothing is drawn
	// outside the circle for a scrolling container to cut off. The larger sizes sit on campaign art.
	const sizeClass = {
		sm: 'size-6 text-sm',
		md: 'size-7 text-base shadow-md',
		lg: 'size-10 text-2xl shadow-md sm:size-12 sm:text-3xl'
	};
</script>

{#if product != null}
	<span
		{style}
		class="flex shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/40 ring-inset {sizeClass[
			size
		]} {style ? 'bg-(--campaign-badge)' : 'bg-black/60'} {klass}"
	>
		<ProductIcon {product} />
	</span>
{/if}

<!--
@component
An Ultimatum, Boon, or Refraction with its icon, name, and (for Refractions) the campaign
and scenario it applies to. Refractions are tinted with their campaign's color.
-->
<script lang="ts">
	import {
		Boon,
		Refraction,
		Ultimatum,
		color,
		convert,
		getScenarioData,
		refractions,
	} from '@5argon/arkham-kohaku'
	import { EncounterSetIcon, ProductIcon } from '@5argon/arkham-icon'
	import * as u from '@5argon/arkham-string'
	import FaIcon from '../icon/FaIcon.svelte'
	import { FaIconType } from '../icon/fa-icon-type.js'

	let {
		item,
		imageSrc,
		showText = false,
	}: {
		item: Ultimatum | Boon | Refraction
		/** Card image. Nothing is shown in its place if it fails to load. */
		imageSrc: string
		/** Also show the card's rule text box, cropped from the image, below the name. */
		showText?: boolean
	} = $props()

	const refraction = $derived(refractions.find((r) => r.refraction === item))
	const isBoon = $derived(
		refraction
			? refraction.refractionType === 'boon'
			: (Object.values(Boon) as string[]).includes(item),
	)
	const name = $derived(
		refraction
			? u.u.refractionName(item as Refraction)
			: isBoon
				? u.u.boonName(item as Boon)
				: u.u.ultimatumName(item as Ultimatum),
	)
	const encounterSet = $derived(
		refraction?.scenario
			? (refraction.encounterSet ?? getScenarioData(refraction.scenario).representativeSet)
			: undefined,
	)
	const campaignColorStyle = $derived.by(() => {
		if (!refraction) return undefined
		const palette = color.productToColors(convert.campaignToProduct(refraction.campaign))
		const light = color.getColor(palette, 800, false)
		const dark = color.getColor(palette, 800, true)
		return `--campaign-light: ${light}; --campaign-dark: ${dark}`
	})
	const colorClass = $derived(refraction ? 'text-(--campaign-light) dark:text-(--campaign-dark)' : '')

	let failedSrc = $state<string | null>(null)
	const imageMissing = $derived(failedSrc === imageSrc)
</script>

{#snippet header()}
	<div class="flex items-center gap-2 font-semibold">
		<FaIcon icon={isBoon ? FaIconType.Boon : FaIconType.Ultimatum} duotone={true} />
		<span class={refraction ? '' : 'text-primary-950 dark:text-primary-50'}>{name}</span>
	</div>
	{#if refraction}
		<div class="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
			<div class="flex items-center gap-1">
				<span class="flex items-center">
					<ProductIcon product={convert.campaignToProduct(refraction.campaign)} />
				</span>
				<span>{u.u.campaignName(refraction.campaign)}</span>
			</div>
			{#if encounterSet}
				<div class="flex items-center gap-1">
					<span class="flex items-center">
						<EncounterSetIcon {encounterSet} />
					</span>
					<span>{u.u.encounterSetName(encounterSet)}</span>
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

<div class={colorClass} style={campaignColorStyle}>
	<div class="flex items-center gap-3">
		<div class="h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
			{#if !imageMissing}
				<img
					src={imageSrc}
					alt={name}
					class="h-full w-full object-cover object-top"
					onerror={() => (failedSrc = imageSrc)}
				/>
			{/if}
		</div>
		<div class="flex-1">
			{@render header()}
		</div>
	</div>
	{#if showText && !imageMissing}
		<!-- The 1312x1818 card cropped to x 60-1252, y 1360-1712 : the rule text without the type line,
		illustrator, and encounter set icon. Negative margins in % are relative to the box's width. -->
		<div class="mx-auto mt-2 aspect-1192/352 w-full max-w-sm overflow-hidden rounded-lg">
			<img
				src={imageSrc}
				alt={name}
				class="max-w-none"
				style="width: 110.07%; margin-left: -5.03%; margin-top: -114.09%"
			/>
		</div>
	{/if}
</div>

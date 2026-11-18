<script lang="ts">
	import {
		Button,
		CardTagChip,
		FaIconType,
		getCardBackImagePath,
		getCardImagePath,
		InnerHeading,
		MarginFull,
		SectionSeparator,
		TextButton
	} from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import {
		compoundTagName,
		tagMatchesCompound,
		tagName,
		type CompoundTagType,
		type Tag
	} from '@5argon/arkham-tags';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import {
		compoundHref,
		packCards,
		packHref,
		tagArgPairs,
		tagArguments,
		taggedPacks,
		tagHref,
		tagLabel,
		tagRepo
	} from '$lib/tag-browser';
	import CardAuditReport from '../../CardAuditReport.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const packList = taggedPacks();
	const card = $derived(data.card);
	const tags = $derived<Tag[]>(tagRepo.tagsOfCard(card.code) ?? []);
	// Read from the memberships baked into the JSON, which honored each member's `where` at export.
	const compounds = $derived<CompoundTagType[]>(tagRepo.compoundTagsOfCard(card.code));
	// Hovering a compound chip rings the card's tags that make it belong.
	let hoveredCompound = $state<CompoundTagType | null>(null);

	/** The card's pack in printed order, the sequence Previous and Next walk. */
	const sequence = $derived<Card[]>(packCards(card.product));
	const position = $derived(sequence.findIndex((c) => c.code === card.code));
	const prevCard = $derived<Card | null>(position > 0 ? sequence[position - 1] : null);
	const nextCard = $derived<Card | null>(
		position >= 0 && position < sequence.length - 1 ? sequence[position + 1] : null
	);
	const pack = $derived(packList.find((p) => p.product === card.product));
	const backImage = $derived<string | undefined>(getCardBackImagePath(card, 'full'));

	function step(to: Card | null) {
		if (to) goto(resolve('/tool/tag-browser/card/[code]', { code: to.code }));
	}

	// ←/→ step through the pack. Ignored while typing in a field (e.g. the error-report box) or
	// with a modifier held, so ⌘← still reaches the browser.
	function onKeydown(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		if (e.key === 'ArrowLeft' && prevCard) {
			e.preventDefault();
			step(prevCard);
		} else if (e.key === 'ArrowRight' && nextCard) {
			e.preventDefault();
			step(nextCard);
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
	<title>{m.tool_tag_browser_page_title()} | {card.name}</title>
</svelte:head>

<MarginFull>
	<div class="flex flex-wrap items-center justify-end gap-2">
		<Button
			label={m.tool_tag_browser_prev()}
			icon={FaIconType.LeftSingle}
			onClick={() => step(prevCard)}
			disabled={!prevCard}
		/>
		<span class="text-primary-500 dark:text-primary-400 text-sm tabular-nums">
			{position + 1} / {sequence.length}
		</span>
		<Button
			label={m.tool_tag_browser_next()}
			icon={FaIconType.RightSingle}
			onClick={() => step(nextCard)}
			disabled={!nextCard}
		/>
	</div>

	<div class="mt-4 grid gap-6 lg:grid-cols-[300px_1fr]">
		<div class="space-y-3">
			<img
				src={getCardImagePath(card.code, 'full')}
				alt={card.name}
				class="w-full rounded-lg shadow-md"
				loading="lazy"
			/>
			{#if backImage}
				<img
					src={backImage}
					alt={`${card.name} (back)`}
					class="w-full rounded-lg shadow-md"
					loading="lazy"
				/>
			{/if}
		</div>
		<div>
			<InnerHeading title={card.name} />
			<p class="text-primary-500 dark:text-primary-400 flex flex-wrap items-center gap-1 text-sm">
				{#if pack}
					<TextButton label={pack.name} onClick={packHref(pack.code)} />
					<span>·</span>
				{/if}
				<span>{card.code}</span>
			</p>

			{#if tags.length === 0}
				<p class="text-primary-500 dark:text-primary-400 mt-3 italic">
					{m.tool_tag_browser_not_tagged()}
				</p>
			{:else}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each tags as tag (tag.type + JSON.stringify(tag))}
						<CardTagChip
							label={tagName(tag.type)}
							args={tagArgPairs(tag)}
							count={tagRepo.tagTypeCount(tag.type)}
							icon={FaIconType.Tag}
							emphasized={hoveredCompound !== null && tagMatchesCompound(tag, hoveredCompound)}
							onClick={tagHref(tag.type, tagArguments(tag))}
						/>
					{/each}
				</div>

				{#if compounds.length > 0}
					<div class="mt-4">
						<SectionSeparator title={m.tool_tag_browser_compound_tags()} inner />
					</div>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each compounds as c (c)}
							<CardTagChip
								label={compoundTagName(c)}
								count={tagRepo.compoundTagCount(c)}
								highlighted
								icon={FaIconType.Tags}
								onClick={compoundHref(c)}
								onMouseEnter={() => (hoveredCompound = c)}
								onMouseLeave={() => (hoveredCompound = null)}
							/>
						{/each}
					</div>
				{/if}
			{/if}

			{#key card.code}
				<CardAuditReport
					{card}
					tagLines={tags.map(tagLabel)}
					compoundLines={compounds.map((c) => compoundTagName(c))}
				/>
			{/key}
		</div>
	</div>
</MarginFull>

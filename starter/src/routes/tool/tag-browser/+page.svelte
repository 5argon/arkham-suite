<script lang="ts">
	import {
		BackButton,
		Button,
		CardFormSingle,
		FaIconType,
		FlexibleCardDisplay,
		HelpParagraph,
		InnerHeading,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		TagChip,
		Tabs,
		TextInput,
		buildUrlForSettings,
		getCardBackImagePath,
		getCardImagePath,
		searchParamsToSettings,
		type CardItem,
		type GroupingSortingSettings
	} from '@5argon/arkham-life-ui';
	import { card as cardUtil, type Card } from '@5argon/arkham-kohaku';
	import {
		compoundTagsContaining,
		tagMatchesCompound,
		groupOfTagType,
		tagName,
		tagGroupName,
		compoundTagName,
		tagDescription,
		tagGroupDescription,
		compoundTagDescription,
		type Tag,
		type TagType,
		type CompoundTagType,
		type TagTypeUsage,
		type CompoundTagBase
	} from '@5argon/arkham-tags';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import {
		tagRepo,
		toCardItems,
		cardsToItems,
		taggedPacks,
		packByCode,
		packCards,
		withParams,
		tagArguments,
		tagArgPairs,
		whereArgPairs,
		serializeWhere,
		parseWhere,
		tagMatchesWhere
	} from '$lib/tag-browser';
	import TagErrorReport from './TagErrorReport.svelte';
	import CardAuditReport from './CardAuditReport.svelte';

	type View =
		| { kind: 'index' }
		| { kind: 'tag'; type: TagType }
		| { kind: 'compound'; type: CompoundTagType };

	const allCards = getAllCards();
	const cardMap = new Map(allCards.map((c) => [c.code, c]));

	// ---------- URL is the source of truth (shareable state) ----------
	const sp = $derived(page.url.searchParams);
	const mode = $derived<'tags' | 'card'>(sp.get('tab') === 'card' ? 'card' : 'tags');
	const view = $derived.by((): View => {
		const tag = sp.get('tag');
		const compound = sp.get('compound');
		if (tag) return { kind: 'tag', type: tag as TagType };
		if (compound) return { kind: 'compound', type: compound as CompoundTagType };
		return { kind: 'index' };
	});
	/** Partial-argument filter for the tag view (from a card's tag, or a conditioned compound member). */
	const where = $derived(parseWhere(sp.get('where')));
	const searchQuery = $derived(sp.get('q') ?? '');
	const cardSettings = $derived<GroupingSortingSettings>(searchParamsToSettings(sp));

	// Card mode sub-state: a selected pack grid (`pack`) and/or a single focused card (`focus`).
	const packInfo = $derived(packByCode(sp.get('pack')));
	const focusCode = $derived(sp.get('focus'));
	const focusCard = $derived<Card | null>(focusCode ? (cardMap.get(focusCode) ?? null) : null);

	// `push` adds a browser-history entry (so Back works) — used for discrete
	// navigation; refinements (search, card selection, settings) replace instead.
	function apply(updates: Record<string, string | null>, opts: { push?: boolean } = {}) {
		goto(withParams(page.url, updates), {
			replaceState: !opts.push,
			keepFocus: true,
			noScroll: true
		});
	}
	function setTab(index: number) {
		if (index === 0) apply({ tab: null, pack: null, focus: null }, { push: true });
		else apply({ tab: 'card', tag: null, compound: null, where: null, q: null }, { push: true });
	}
	function showTag(type: TagType, w?: Record<string, unknown>) {
		apply(
			{
				tab: null,
				pack: null,
				focus: null,
				tag: type,
				compound: null,
				where: w && Object.keys(w).length ? serializeWhere(w) : null
			},
			{ push: true }
		);
	}
	function showCompound(type: CompoundTagType) {
		apply(
			{ tab: null, pack: null, focus: null, compound: type, tag: null, where: null },
			{ push: true }
		);
	}
	function showIndex() {
		apply({ tag: null, compound: null, where: null }, { push: true });
	}
	// Card mode navigation. Opening a card pushes history (Back returns to the grid/search);
	// stepping prev/next replaces (Back goes straight to where you entered from).
	function showPack(code: string) {
		apply({ tab: 'card', pack: code, focus: null }, { push: true });
	}
	function openCard(code: string) {
		apply({ tab: 'card', focus: code }, { push: true });
	}
	function stepCard(code: string) {
		apply({ focus: code });
	}
	// ←/→ step through the pack while on the audit page. Ignored while typing in a field
	// (e.g. the error-report box) or with a modifier held (so ⌘← browser-back still works).
	function onKeydown(e: KeyboardEvent) {
		if (mode !== 'card' || !focusCard) return;
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		if (e.key === 'ArrowLeft' && prevCard) {
			e.preventDefault();
			stepCard(prevCard.code);
		} else if (e.key === 'ArrowRight' && nextCard) {
			e.preventDefault();
			stepCard(nextCard.code);
		}
	}
	// Leaving the audit page: return to wherever the card was opened from — the originating
	// tag/compound view (params still in the URL), else the pack grid, else the picker.
	function backToCards() {
		if (sp.get('tag') || sp.get('compound')) apply({ tab: null, focus: null }, { push: true });
		else apply({ focus: null }, { push: true });
	}
	function applyCardSettings(settings: GroupingSortingSettings) {
		goto(buildUrlForSettings(settings, page.url), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});
	}

	// ---------- projections ----------
	const groupedTags = $derived.by((): { group: string; tags: TagTypeUsage[] }[] => {
		const shown = tagRepo.searchTags(searchQuery);
		const byGroup = new Map<string, TagTypeUsage[]>();
		for (const t of shown) {
			const arr = byGroup.get(t.group) ?? [];
			arr.push(t);
			byGroup.set(t.group, arr);
		}
		return Array.from(byGroup.entries()).map(([group, tags]) => ({ group, tags }));
	});

	const shownCompounds = $derived(tagRepo.searchCompoundTags(searchQuery));

	const detailCards = $derived.by((): CardItem[] => {
		if (view.kind === 'tag') {
			const type = view.type;
			let cards = tagRepo.cardsByTagType(type);
			if (where) {
				const w = where;
				cards = cards.filter((c) => c.tags.some((t) => t.type === type && tagMatchesWhere(t, w)));
			}
			return toCardItems(cards);
		}
		if (view.kind === 'compound') return toCardItems(tagRepo.cardsByCompoundTag(view.type));
		return [];
	});

	/** Total cards for the current tag ignoring the `where` filter (for the "show all" link). */
	const unfilteredCount = $derived(view.kind === 'tag' ? tagRepo.cardsByTagType(view.type).length : 0);

	const relatedCompounds = $derived.by(() =>
		view.kind === 'tag' ? compoundTagsContaining(view.type) : []
	);
	const compoundMembers = $derived(
		view.kind === 'compound' ? tagRepo.compoundTagMemberUsages(view.type) : []
	);

	// ---------- card mode: pack grid + focused-card audit ----------
	// Hovering a compound chip on the audit page previews which base tags drive it.
	let hoveredCompound = $state<CompoundTagType | null>(null);
	const packList = taggedPacks();
	const packCardItems = $derived<CardItem[]>(
		packInfo ? cardsToItems(packCards(packInfo.product)) : []
	);

	const focusTags = $derived<Tag[]>(focusCard ? (tagRepo.tagsOfCard(focusCard.code) ?? []) : []);
	// Card-level "belongs to" reads the rasterized memberships baked into the JSON (which
	// already honored each compound member's `where` at export time).
	const focusCompounds = $derived<CompoundTagType[]>(
		focusCard ? tagRepo.compoundTagsOfCard(focusCard.code) : []
	);
	/** The focused card's pack in printed order — the sequence prev/next walk. */
	const auditSequence = $derived<Card[]>(focusCard ? packCards(focusCard.product) : []);
	const auditIndex = $derived(
		focusCard ? auditSequence.findIndex((c) => c.code === focusCard.code) : -1
	);
	const prevCard = $derived<Card | null>(auditIndex > 0 ? auditSequence[auditIndex - 1] : null);
	const nextCard = $derived<Card | null>(
		auditIndex >= 0 && auditIndex < auditSequence.length - 1 ? auditSequence[auditIndex + 1] : null
	);
	const focusFrontImage = $derived(focusCard ? getCardImagePath(focusCard.code, 'full') : '');
	const focusBackImage = $derived<string | undefined>(
		focusCard ? getCardBackImagePath(focusCard, 'full') : undefined
	);
	/** The focused card's own pack (for the subtitle), regardless of how it was opened. */
	const focusPack = $derived(
		focusCard ? packList.find((p) => p.product === focusCard.product) : undefined
	);
	/** Back-button label: name the tag/compound/pack the audit was opened from. */
	const auditBackLabel = $derived(
		view.kind === 'tag'
			? `${m.tool_tag_browser_back_to()} ${tagName(view.type)}`
			: view.kind === 'compound'
				? `${m.tool_tag_browser_back_to()} ${compoundTagName(view.type)}`
				: packInfo
					? m.tool_tag_browser_back_to_pack()
					: m.tool_tag_browser_back_to_cards()
	);

	function formatVal(v: unknown): string {
		if (v !== null && typeof v === 'object') {
			const o = v as Record<string, unknown>;
			if ('type' in o && 'cards' in o) return `${o.type} ${o.cards}`;
			return Object.entries(o)
				.map(([k, x]) => `${k} ${x}`)
				.join(' ');
		}
		return String(v);
	}
	function argsLabel(obj: Record<string, unknown>): string {
		return Object.entries(obj)
			.map(([k, v]) => `${k}: ${formatVal(v)}`)
			.join(' · ');
	}
	function tagLabel(tag: Tag): string {
		const args = argsLabel(tagArguments(tag));
		return args ? `${tagName(tag.type)} · ${args}` : tagName(tag.type);
	}

	const tabs = [
		{ label: m.tool_tag_browser_mode_tags() },
		{ label: m.tool_tag_browser_mode_card() }
	];
</script>

<OpenGraph
	description="Browse every game-effect tag and compound archetype, and see which cards carry them."
	image="image/resource/card.webp"
	title="Tag Browser"
	url="/tool/tag-browser"
/>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
	<title>{m.tool_tag_browser_page_title()}</title>
</svelte:head>

<PageLead
	description="Browse every game-effect tag and compound archetype, and see which cards carry them."
	title={m.tool_tag_browser_title()}
/>

<MarginFull>
	<Tabs
		direction="horizontal"
		{tabs}
		activeTabIndex={mode === 'tags' ? 0 : 1}
		onTabChange={setTab}
	/>
</MarginFull>

{#if mode === 'card'}
	{#if focusCard}
		<MarginFull>
			<div class="flex flex-wrap items-center justify-between gap-3 pt-3">
				<BackButton label={auditBackLabel} onClick={backToCards} />
				<div class="flex items-center gap-2">
					<Button
						label={m.tool_tag_browser_prev()}
						icon={FaIconType.LeftSingle}
						onClick={() => prevCard && stepCard(prevCard.code)}
						disabled={!prevCard}
					/>
					<span class="text-primary-500 dark:text-primary-400 text-sm tabular-nums">
						{auditIndex + 1} / {auditSequence.length}
					</span>
					<Button
						label={m.tool_tag_browser_next()}
						icon={FaIconType.RightSingle}
						onClick={() => nextCard && stepCard(nextCard.code)}
						disabled={!nextCard}
					/>
				</div>
			</div>

			<div class="mt-4 grid gap-6 lg:grid-cols-[300px_1fr]">
				<div class="space-y-3">
					<img
						src={focusFrontImage}
						alt={focusCard.name}
						class="w-full rounded-lg shadow-md"
						loading="lazy"
					/>
					{#if focusBackImage}
						<img
							src={focusBackImage}
							alt={`${focusCard.name} (back)`}
							class="w-full rounded-lg shadow-md"
							loading="lazy"
						/>
					{/if}
				</div>
				<div>
					<InnerHeading title={focusCard.name} />
					<p class="text-primary-500 dark:text-primary-400 text-sm">
						{focusPack?.name ?? ''}{focusPack ? ' · ' : ''}{focusCard.code}
					</p>

					{#if focusTags.length === 0}
						<p class="text-primary-500 dark:text-primary-400 mt-3 italic">
							{m.tool_tag_browser_not_tagged()}
						</p>
					{:else}
						<div class="mt-3 flex flex-wrap gap-2">
							{#each focusTags as tag, i (i)}
								<TagChip
									label={tagName(tag.type)}
									args={tagArgPairs(tag)}
									count={tagRepo.tagTypeCount(tag.type)}
									icon={FaIconType.Tag}
									emphasized={hoveredCompound !== null && tagMatchesCompound(tag, hoveredCompound)}
									onClick={() => showTag(tag.type, tagArguments(tag))}
								/>
							{/each}
						</div>

						{#if focusCompounds.length > 0}
							<div class="mt-4">
								<SectionSeparator title={m.tool_tag_browser_belongs_to()} inner />
							</div>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each focusCompounds as c (c)}
									<TagChip
										label={compoundTagName(c)}
										count={tagRepo.compoundTagCount(c)}
										highlighted
										icon={FaIconType.Tags}
										onClick={() => showCompound(c)}
										onMouseEnter={() => (hoveredCompound = c)}
										onMouseLeave={() => (hoveredCompound = null)}
									/>
								{/each}
							</div>
						{/if}
					{/if}

					{#key focusCard.code}
						<CardAuditReport
							card={focusCard}
							tagLines={focusTags.map(tagLabel)}
							compoundLines={focusCompounds.map((c) => compoundTagName(c))}
						/>
					{/key}
				</div>
			</div>
		</MarginFull>
	{:else if packInfo}
		<MarginFull>
			<div class="pt-3">
				<BackButton
					label={m.tool_tag_browser_back_to_cards()}
					onClick={() => apply({ pack: null }, { push: true })}
				/>
			</div>
			<InnerHeading title={packInfo.name} />
			<p class="text-primary-500 dark:text-primary-400 mb-3 text-sm">
				{m.tool_tag_browser_pack_hint()}
			</p>
			{#if packCardItems.length > 0}
				<FlexibleCardDisplay
					cards={packCardItems}
					defaultViewMode="scans"
					initialSettings={cardSettings}
					onSettingsApply={applyCardSettings}
					onCardClick={(c: Card) => openCard(c.code)}
				/>
			{/if}
		</MarginFull>
	{:else}
		<MarginText>
			<HelpParagraph>{m.tool_tag_browser_card_help()}</HelpParagraph>
		</MarginText>
		<MarginFull>
			<div class="mb-6">
				<CardFormSingle
					label={m.tool_tag_browser_jump_label()}
					placeholder={m.tool_tag_browser_jump_placeholder()}
					cards={allCards}
					filter={cardUtil.playerCardsNonCampaignFilter}
					onSelect={(card: Card) => openCard(card.code)}
				/>
			</div>

			<SectionSeparator title={m.tool_tag_browser_browse_pack()} />
			<div class="mt-2 flex flex-wrap gap-2">
				{#each packList as p (p.code)}
					<Button label={`${p.name} (${p.count})`} onClick={() => showPack(p.code)} />
				{/each}
			</div>
		</MarginFull>
	{/if}
{:else if view.kind === 'index'}
	<MarginText>
		<HelpParagraph>
			Cards are tagged by the game effects in their text box. Search or pick a tag to see every card
			with it, and jump between a tag and the compound archetypes (broader groupings) that contain
			it.
		</HelpParagraph>
	</MarginText>
	<MarginFull>
		<div class="mb-6">
			<TextInput
				value={searchQuery}
				label={m.tool_tag_browser_search_label()}
				placeholder={m.tool_tag_browser_search_placeholder()}
				oninput={(value: string) => apply({ q: value || null })}
			/>
		</div>

		<SectionSeparator title={m.tool_tag_browser_tags()} />
		{#each groupedTags as group (group.group)}
			<div class="mb-5">
				<h3
					class="text-primary-600 dark:text-primary-300 text-sm font-semibold tracking-wide uppercase"
				>
					{tagGroupName(group.group)}
				</h3>
				{#if tagGroupDescription(group.group)}
					<p class="text-primary-500 dark:text-primary-400 mb-2 text-xs">
						{tagGroupDescription(group.group)}
					</p>
				{:else}
					<div class="mb-2"></div>
				{/if}
				<div class="flex flex-wrap gap-2">
					{#each group.tags as t (t.type)}
						<TagChip
							label={t.label}
							count={t.count}
							icon={FaIconType.Tag}
							onClick={() => showTag(t.type)}
						/>
					{/each}
				</div>
			</div>
		{/each}
		{#if groupedTags.length === 0}
			<p class="text-primary-500 dark:text-primary-400 italic">No tags match “{searchQuery}”.</p>
		{/if}

		<div class="mt-8">
			<SectionSeparator title={m.tool_tag_browser_compound_tags()} />
			<div class="flex flex-wrap gap-2">
				{#each shownCompounds as c (c.type)}
					<TagChip
						label={c.label}
						count={c.count}
						highlighted
						icon={FaIconType.Tags}
						onClick={() => showCompound(c.type)}
					/>
				{/each}
			</div>
			{#if shownCompounds.length === 0}
				<p class="text-primary-500 dark:text-primary-400 italic">
					No compound tags match “{searchQuery}”.
				</p>
			{/if}
		</div>
	</MarginFull>
{:else if view.kind === 'tag'}
	<MarginFull>
		<div class="pt-3">
			<BackButton label={m.tool_tag_browser_back()} onClick={showIndex} />
		</div>

		<InnerHeading title={tagName(view.type)} />
		<p class="text-primary-500 dark:text-primary-400 text-sm">
			{tagGroupName(groupOfTagType(view.type))} · {view.type}
		</p>
		{#if tagDescription(view.type)}
			<p class="text-primary-800 dark:text-primary-200 mt-1 mb-3">{tagDescription(view.type)}</p>
		{:else}
			<div class="mb-3"></div>
		{/if}

		{#if where}
			<div
				class="border-secondary-400 bg-secondary-50 dark:border-secondary-500 dark:bg-secondary-950 mb-4 flex flex-wrap items-center gap-3 rounded border px-3 py-2 text-sm"
			>
				<span class="text-primary-800 dark:text-primary-200">
					Filtered to <strong>{argsLabel(where)}</strong>
				</span>
				<Button
					label={`Show all ${tagName(view.type)} (${unfilteredCount})`}
					onClick={() => showTag(view.type)}
				/>
			</div>
		{/if}

		{#if relatedCompounds.length > 0}
			<SectionSeparator title={m.tool_tag_browser_in_compound()} inner />
			<div class="mt-2 mb-4 flex flex-wrap gap-2">
				{#each relatedCompounds as c (c.type)}
					<TagChip
						label={compoundTagName(c.type)}
						count={tagRepo.compoundTagCount(c.type)}
						highlighted
						icon={FaIconType.Tags}
						onClick={() => showCompound(c.type)}
					/>
				{/each}
			</div>
		{/if}

		<SectionSeparator title={`${m.tool_tag_browser_cards()} (${detailCards.length})`} />
		{#if detailCards.length > 0}
			<FlexibleCardDisplay
				cards={detailCards}
				defaultViewMode="scans"
				initialSettings={cardSettings}
				onSettingsApply={applyCardSettings}
				onCardClick={(c: Card) => openCard(c.code)}
			/>
		{/if}

		{#key view.type}
			<TagErrorReport tagType={view.type} tagDisplayName={tagName(view.type)} {allCards} />
		{/key}
	</MarginFull>
{:else if view.kind === 'compound'}
	<MarginFull>
		<div class="pt-3">
			<BackButton label={m.tool_tag_browser_back()} onClick={showIndex} />
		</div>

		<InnerHeading title={compoundTagName(view.type)} />
		{#if compoundTagDescription(view.type)}
			<p class="text-primary-800 dark:text-primary-200 mb-4">{compoundTagDescription(view.type)}</p>
		{/if}

		<SectionSeparator title={m.tool_tag_browser_members()} inner />
		<div class="mt-2 mb-4 flex flex-wrap gap-2">
			{#each compoundMembers as member (member.type + JSON.stringify(member.where ?? {}))}
				<TagChip
					label={member.label}
					args={whereArgPairs(member.where)}
					count={member.count}
					icon={FaIconType.Tag}
					onClick={() => showTag(member.type, member.where)}
				/>
			{/each}
		</div>

		<SectionSeparator title={`${m.tool_tag_browser_cards()} (${detailCards.length})`} />
		{#if detailCards.length > 0}
			<FlexibleCardDisplay
				cards={detailCards}
				defaultViewMode="scans"
				initialSettings={cardSettings}
				onSettingsApply={applyCardSettings}
				onCardClick={(c: Card) => openCard(c.code)}
			/>
		{/if}
	</MarginFull>
{/if}

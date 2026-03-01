<!--
@component
Account-wide profile settings (NOT widgets): the default tracked difficulty tiers,
the default Archived Campaign visibility, and owned products. Snapshots `initialSettings`,
edits only the globals, and `currentPayload()` returns the FULL settings JSON with
the panes/campaigns layouts preserved. Lives on /settings; widgets are customized
per-page.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Checkbox, SectionSeparator, TextButton } from '@5argon/arkham-life-ui';
	import { difficultyLabel } from '$lib/campaign/difficulty';
	import { u as stringUtils } from '@5argon/arkham-string';
	import {
		productChapterOneCampaignExpansions,
		productChapterOneInvestigatorExpansions,
		productChapterTwoCampaignExpansions,
		productCoreSets,
		productInvestigatorDeck,
		productInvestigatorStarterDeck,
		productOther,
		productReturnTo,
		productStandalone,
		type Product,
	} from '@5argon/arkham-kohaku';
	import { ALL_TIERS, ALL_CAMPAIGN_GROUPS, type CampaignGroup, type DifficultyTier, type ProfileSettings } from '$lib/campaign/profile-settings';
	import { untrack } from 'svelte';

	let { initialSettings }: { initialSettings: ProfileSettings } = $props();

	const PRODUCT_GROUPS: { label: string; products: Product[] }[] = [
		{ label: 'Core Sets', products: productCoreSets },
		{ label: 'Campaign Expansions', products: [...productChapterOneCampaignExpansions, ...productChapterTwoCampaignExpansions] },
		{ label: 'Investigator Expansions', products: productChapterOneInvestigatorExpansions },
		{ label: 'Return-to', products: productReturnTo },
		{ label: 'Investigator Decks', products: [...productInvestigatorStarterDeck, ...productInvestigatorDeck] },
		{ label: 'Standalone', products: productStandalone },
		{ label: 'Other', products: productOther },
	];
	const ALL_PRODUCTS: Product[] = PRODUCT_GROUPS.flatMap((g) => g.products);

	const CAMPAIGN_GROUP_LABELS: Record<CampaignGroup, string> = {
		chapterOne: m.framework_campaign_group_chapter_one(),
		chapterOneReturnTo: m.framework_campaign_group_chapter_one_return_to(),
		chapterTwo: m.framework_campaign_group_chapter_two(),
	};

	let trackedTiers = $state<Set<DifficultyTier>>(untrack(() => new Set(initialSettings.trackedTiers)));
	let trackedCampaignGroups = $state<Set<CampaignGroup>>(untrack(() => new Set(initialSettings.trackedCampaignGroups)));
	let hideExpert = $state(untrack(() => initialSettings.hideUntrackedDifficultyAchievements));
	let hideArchivesByDefault = $state(untrack(() => initialSettings.defaultArchiveDisplayInProfile === 'hidden'));
	let owned = $state<Set<Product>>(untrack(() => new Set<Product>(initialSettings.ownedProducts ?? ALL_PRODUCTS)));
	// Accessibility: pen-and-paper / log-only players hide everything that needs the Extra tab or
	// imported decks (`logOnly`), and hide the deck-only Cards/Investigators categories wholesale.
	let logOnly = $state(untrack(() => initialSettings.logOnly ?? false));
	let campaignCategoriesOnly = $state(untrack(() => initialSettings.campaignCategoriesOnly ?? false));

	function toggleTier(t: DifficultyTier) {
		const next = new Set(trackedTiers);
		next.has(t) ? next.delete(t) : next.add(t);
		trackedTiers = next;
	}
	function toggleCampaignGroup(g: CampaignGroup) {
		const next = new Set(trackedCampaignGroups);
		next.has(g) ? next.delete(g) : next.add(g);
		trackedCampaignGroups = next;
	}
	function toggleOwned(p: Product) {
		const next = new Set(owned);
		next.has(p) ? next.delete(p) : next.add(p);
		owned = next;
	}
	function setGroup(products: Product[], on: boolean) {
		const next = new Set(owned);
		for (const p of products) on ? next.add(p) : next.delete(p);
		owned = next;
	}
	function productLabel(p: Product): string {
		return stringUtils.productName(p, true);
	}

	const payload = $derived.by((): string => {
		const ownAll = ALL_PRODUCTS.every((p) => owned.has(p));
		const next: ProfileSettings = {
			...initialSettings,
			ownedProducts: ownAll ? null : [...owned],
			trackedTiers: ALL_TIERS.filter((t) => trackedTiers.has(t)),
			trackedCampaignGroups: ALL_CAMPAIGN_GROUPS.filter((g) => trackedCampaignGroups.has(g)),
			hideUntrackedDifficultyAchievements: hideExpert,
			defaultArchiveDisplayInProfile: hideArchivesByDefault ? 'hidden' : 'visible',
			logOnly,
			campaignCategoriesOnly,
		};
		return JSON.stringify(next);
	});

	/** The full settings as a JSON string (globals updated) — read by the page on save. */
	export function currentPayload(): string {
		return payload;
	}
</script>

<!-- ── Default tracked difficulty tiers ───────────────────────────────────── -->
<div>
	<SectionSeparator title={m.framework_globals_tiers_title()} />
	<p class="text-primary-500 mb-2 text-sm">{m.framework_globals_tiers_description()}</p>
	<div class="flex flex-wrap gap-4">
		{#each ALL_TIERS as t (t)}
			<Checkbox label={difficultyLabel(t)} checked={trackedTiers.has(t)} onChange={() => toggleTier(t)} />
		{/each}
	</div>
	<div class="mt-3">
		<Checkbox small label={m.framework_globals_hide_untracked_difficulty()} bind:checked={hideExpert} />
	</div>
</div>

<!-- ── Tracked campaign groups ────────────────────────────────────────────── -->
<div class="mt-6">
	<SectionSeparator title={m.framework_globals_campaign_groups_title()} />
	<p class="text-primary-500 mb-2 text-sm">{m.framework_globals_campaign_groups_description()}</p>
	<div class="flex flex-wrap gap-4">
		{#each ALL_CAMPAIGN_GROUPS as g (g)}
			<Checkbox label={CAMPAIGN_GROUP_LABELS[g]} checked={trackedCampaignGroups.has(g)} onChange={() => toggleCampaignGroup(g)} />
		{/each}
	</div>
</div>

<!-- ── Archived Campaign visibility default ───────────────────────────────── -->
<div class="mt-6">
	<SectionSeparator title={m.framework_globals_archive_title()} />
	<p class="text-primary-500 mb-2 text-sm">
		{m.framework_globals_archive_description_1()}
		<strong>{m.framework_globals_archive_display_in_profile()}</strong> {m.framework_globals_archive_description_2()} <em>{m.framework_globals_archive_default()}</em> {m.framework_globals_archive_description_3()}
	</p>
	<Checkbox small label={m.framework_globals_archive_hide_default()} bind:checked={hideArchivesByDefault} />
</div>

<!-- ── Accessibility: log-only players ────────────────────────────────────── -->
<div class="mt-6">
	<SectionSeparator title={m.framework_globals_log_only_title()} />
	<p class="text-primary-500 mb-2 text-sm">{m.framework_globals_log_only_description()}</p>
	<div class="flex flex-col items-start gap-2">
		<Checkbox small label={m.framework_globals_log_only_toggle()} bind:checked={logOnly} />
		<Checkbox small label={m.framework_globals_campaign_only_toggle()} bind:checked={campaignCategoriesOnly} />
	</div>
</div>

<!-- ── Owned products ─────────────────────────────────────────────────────── -->
<div class="mt-6">
	<SectionSeparator title={m.framework_globals_owned_title()} />
	<p class="text-primary-500 mb-3 text-sm">{m.framework_globals_owned_description()}</p>
	<div class="space-y-4">
		{#each PRODUCT_GROUPS as group (group.label)}
			{@const allOn = group.products.every((p) => owned.has(p))}
			<div>
				<div class="mb-1 flex items-center justify-between">
					<h3 class="text-primary-700 dark:text-primary-300 text-sm font-semibold">{group.label}</h3>
					<TextButton size="xs" label={allOn ? m.framework_clear_all() : m.framework_select_all()} onClick={() => setGroup(group.products, !allOn)} />
				</div>
				<div class="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
					{#each group.products as p (p)}
						<Checkbox small label={productLabel(p)} checked={owned.has(p)} onChange={() => toggleOwned(p)} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

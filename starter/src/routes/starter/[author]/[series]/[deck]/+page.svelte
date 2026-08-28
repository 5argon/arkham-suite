<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Button,
		DeckDisplay,
		FaIconType,
		MarginFull,
		MarginText,
		PageLead,
		SmallTabs
	} from '@5argon/arkham-life-ui';
	import { deck as deckUtils, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	import { createCardResolver, getAllCards, loadAllTabooLists } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import DownloadDeckJsonModal from '$lib/design/components/deck/DownloadDeckJsonModal.svelte';
	import UpgradePlanView from '$lib/design/pages/tool/upgrade/layout/UpgradePlanView.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		starterDeck,
		starterAuthorHref,
		starterDeckHref,
		starterSeriesHref,
		toCore2026Code
	} from '$lib/starter-content';
	import { protoStringRestore } from '$lib/tool/script/export/proto-string-restore';
	import { starterTeam } from '$lib/tool/starter/team-cart.svelte';

	const { data } = $props();
	const resolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const entry = $derived(data.entry);
	const author = $derived(entry.series.author);

	// One tab per XP breakpoint, labeled with the XP the build actually uses,
	// plus the upgrade plan when the author provided one.
	const versions = $derived(
		entry.versions.map((version, index) => {
			const deck = linkedAhdbDeckToDeck({ deck: version.deck }, resolver, tabooLists);
			return { index, breakpoint: version.breakpoint, deck, xp: deckUtils.calculateDeckXp(deck) };
		})
	);
	// Stored as the planner's ?i= value, i.e. URL-encoded base64; card codes
	// get the same Core Set 2026 normalization as the decks.
	const plan = $derived.by(() => {
		if (entry.upgradePlan === undefined) return null;
		const restored = protoStringRestore(decodeURIComponent(entry.upgradePlan));
		return {
			...restored,
			rows: restored.rows.map((r) => ({
				...r,
				left: r.left === null ? null : toCore2026Code(r.left),
				right: r.right === null ? null : toCore2026Code(r.right)
			}))
		};
	});
	const tabs = $derived([
		...versions.map((v) => ({
			value: String(v.index),
			label: m.starter_decks_xp_tab({ xp: v.xp })
		})),
		...(plan === null ? [] : [{ value: 'plan', label: m.starter_decks_upgrade_plan() }])
	]);
	let tab = $state('0');
	const shownVersion = $derived(versions.find((v) => String(v.index) === tab) ?? versions[0]);

	const member = $derived({
		author: author.slug,
		series: entry.series.slug,
		slug: entry.slug
	});
	const inTeam = $derived(starterTeam.has(member));
	const investigatorTaken = $derived(
		!inTeam &&
			starterTeam.hasInvestigator(
				entry.primary.investigator_code,
				(m) => starterDeck(m.author, m.series, m.slug)?.primary.investigator_code
			)
	);

	let showDownload = $state(false);
	// While the full description reader is open, the header DeckDisplay takes
	// over the page; the extra content below must step aside too.
	let readingDescription = $state(false);
	const downloadItems = $derived(
		versions.map((v) => ({
			label: m.starter_decks_xp_tab({ xp: v.xp }),
			deck: entry.versions[v.index].deck,
			fileName: `${entry.slug}-${v.xp}xp.json`
		}))
	);
</script>

<OpenGraph
	description={m.starter_decks_by_author({ author: author.name })}
	image="image/resource/starter.webp"
	title={entry.primary.name}
	url={starterDeckHref(entry)}
/>

<svelte:head>
	<title>{m.starter_decks_deck_viewer_title()} | {entry.primary.name}</title>
</svelte:head>

<PageLead title={entry.primary.name} />

<MarginText>
	<div class="mb-3 flex flex-col items-center gap-2">
		<p class="text-primary-800 dark:text-primary-200 text-center text-sm">
			<a
				class="font-semibold hover:underline"
				href={resolve(starterAuthorHref(author) as '/starter/[author]', {})}
			>
				{m.starter_decks_by_author({ author: author.name })}
			</a>
			·
			<a
				class="font-semibold hover:underline"
				href={resolve(starterSeriesHref(entry.series) as '/starter/[author]/[series]', {})}
			>
				{entry.series.name}
			</a>
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			<Button icon={FaIconType.Back} label={m.starter_decks_title()} onClick="/starter" />
			<Button
				highlighted={!inTeam && !starterTeam.isFull && !investigatorTaken}
				disabled={!inTeam && (starterTeam.isFull || investigatorTaken)}
				icon={inTeam ? FaIconType.Delete : FaIconType.Add}
				label={inTeam
					? m.starter_decks_remove_from_team()
					: starterTeam.isFull
						? m.starter_decks_team_full()
						: investigatorTaken
							? m.starter_decks_investigator_taken()
							: m.starter_decks_add_to_team()}
				onClick={() => (inTeam ? starterTeam.remove(member) : starterTeam.add(member))}
			/>
			<Button
				icon={FaIconType.Export}
				label={m.starter_decks_download_json()}
				onClick={() => (showDownload = true)}
			/>
		</div>
	</div>
	<p class="text-primary-700 dark:text-primary-300 mb-4 text-center text-sm">
		{m.starter_decks_arkhamdb_note({ author: author.name })}
	</p>
</MarginText>

{#snippet versionTabs()}
	{#if tabs.length > 1}
		<div class="flex justify-center">
			<SmallTabs options={tabs} value={tab} onSelect={(v) => (tab = v)} />
		</div>
	{/if}
{/snippet}

<MarginFull>
	<!-- The banner and description always show the base build; the tabs only
	     swap the lists beneath them. -->
	<DeckDisplay
		cardResolver={resolver}
		deck={versions[0].deck}
		mode="decklist"
		byline={[
			{ label: author.name, href: starterAuthorHref(author) },
			{ label: entry.series.name, href: starterSeriesHref(entry.series) }
		]}
		beforeList={versionTabs}
		hideList={shownVersion.index !== 0 || tab === 'plan'}
		highlightStatsAtLeast={4}
		dimStatsAtMost={2}
		bind:showDescriptionReader={readingDescription}
	/>
	{#if readingDescription}
		<!-- reader open -->
	{:else if tab === 'plan' && plan !== null}
		<!-- Matches the header display's own gap between its tabs and lists. -->
		<!-- Same entrance as the card lists, so switching tabs feels uniform. -->
		<div class="mt-2" in:fly|global={{ duration: 250, delay: 200, easing: quintOut }}>
			<UpgradePlanView {plan} cards={getAllCards()} {tabooLists} />
		</div>
	{:else if shownVersion.index !== 0}
		{#key shownVersion.index}
			<div class="mt-2">
				<DeckDisplay cardResolver={resolver} deck={shownVersion.deck} mode="decklist" hideHeader />
			</div>
		{/key}
	{/if}
</MarginFull>

<DownloadDeckJsonModal
	title={m.starter_decks_download_json()}
	items={downloadItems}
	isOpen={showDownload}
	onClose={() => (showDownload = false)}
/>

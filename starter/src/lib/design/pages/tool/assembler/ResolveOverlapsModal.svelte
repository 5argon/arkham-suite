<!--
@component
Resolves a team combination's overlaps copy by copy: each row is one copy of
an overlapping card in one deck and takes an optional replacement (cards
that investigator can use). Once every card fits the available copies, the
resolved team can be copied as ArkhamDB HTML / plain text or opened straight
in Deck Gather or the Team Builder.
-->
<script lang="ts">
	import {
		Button,
		CardLine,
		FaIconType,
		HelpParagraph,
		Modal,
		SearchableDropdown
	} from '@5argon/arkham-life-ui';
	import type { AhdbDeck, Card } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';
	import clsx from 'clsx';

	import * as m from '$lib/paraglide/messages.js';
	import {
		allResolved,
		applyResolutions,
		groupResolved,
		keptCopies,
		type OverlapGroup,
		overlapsToHtml,
		overlapsToText,
		replacementCandidates
	} from '$lib/tool/assembler/resolve-overlaps';
	import { decksToEvergreen } from '$lib/tool/evergreen-team/from-decks';
	import { openInDeckGather } from '$lib/tool/interop/transient-decks';

	interface Prop {
		isOpen: boolean;
		onClose: () => void;
		/**
		 * Owned by the page so a combination keeps its resolution across
		 * openings; rows are mutated in place through the callbacks below.
		 */
		groups: OverlapGroup[];
		/**
		 * ArkhamDB-shaped decks of the combination, in any order.
		 */
		decks: AhdbDeck[];
		allCards: Card[];
		onSetReplacement: (rowKey: string, card: Card | null) => void;
		onReset: () => void;
	}
	const { isOpen, onClose, groups, decks, allCards, onSetReplacement, onReset }: Prop = $props();

	const resolved = $derived(allResolved(groups));
	const labels = {
		overlaps: m.tool_assembler_overlaps_label(),
		usedAvailable: (used: number, available: number) =>
			m.tool_assembler_used_available({ used, available }),
		noChange: m.tool_assembler_no_change()
	};
	const productName = (card: Card) => stringUtils.productName(card.product);

	let copied = $state<'html' | 'text' | null>(null);
	function copy(kind: 'html' | 'text') {
		const text =
			kind === 'html'
				? overlapsToHtml(groups, productName, labels)
				: overlapsToText(groups, productName, labels);
		navigator.clipboard.writeText(text);
		copied = kind;
		setTimeout(() => (copied = null), 1800);
	}

	const resolvedDecks = () => applyResolutions(decks, groups);
	function openGather() {
		openInDeckGather(resolvedDecks());
	}
	function openTeamBuilder() {
		window.open(
			`/tool/team-builder?t=${decksToEvergreen(resolvedDecks(), allCards)}`,
			'_blank',
			'noopener'
		);
	}

	// Candidate lists are per investigator; computed once per open.
	const candidatesByInvestigator = $derived.by(() => {
		const byCode: Record<string, Card[]> = {};
		for (const group of groups) {
			for (const row of group.rows) {
				byCode[row.investigator.code] ??= replacementCandidates(row.investigator, allCards);
			}
		}
		return byCode;
	});
</script>

{#snippet cardItem(card: Card)}
	<CardLine {card} />
{/snippet}

<Modal {isOpen} {onClose} maxWidth="lg" title={m.tool_assembler_resolve_title()}>
	<div class="flex flex-col gap-4">
		<HelpParagraph>{m.tool_assembler_resolve_help()}</HelpParagraph>
		{#each groups as group (group.card.code)}
			{@const ok = groupResolved(group)}
			<div class="border-primary-300 dark:border-primary-700 rounded-lg border">
				<div
					class={clsx(
						'flex flex-wrap items-center justify-between gap-2 rounded-t-lg px-3 py-1.5',
						ok ? 'bg-green-600/15' : 'bg-red-600/10'
					)}
				>
					<CardLine card={group.card} />
					<span
						class={clsx(
							'rounded-full px-2 py-0.5 text-xs font-bold',
							ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
						)}
					>
						<!-- Live: copies still kept after the replacements chosen so far. -->
						{ok
							? m.tool_assembler_resolved()
							: m.tool_assembler_used_available({
									used: keptCopies(group),
									available: group.available
								})}
					</span>
				</div>
				<table class="w-full border-separate border-spacing-y-1 px-2 pb-2">
					<tbody>
						{#each group.rows as row (row.key)}
							<tr>
								<td class="w-px pr-2 whitespace-nowrap">
									<CardLine noReserveCardTypeIcon hideIcons card={row.investigator} />
								</td>
								<td class="text-primary-500 w-px px-1">→</td>
								<td>
									{#if row.replacement !== null}
										<span class="flex items-center gap-2">
											<CardLine card={row.replacement} />
											<button
												type="button"
												class="text-primary-600 hover:bg-primary-300 dark:text-primary-300 dark:hover:bg-primary-700 cursor-pointer rounded-full px-1.5"
												aria-label={m.tool_assembler_no_change()}
												onclick={() => onSetReplacement(row.key, null)}
											>
												✕
											</button>
										</span>
									{:else}
										<SearchableDropdown
											label=""
											placeholder={m.tool_assembler_replacement_placeholder()}
											items={candidatesByInvestigator[row.investigator.code] ?? []}
											searchKeys={['name']}
											filter={(card) => card.code !== group.card.code}
											onSelect={(card) => onSetReplacement(row.key, card)}
											renderItem={cardItem}
											maxResults={30}
										/>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
		<div class="flex flex-wrap items-center justify-center gap-2">
			<Button
				icon={FaIconType.Reset}
				label={m.tool_assembler_reset_resolution()}
				onClick={onReset}
			/>
			<Button
				icon={FaIconType.Export}
				label={copied === 'html' ? m.tool_assembler_copied() : m.tool_assembler_copy_html()}
				onClick={() => copy('html')}
			/>
			<Button
				icon={FaIconType.Export}
				label={copied === 'text' ? m.tool_assembler_copied() : m.tool_assembler_copy_text()}
				onClick={() => copy('text')}
			/>
			<Button
				highlighted={resolved}
				disabled={!resolved}
				icon={FaIconType.ExternalLink}
				label={m.tool_assembler_open_gather()}
				onClick={openGather}
			/>
			<Button
				highlighted={resolved}
				disabled={!resolved}
				icon={FaIconType.ExternalLink}
				label={m.tool_assembler_open_team_builder()}
				onClick={openTeamBuilder}
			/>
		</div>
	</div>
</Modal>

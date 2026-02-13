<script lang="ts">
	import { type Card, CardResolver, type TabooLists } from '@5argon/arkham-kohaku';
	import { BorderedContainer, Button, FaIconType, Modal, PageLead } from '@5argon/arkham-life-ui';
	import { CardInfo_CommitOptions_CommitIcon } from '$lib/proto/generated/card_info';
	import type { ExportOptions } from '$lib/proto/generated/export_options';
	import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';
	import {
		type UpgradeExportOptions,
		UpgradeExportOptions_SimpleListOptions_BlockStyle,
		UpgradeExportOptions_UpgradeExportStyle
	} from '$lib/proto/generated/upgrade_export';
	import type { ExportCard, UpgradeExportRow } from '$lib/tool/script/export/export-tools-center';
	import type {
		CardWithQuantity,
		RestoreResult
	} from '$lib/tool/script/export/proto-string-restore';
	import { placeholderCard, type Row } from '$lib/tool/upgrade/interface';
	import type {
		TableRowActionEvents,
		TableRowEditEvents
	} from '$lib/tool/upgrade/upgrade-table/row-events';
	import {
		addCardToList,
		createRow,
		customizationCycle,
		oneSideMoveDown,
		oneSideMoveUp,
		rowMoveDown,
		rowMoveFromTo,
		rowMoveUp
	} from '$lib/tool/upgrade/upgrade-table/row-operations';
	import type { ToolbarEvents } from '$lib/tool/upgrade/upgrade-table/table-events';
	import { type CalculatedXp, calculateXps } from '$lib/tool/upgrade/upgrade-table/xp-calculate';
	import { getLatestTaboo } from '$lib/tool/upgrade/taboo-helper';
	import { convertCardClass, getProductDisplayName } from '$lib/tool/upgrade/card-helper';

	import UpgradeExportModalContent from '../export/UpgradeExportModalContent.svelte';
	import StagingArea from '../staging-area/StagingArea.svelte';
	import UpgradeTable from '../upgrade-table/UpgradeTable.svelte';
	import UpgradeToolbar from '../upgrade-table/UpgradeToolbar.svelte';

	interface Props {
		pageTitle: string;
		// helpMd is kept in interface for future use but not currently consumed
		helpMd: string;
		restoreResult?: RestoreResult | null;
		cards: Card[];
		tabooLists: TabooLists;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { pageTitle, helpMd: _helpMd, restoreResult = null, cards, tabooLists }: Props = $props();

	let viewMode = $derived(restoreResult !== null);

	// Extract initial values from restoreResult (these are server-side values that won't change)
	// Using function calls to avoid Svelte 5 reactivity warnings for one-time initialization
	const getInitialTabooEnabled = () => restoreResult?.exportOptions.globalSettings?.taboo ?? true;
	const getInitialStagingCards1 = () => restoreResult?.cardsMain ?? [];
	const getInitialStagingCards2 = () => restoreResult?.cardsSide ?? [];
	const getInitialRows = () => restoreResult?.rows ?? [];
	const getInitialUpgradeExportOptions = () =>
		restoreResult?.upgradeExportOptions ?? {
			upgradeUrl: true,
			arrow: {
				character: '→',
				highlightUpgrade: true
			},
			columns: {
				cumulativeColumn: true,
				markColumn: true,
				xpColumn: true
			},
			headers: {
				costHeader: 'Cost',
				totalHeader: 'Total'
			},
			ignoreSmall: false,
			simpleList: false,
			splitDivider: false,
			xpSuffix: 'XP',
			simpleListOptions: {
				blockStyle: UpgradeExportOptions_SimpleListOptions_BlockStyle.A
			},
			showLink: true,
			showLinkText: '(View at arkham-starter.com)',
			upgradeExportStyle: UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb
		};
	const getInitialExportOptions = () =>
		restoreResult?.exportOptions ?? {
			cardInfo: {
				cardInfoTypes: [],
				commitOptions: { highlight: CardInfo_CommitOptions_CommitIcon.Unknown },
				traitOptions: { highlight: '' }
			},
			cardOptions: {
				bold: false,
				classIcons: true,
				color: true,
				exceptionalIcon: true,
				link: true,
				tabooIcon: true,
				expansion: false
			},
			globalSettings: { pipStyle: GlobalSettings_PipStyle.Pips, taboo: true }
		};

	// Reconstruct CardResolver from the Card[] array received from server
	// The server has already done the work of converting AhdbCard[] to Card[]
	let latestTaboo = $derived(getLatestTaboo(tabooLists));

	let tabooEnabled = $state(getInitialTabooEnabled());
	let editMode = $state(false);
	let globalSettings = $derived({
		pipStyle: GlobalSettings_PipStyle.Pips,
		taboo: tabooEnabled
	});

	let cardResolver = $derived.by(() => {
		const activeTaboo = globalSettings.taboo && latestTaboo ? latestTaboo : null;
		return new CardResolver(cards, activeTaboo);
	});

	let stagingCards1 = $state<CardWithQuantity[]>(getInitialStagingCards1());
	let stagingCards2 = $state<CardWithQuantity[]>(getInitialStagingCards2());

	function rowToExportRow(
		r: Row,
		i: number,
		resolver: CardResolver,
		c: CalculatedXp
	): UpgradeExportRow {
		function convertCard(
			code: string | null,
			resolver: CardResolver,
			right: boolean
		): ExportCard | null {
			if (code === null || code === placeholderCard) {
				return null;
			}

			let card;
			try {
				card = resolver.resolve(code);
			} catch {
				return null;
			}

			const classes = convertCardClass(card);
			const noZeroCus = card.customizationOptions?.filter((x) => x.xp > 0) ?? [];
			const selectedCus = noZeroCus[r.customizationChoice];
			const customizableChoiceName =
				selectedCus?.text?.title ?? (selectedCus ? `${selectedCus.xp}XP Option` : '');

			return {
				cardName: card.name,
				expansionName: getProductDisplayName(card),
				class1: classes.class1,
				class2: classes.class2,
				class3: classes.class3,
				cost: typeof card.cost === 'number' ? card.cost : null,
				exceptional: card.exceptional ?? false,
				exceptionalTaboo: card.exceptional ?? false, // Taboo is already applied in resolver
				id: card.code,
				skillAgility: card.skillAgility ?? null,
				skillCombat: card.skillCombat ?? null,
				skillIntellect: card.skillIntellect ?? null,
				skillWild: card.skillWild ?? null,
				skillWillpower: card.skillWillpower ?? null,
				traits: card.traits ?? [],
				xp: card.xp ?? null,
				xpTaboo: 0, // Taboo is already applied in resolver, no separate xpTaboo
				customizable:
					card.customizationOptions !== undefined && card.customizationOptions.length > 0,
				showingCustomizableChoice: right ? r.custom : false,
				customizableChoiceIndex: r.customizationChoice,
				customizableChoiceBoxes: selectedCus?.xp ?? 0,
				customizableChoiceName: customizableChoiceName
			};
		}

		return {
			cardLeft: convertCard(r.left, resolver, false),
			cardRight: convertCard(r.right, resolver, true),
			leftPlaceholder: r.left === placeholderCard,
			rightPlaceholder: r.right === placeholderCard,
			divider: r.divider,
			dividerText: r.dividerText,
			mark: r.mark,
			xp: c.costs[i],
			xpCumulative: c.cumulatives[i],
			xpCumulativeUnlocked: r.dividerXpCumulativeUnlock,
			xpUnlocked: r.xpUnlock
		};
	}

	let rows = $state<Row[]>(getInitialRows());
	let exportRows = $state<UpgradeExportRow[]>([]);

	let showingExportModal = $state(false);

	const toolbarEvents: ToolbarEvents = {
		onAddCardRow: () => {
			rows = [...rows, createRow(false)];
		},
		onAddDividerRow: () => {
			rows = [...rows, createRow(true)];
		},
		onClear: () => {
			rows = [];
		},
		onExportMarkdown: (resolver: CardResolver) => {
			const calc = calculateXps(resolver, rows, globalSettings);
			exportRows = rows.map((x, i) => rowToExportRow(x, i, resolver, calc));
			showingExportModal = true;
		},
		onTabooToggle: (tabooOn: boolean) => {
			globalSettings = { ...globalSettings, taboo: tabooOn };
		}
	};
	const rowActionEvents: TableRowActionEvents = {
		onDelete: (i) => {
			rows.splice(i, 1);
			rows = [...rows];
		},
		onDeleteLeft: (i) => {
			rows[i].left = null;
			rows = [...rows];
		},
		onDeleteRight: (i) => {
			rows[i].right = null;
			rows = [...rows];
		},
		onMoveDown: (i) => {
			rows = rowMoveDown(rows, i);
		},
		onMoveUp: (i) => {
			rows = rowMoveUp(rows, i);
		},
		onMoveDownLeft: (i) => {
			rows = oneSideMoveDown(rows, i, false);
		},
		onMoveDownRight: (i) => {
			rows = oneSideMoveDown(rows, i, true);
		},
		onMoveUpLeft: (i) => {
			rows = oneSideMoveUp(rows, i, false);
		},
		onMoveUpRight: (i) => {
			rows = oneSideMoveUp(rows, i, true);
		}
	};
	let rowEditEvents: TableRowEditEvents = {
		onCarryoverXpChanged: (i, n) => {
			rows[i].carryoverXp = n;
		},
		onDividerChanged: (i, n) => {
			rows[i].divider = n;
		},
		onDividerTextChanged: (i, n) => {
			rows[i].dividerText = n;
		},
		onLeftChanged: (i, n) => {
			rows[i].left = n;
		},
		onRightChanged: (i, n) => {
			rows[i].right = n;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onLoseFocus: (_i) => {
			// do nothing
		},
		onMarkChanged: (i, n) => {
			rows[i].mark = n;
		},
		onXpChanged: (i, n) => {
			rows[i].xp = n;
		},
		onXpCumulativeLockChanged: (i, n, c) => {
			if (n) {
				rows[i].carryoverXp = c;
			}
			rows[i].dividerXpCumulativeUnlock = n;
		},
		onXpLockChanged: (i, n, c) => {
			if (n) {
				rows[i].xp = c;
			}
			rows[i].xpUnlock = n;
		},
		onDropSwap: (fi, fr, c, ti, tr) => {
			if (fi === -1) {
				// Add
				if (tr) {
					rows[ti].right = c;
				} else {
					rows[ti].left = c;
				}
			} else {
				// Swap
				if (fr) {
					if (tr) {
						{
							const take = rows[fi].right;
							rows[fi].right = rows[ti].right;
							rows[ti].right = take;
						}

						// Right to right also swaps customizations
						{
							const take = rows[fi].custom;
							rows[fi].custom = rows[ti].custom;
							rows[ti].custom = take;
						}
						{
							const take = rows[fi].customizationChoice;
							rows[fi].customizationChoice = rows[ti].customizationChoice;
							rows[ti].customizationChoice = take;
						}
					} else {
						const take = rows[fi].right;
						rows[fi].right = rows[ti].left;
						rows[ti].left = take;
					}
				} else {
					if (tr) {
						const take = rows[fi].left;
						rows[fi].left = rows[ti].right;
						rows[ti].right = take;

						// Left to right resets customization options.
						rows[ti].custom = false;
						rows[ti].customizationChoice = 0;
					} else {
						const take = rows[fi].left;
						rows[fi].left = rows[ti].left;
						rows[ti].left = take;
					}
				}
			}
			rows = rows;
		},
		onCustomizationCycle: (i, resolver) => {
			// Customization cycling is always on the right side.
			const right = rows[i].right;
			if (right !== null) {
				try {
					const rightCard = resolver.resolve(right);
					if (rightCard.customizationOptions !== undefined) {
						const noZeroOptions = rightCard.customizationOptions.filter((x) => x.xp > 0);
						rows[i] = customizationCycle(rows[i], noZeroOptions.length);
					}
				} catch {
					// Card not found, do nothing
				}
			}
		}
	};

	let upgradeExportOptionsBase = $state<UpgradeExportOptions>(getInitialUpgradeExportOptions());

	// Reactive version
	let upgradeExportOptions = $derived<UpgradeExportOptions>({
		...upgradeExportOptionsBase,
		simpleList: false
	});

	let exportOptionsBase = $state<ExportOptions>(getInitialExportOptions());

	// Reactive version that updates when globalSettings changes
	let exportOptions = $derived<ExportOptions>({
		...exportOptionsBase,
		cardOptions: {
			bold: false,
			classIcons: exportOptionsBase.cardOptions?.classIcons ?? true,
			color: exportOptionsBase.cardOptions?.color ?? true,
			link: exportOptionsBase.cardOptions?.link ?? true,
			tabooIcon: exportOptionsBase.cardOptions?.tabooIcon ?? true,
			exceptionalIcon: exportOptionsBase.cardOptions?.exceptionalIcon ?? true,
			expansion: exportOptionsBase.cardOptions?.expansion ?? false
		},
		globalSettings: globalSettings
	});
	let onChangeUpgradeExportOptions = (n: UpgradeExportOptions) => {
		upgradeExportOptionsBase = n;
	};
	let onChangeExportOptions = (n: ExportOptions) => {
		exportOptionsBase = n;
	};
</script>

<PageLead
	description="Plan out how you progress your deck throughout the campaign with automatic XP calculations in each step. Your plan can be saved as a URL, or export to text for pasting to your deck description."
	title={pageTitle}
/>
<Modal
	isOpen={showingExportModal}
	maxWidth="lg"
	onClose={() => {
		showingExportModal = false;
	}}
	title="Export Upgrade Plan"
>
	<UpgradeExportModalContent
		cardsMain={stagingCards1}
		cardsSide={stagingCards2}
		{exportOptions}
		{exportRows}
		{onChangeUpgradeExportOptions}
		{upgradeExportOptions}
	/>
</Modal>

{#if viewMode}
	<div class="flex justify-center mb-4">
		<Button
			icon={FaIconType.Edit}
			label="Edit Plan"
			onClick={() => {
				viewMode = false;
			}}
		/>
	</div>
	<div class="table-panel-outer mx-auto" class:edit-mode={editMode}>
		<BorderedContainer>
			<UpgradeTable
				{viewMode}
				{cardResolver}
				gs={globalSettings}
				{rows}
				{rowActionEvents}
				{rowEditEvents}
				onRowDragMove={(from, to) => {
					rows = rowMoveFromTo(rows, from, to);
				}}
			/>
		</BorderedContainer>
	</div>
{:else}
	<BorderedContainer>
		<UpgradeToolbar {cardResolver} {toolbarEvents} gs={globalSettings} />
	</BorderedContainer>
	<div class="upgrade-layout">
		<div class="staging-panel-outer" class:edit-mode={editMode}>
			<BorderedContainer>
				<div class="staging-panel" class:edit-mode={editMode}>
					<StagingArea
						{cardResolver}
						{editMode}
						onToggleEditMode={() => {
							editMode = !editMode;
						}}
						allCards={cards}
						taboos={tabooLists}
						onAddToLeftSide={(c) => {
							rows = addCardToList(rows, c, false);
						}}
						onAddToRightSide={(c) => {
							rows = addCardToList(rows, c, true);
						}}
						onRemoveFromStaging={(stage, code) => {
							if (stage === 1) {
								stagingCards1 = stagingCards1.filter((c) => c.cardId !== code);
							} else if (stage === 2) {
								stagingCards2 = stagingCards2.filter((c) => c.cardId !== code);
							}
						}}
						bind:stagingCards1
						bind:stagingCards2
					/>
				</div>
			</BorderedContainer>
		</div>
		<div class="table-panel-outer" class:edit-mode={editMode}>
			<BorderedContainer>
				<div class="table-panel" class:edit-mode={editMode}>
					<UpgradeTable
						{viewMode}
						{cardResolver}
						gs={globalSettings}
						{rows}
						{rowActionEvents}
						{rowEditEvents}
						onRowDragMove={(from, to) => {
							rows = rowMoveFromTo(rows, from, to);
						}}
					/>
				</div>
			</BorderedContainer>
		</div>
	</div>
{/if}

<style>
	.upgrade-layout {
		display: flex;
		flex-direction: row;
		gap: 2px;
		margin-top: 1rem;
		justify-content: center;
		align-items: flex-start;
	}

	.staging-panel-outer {
		width: 450px;
		flex-shrink: 0;
	}

	.staging-panel {
		height: calc(100vh - 100px);
		overflow-y: auto;
		padding-right: 10px;
	}

	.table-panel-outer {
		width: 1000px;
		flex-shrink: 0;
	}

	.table-panel {
		height: calc(100vh - 100px);
		overflow-y: auto;
		padding-right: 10px;
	}

	@media (max-width: 1450px) {
		.upgrade-layout {
			flex-direction: column;
			align-items: center;
		}

		.staging-panel-outer {
			width: auto;
		}

		.staging-panel {
			height: 450px;
		}
	}
</style>

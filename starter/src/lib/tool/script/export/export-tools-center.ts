import type { CardClass } from '@5argon/arkham-kohaku';
import type { ExportOptions } from '$lib/proto/generated/export_options';
import {
	CardWithQuantity as CardWithQuantityProto,
	UpgradeExportOptions,
	UpgradeExportOptions_UpgradeExportStyle,
	UpgradeExportProto,
	UpgradeExportRow as UpgradeExportRowProto
} from '$lib/proto/generated/upgrade_export';
import { placeholderCard } from '$lib/tool/upgrade/interface';
import type { CardWithQuantity } from './proto-string-restore';

import { upgradeExportArkhamCards } from './export-tools-arkhamcards';
import { upgradeExportArkhamDb } from './export-tools-arkhamdb';
import { binaryToUrlString } from './options';

export function upgradeExportCenter(uex: UpgradeExport): string {
	if (uex.upgradeExportOptions === undefined) {
		return '';
	}
	if (uex.exportOptions === undefined) {
		return '';
	}
	if (uex.upgradeRows === undefined) {
		return '';
	}
	const exportRows: UpgradeExportRow[] = trimEndingEmpty(uex.upgradeRows);
	const upgradeCode = makeUpgradeCode(uex);
	const style = uex.upgradeExportOptions.upgradeExportStyle;
	switch (style) {
		default:
		case UpgradeExportOptions_UpgradeExportStyle.Unknown:
		case UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb: {
			return upgradeExportArkhamDb(uex, exportRows, upgradeCode);
		}
		case UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamCards: {
			return upgradeExportArkhamCards(uex, exportRows);
		}
	}
}

function trimEndingEmpty(exportRows: UpgradeExportRow[]): UpgradeExportRow[] {
	let trimStart: number | null = null;
	for (let i = exportRows.length - 1; i > 0; i--) {
		const r = exportRows[i];
		if (r.divider === false && r.cardLeft === null && r.cardRight === null) {
			trimStart = i;
		} else {
			break;
		}
	}
	if (trimStart !== null) {
		return [...exportRows].slice(0, trimStart);
	}
	return [...exportRows];
}

function makeUpgradeCode(uex: UpgradeExport): string {
	if (uex.upgradeExportOptions.simpleList) {
		return '';
	}
	const uexd: UpgradeExport = {
		...uex
	};
	const proto = upgradeExportToProtoString(uexd);
	return `[//]: # (${makeUpgradePlannerUrl(proto)})`;
}

export function makeUpgradePlannerUrl(proto: string): string {
	return `https://arkham-starter.com/tool/upgrade?i=${proto}`;
}

export interface ExportCard {
	cardName: string;
	id: string;
	expansionName: string;
	class1: CardClass;
	class2: CardClass | null;
	class3: CardClass | null;
	xp: number | null;
	xpTaboo: number;
	exceptional: boolean;
	exceptionalTaboo: boolean;
	cost: number | null;
	skillCombat: number | null;
	skillIntellect: number | null;
	skillAgility: number | null;
	skillWillpower: number | null;
	skillWild: number | null;
	traits: string[];
	customizable: boolean;
	showingCustomizableChoice: boolean;
	customizableChoiceIndex: number;
	customizableChoiceName: string;
	customizableChoiceBoxes: number;
}

export interface UpgradeExportRow {
	mark: string;
	cardLeft: ExportCard | null;
	cardRight: ExportCard | null;
	leftPlaceholder: boolean;
	rightPlaceholder: boolean;
	xp: number;
	xpUnlocked: boolean;
	xpCumulative: number;
	xpCumulativeUnlocked: boolean;
	divider: boolean;
	dividerText: string;
}

export interface UpgradeExport {
	/**
	 * This is not in the protobuf, since we need to only remember card IDs left and right.
	 */
	upgradeRows: UpgradeExportRow[];

	upgradeExportOptions: UpgradeExportOptions;
	exportOptions: ExportOptions;
	cardsMain: CardWithQuantity[];
	cardsSide: CardWithQuantity[];
}

export function upgradeExportToProtoString(eo: UpgradeExport): string {
	const pp: UpgradeExportProto = {
		importDeckUrl: '',
		cardsMain: eo.cardsMain.map<CardWithQuantityProto>((c) => ({
			cardId: c.cardId,
			quantity: c.quantity
		})),
		cardsSide: eo.cardsSide.map<CardWithQuantityProto>((c) => ({
			cardId: c.cardId,
			quantity: c.quantity
		})),
		exportOptions: eo.exportOptions,
		upgradeExportOptions: eo.upgradeExportOptions,
		upgradeRows: eo.upgradeRows.map<UpgradeExportRowProto>((x) => {
			return {
				cardLeft: x.leftPlaceholder ? placeholderCard : (x.cardLeft?.id ?? ''),
				cardRight: x.rightPlaceholder ? placeholderCard : (x.cardRight?.id ?? ''),
				cumulativeXp: x.xpCumulative,
				cumulativeXpUnlocked: x.xpCumulativeUnlocked,
				divider: x.divider,
				dividerText: x.dividerText,
				mark: x.mark,
				xp: x.xp,
				xpUnlocked: x.xpUnlocked,
				rightCustom: x.cardRight?.showingCustomizableChoice ?? false,
				rightCustomChoice: x.cardRight?.customizableChoiceIndex ?? 0,
				rightCustomText: ''
			};
		})
	};
	const p = UpgradeExportProto.create(pp);
	const uint = UpgradeExportProto.toBinary(p);
	return binaryToUrlString(uint);
}

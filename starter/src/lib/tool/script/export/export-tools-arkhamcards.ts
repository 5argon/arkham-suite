import { makePipsStyle } from '$lib/design/interface/string-util';
import type { ExportOptions } from '$lib/proto/generated/export_options';
import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';

import { ahdbIcons, prefixClassIcons, wrapCard } from './ahdb-syntax';
import type { ExportCard, UpgradeExport, UpgradeExportRow } from './export-tools-center';

export function upgradeExportArkhamCards(
	uex: UpgradeExport,
	exportRows: UpgradeExportRow[]
): string {
	return exportRows
		.map((x) => eachRow(x, uex.exportOptions, uex.upgradeExportOptions.simpleList))
		.join('\n');
}

function eachRow(uer: UpgradeExportRow, opt: ExportOptions, simpleList: boolean): string {
	if (uer.divider) {
		return divider(uer);
	}
	const cardLeft = cardText(uer.cardLeft, opt);
	const cardRight = cardText(uer.cardRight, opt);
	const onlyRightCard = uer.cardLeft === null && uer.cardRight !== null;
	const transitionCharacter = onlyRightCard ? '+' : '→';
	if (!simpleList) {
		const secondLineSuffix = `(**${uer.xp}, ${uer.xpCumulative}** XP)`;

		if (uer.cardLeft === null) {
			return `- ${secondLineSuffix} ${cardRight}`;
		}
		return `- ${secondLineSuffix} ${cardLeft} ${transitionCharacter} ${cardRight}`;
	} else {
		return `- ${cardLeft}`;
	}
}

function divider(uer: UpgradeExportRow): string {
	const noText = uer.dividerText.trim() === '';
	return !noText ? '\n**' + uer.dividerText + '**\n' : '\n';
}

function cardText(uer: ExportCard | null, opt: ExportOptions): string {
	if (uer === null) {
		return '';
	}
	if (uer.customizable && uer.showingCustomizableChoice) {
		return mdJustcardCustomizable(uer, opt);
	}
	return mdJustcard(uer, opt);
}

function mdJustcardCustomizable(card: ExportCard, opt: ExportOptions): string {
	const boxString = new Array(card.customizableChoiceBoxes).fill('☑').join('');
	const boxesAndName = boxString + ' ' + card.customizableChoiceName;
	const wrappedLink =
		(opt.cardOptions?.link ?? true) ? wrapCard(boxesAndName, card.id) : boxesAndName;
	return wrappedLink;
}

function mdJustcard(card: ExportCard, opt: ExportOptions): string {
	let cardName = card.cardName;
	const normalPips = makePipsStyle(
		card.xp ?? 0,
		opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal,
		true,
		true
	);
	const tabooPips = makePipsStyle(
		card.xpTaboo,
		opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal,
		true,
		true
	);
	cardName =
		(opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal) !==
		GlobalSettings_PipStyle.None
			? `${cardName}${normalPips === '' ? '' : ` ${normalPips}`}`
			: cardName;
	cardName = (opt.cardOptions?.link ?? true) ? wrapCard(cardName, card.id) : cardName;
	if (opt.globalSettings?.taboo) {
		const tabooAppend = `${tabooPips}${ahdbIcons.tablet}`;
		cardName =
			(opt.globalSettings?.taboo ?? true) && card.xpTaboo > 0
				? `${cardName}${tabooAppend === '' ? '' : ` ${tabooAppend}`}`
				: cardName;
	}
	cardName =
		(opt.cardOptions?.exceptionalIcon ?? true) &&
		((!(opt.globalSettings?.taboo ?? true) && card.exceptional) ||
			((opt.globalSettings?.taboo ?? true) && card.exceptionalTaboo))
			? `${cardName}${ahdbIcons.elderSign}`
			: cardName;
	cardName =
		(opt.cardOptions?.classIcons ?? true)
			? prefixClassIcons(cardName, card.class1, card.class2, card.class3)
			: cardName;
	return cardName;
}

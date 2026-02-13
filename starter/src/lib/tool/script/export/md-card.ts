import { makePipsStyle } from '$lib/design/interface/string-util';
import type { ExportOptions } from '$lib/proto/generated/export_options';
import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';

import { ahdbIcons, prefixClassIcons, wrapCard, wrapColor } from './ahdb-syntax';
import type { ExportCard } from './export-tools-center';

/**
 * Only a part of one row about the card.
 */
export function mdCardAndInfo(card: ExportCard, opt: ExportOptions, ignoreSmall: boolean): string {
	if (card.customizable && card.showingCustomizableChoice) {
		return mdJustcardCustomizable(card, opt, ignoreSmall);
	}
	return mdJustcard(card, opt, ignoreSmall);
}

function mdJustcardCustomizable(
	card: ExportCard,
	opt: ExportOptions,
	ignoreSmall: boolean
): string {
	const boxString = new Array(card.customizableChoiceBoxes).fill('☑').join('');
	const boxesAndName = boxString + ' ' + card.customizableChoiceName;
	const wrappedColor = wrapColor(boxesAndName, card.class1, card.class2, card.class3, !ignoreSmall);
	const wrappedLink =
		(opt.cardOptions?.link ?? true) ? wrapCard(wrappedColor, card.id) : wrappedColor;
	return wrappedLink;
}

function mdJustcard(card: ExportCard, opt: ExportOptions, ignoreSmall: boolean): string {
	let cardName = card.cardName;
	cardName = (opt.cardOptions?.bold ?? false) ? `**${cardName}**` : cardName;
	cardName =
		(opt.cardOptions?.color ?? true)
			? wrapColor(cardName, card.class1, card.class2, card.class3, !ignoreSmall)
			: cardName;
	cardName = (opt.cardOptions?.link ?? true) ? wrapCard(cardName, card.id) : cardName;
	const normalPips = makePipsStyle(
		card.xp ?? 0,
		opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal,
		true,
		ignoreSmall
	);
	const tabooPips = makePipsStyle(
		card.xpTaboo,
		opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal,
		true,
		ignoreSmall
	);
	cardName =
		(opt.globalSettings?.pipStyle ?? GlobalSettings_PipStyle.PipsReal) !==
		GlobalSettings_PipStyle.None
			? `${cardName} ${normalPips}`
			: cardName;
	cardName =
		(opt.globalSettings?.taboo ?? true) && card.xpTaboo > 0
			? `${cardName} ${tabooPips}${ahdbIcons.tablet}`
			: cardName;
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
	const expansionNameWithoutInvestigatorExpansion = card.expansionName.replace(
		' Investigator Expansion',
		''
	);
	cardName =
		(opt.cardOptions?.expansion ?? false)
			? `${cardName} <span class="small">(${expansionNameWithoutInvestigatorExpansion})</span>`
			: cardName;
	return cardName;
}

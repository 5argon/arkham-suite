import { CardClass } from '@5argon/arkham-kohaku';
import type { ExportOptions } from '$lib/proto/generated/export_options';
import type { UpgradeExportOptions } from '$lib/proto/generated/upgrade_export';

import { wrapColor, wrapSmall } from './ahdb-syntax';
import {
	makeUpgradePlannerUrl,
	type UpgradeExport,
	type UpgradeExportRow,
	upgradeExportToProtoString
} from './export-tools-center';
import { mdCardAndInfo } from './md-card';
import { makeSimpleList } from './simple-list';

export function upgradeExportArkhamDb(
	uex: UpgradeExport,
	exportRows: UpgradeExportRow[],
	upgradeCode: string
): string {
	const upgradeExportOptions: UpgradeExportOptions = uex.upgradeExportOptions;
	const exportOptions: ExportOptions = uex.exportOptions;
	let meat: string;
	if (upgradeExportOptions.simpleList) {
		meat = makeSimpleList(upgradeExportOptions, exportOptions, exportRows);
	} else if (upgradeExportOptions.splitDivider) {
		const meats: string[] = [];
		const agg: UpgradeExportRow[] = [];
		for (let i = 0; i < exportRows.length; i++) {
			const r = exportRows[i];
			if (r.divider) {
				// When found a divider, perform generation of all the previous entries.
				if (agg.length > 0) {
					const subMeat = upgradeExportSubdivided(uex, upgradeExportOptions, exportOptions, agg);
					meats.push(subMeat);
					agg.length = 0;
				}
			}
			agg.push(r);
		}
		// Clear up all the remaining rows
		if (agg.length > 0) {
			const subMeat = upgradeExportSubdivided(uex, upgradeExportOptions, exportOptions, agg);
			meats.push(subMeat);
			agg.length = 0;
		}
		meat = meats.join('\n');
	} else {
		meat = upgradeExportSubdivided(uex, upgradeExportOptions, exportOptions, exportRows);
	}
	const all: string[] = [meat];
	if (!uex.upgradeExportOptions.showLink) {
		all.push(upgradeCode);
		if (!uex.upgradeExportOptions.simpleList) {
			all.push(comment);
		}
	}
	return all.join('\n');
}

export function upgradeExportSubdivided(
	uex: UpgradeExport,
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions,
	exportRows: UpgradeExportRow[]
): string {
	const rows = exportRows
		.filter((x) => x.divider || x.cardLeft !== null || x.cardRight !== null)
		.map((x, i) => {
			if (x.divider) {
				return dividerRow(x.dividerText, x.xpCumulative, upgradeExportOptions.xpSuffix, i === 0);
			} else {
				return upgradeExportRow(x, upgradeExportOptions, exportOptions);
			}
		});
	const link = `\n<span class="small">[${upgradeExportOptions.showLinkText}](${makeUpgradePlannerUrl(
		upgradeExportToProtoString(uex)
	)})</span>`;
	const all: string[] = [
		openComment,
		tableHeader(upgradeExportOptions),
		mdColumns,
		...rows,
		upgradeExportOptions.showLink ? link : emptyRow,
		closeComment
	];
	return all.join('\n');
}

function upgradeExportRow(
	row: UpgradeExportRow,
	ueo: UpgradeExportOptions,
	eo: ExportOptions
): string {
	const mark = mdMarkColumn(row.mark);
	const leftCard = row.cardLeft !== null ? mdCardAndInfo(row.cardLeft, eo, ueo.ignoreSmall) : null;
	const rightCard =
		row.cardRight !== null ? mdCardAndInfo(row.cardRight, eo, ueo.ignoreSmall) : null;
	const onlyRight = row.cardLeft === null && row.cardRight !== null;
	const arrow =
		row.cardLeft !== null && row.cardRight !== null
			? arrowColumn(onlyRight, row.cardLeft.cardName === row.cardRight.cardName)
			: arrowColumn(onlyRight, false);
	const xp = xpColumn(row.xp, ueo.xpSuffix);
	const xpCumulative = xpColumn(row.xpCumulative, ueo.xpSuffix);
	const all: string[] = [
		'',
		mark,
		leftCard ?? '  ',
		arrow,
		rightCard ?? '  ',
		xp,
		xpCumulative,
		''
	];
	return all.join('|');
}

const nbsp = '　';

const openComment = '[//]: # (==================== TABLE START ====================)';
const closeComment = '\n[//]: # (===================== TABLE END =====================)';
const comment = '[//]: # (=====================================================)';
const mdColumns = '|:-:|:--|:-:|:--|--:|--:|';
const emptyRow = '|　|  |  |  |  |  |';

function mdMarkColumn(mark: string): string {
	return nbsp + mark + nbsp;
}

function arrowColumn(onlyRight: boolean, isUpgrade: boolean): string {
	const transitionCharacter = onlyRight ? '+' : '→';
	const arrow = isUpgrade
		? wrapColor(transitionCharacter, CardClass.Survivor, null, null)
		: transitionCharacter;
	return nbsp + arrow + nbsp;
}

function xpColumn(xp: number, xpSuffix: string): string {
	return wrapSmall(xp.toString() + ' ' + xpSuffix);
}

function dividerRow(
	text: string,
	xpCumulative: number,
	xpSuffix: string,
	topmost: boolean
): string {
	const noText = text.trim() === '';
	return (
		(topmost ? '' : emptyRow + '\n') +
		`|  | ${!noText ? '**' + text + '**' : ''} |  |  |  | ${xpCumulative} ${xpSuffix} |`
	);
}

function tableHeader(opt: UpgradeExportOptions): string {
	return `|  |  |  |  | ${nbsp + (opt.headers?.costHeader || '')} | ${
		nbsp + (opt.headers?.totalHeader || '')
	} |`;
}

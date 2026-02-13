import type { ExportOptions } from '$lib/proto/generated/export_options';
import { GlobalSettings_PipStyle } from '$lib/proto/generated/global_settings';
import {
	type UpgradeExportOptions,
	UpgradeExportOptions_SimpleListOptions_BlockStyle
} from '$lib/proto/generated/upgrade_export';

import type { UpgradeExportRow } from './export-tools-center';
import { mdCardAndInfo } from './md-card';

export function makeSimpleList(
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions,
	exportRows: UpgradeExportRow[]
): string {
	const pre = makeSimpleListPre(upgradeExportOptions, exportOptions);
	const post = makeSimpleListPost(upgradeExportOptions, exportOptions);
	const joiner = makeSimpleListJoiner(upgradeExportOptions, exportOptions);
	const meat = exportRows
		.map<string>((x) => makeSimpleListOneRow(upgradeExportOptions, exportOptions, x, exportRows))
		.join(joiner);
	const all: string[] = [];
	if (pre !== '') {
		all.push(pre);
	}
	if (meat !== '') {
		all.push(meat);
	}
	if (post !== '') {
		all.push(post);
	}
	return all.join('\n');
}

const typeHere = 'TYPEHERE';

export function makeSimpleListPre(
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions
): string {
	switch (
		upgradeExportOptions.simpleListOptions?.blockStyle ??
		UpgradeExportOptions_SimpleListOptions_BlockStyle.A
	) {
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.D: {
			const tem1 = '| 　 | CARD | COL |';
			const tem2 = '|:-:|:--|:--|';
			return [tem1, tem2].join('\n');
		}
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.E: {
			const tem1 = '| 　 | CARD | 　COL　 |';
			const tem2 = '|:-:|:--|:-:|';
			return [tem1, tem2].join('\n');
		}
		default:
			return '';
	}
}

export function makeSimpleListPost(
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions
): string {
	switch (
		upgradeExportOptions.simpleListOptions?.blockStyle ??
		UpgradeExportOptions_SimpleListOptions_BlockStyle.A
	) {
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.D: {
			const tem1 = '| 　 |  |  |';
			return tem1;
		}
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.E: {
			const tem1 = '| 　 |  |  |';
			return tem1;
		}
		default:
			return '';
	}
}

export function makeSimpleListJoiner(
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions
): string {
	switch (
		upgradeExportOptions.simpleListOptions?.blockStyle ??
		UpgradeExportOptions_SimpleListOptions_BlockStyle.A
	) {
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.B: {
			const tem1 = '\n---\n\n';
			return tem1;
		}
		default:
			return '\n';
	}
}

export function makeSimpleListOneRow(
	upgradeExportOptions: UpgradeExportOptions,
	exportOptions: ExportOptions,
	exportRow: UpgradeExportRow,
	allRows: UpgradeExportRow[]
): string {
	// Some block style cancels real pips even if it is set.
	exportOptions = { ...exportOptions };
	if (exportOptions.globalSettings !== undefined) {
		if (exportOptions.globalSettings.pipStyle === GlobalSettings_PipStyle.PipsReal) {
			exportOptions.globalSettings = { ...exportOptions.globalSettings };
			switch (
				upgradeExportOptions.simpleListOptions?.blockStyle ??
				UpgradeExportOptions_SimpleListOptions_BlockStyle.A
			) {
				case UpgradeExportOptions_SimpleListOptions_BlockStyle.C:
					exportOptions.globalSettings.pipStyle = GlobalSettings_PipStyle.Pips;
					break;
				case UpgradeExportOptions_SimpleListOptions_BlockStyle.D:
				case UpgradeExportOptions_SimpleListOptions_BlockStyle.E:
					exportOptions.globalSettings.pipStyle = GlobalSettings_PipStyle.Pips;
					break;
				default:
					break;
			}
		}
	}
	const basic = upgradeExportRowSimple(exportRow, upgradeExportOptions, exportOptions);
	switch (
		upgradeExportOptions.simpleListOptions?.blockStyle ??
		UpgradeExportOptions_SimpleListOptions_BlockStyle.A
	) {
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.A:
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.B:
			return basic + '\n\n' + typeHere + '\n';
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.C: {
			if (allRows.findIndex((x) => x.divider) !== -1) {
				if (exportRow.divider) {
					return '- ' + exportRow.dividerText;
				} else {
					return '  - ' + basic;
				}
			} else {
				return '- ' + basic;
			}
		}
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.D: {
			if (exportRow.divider) {
				if (exportRow.dividerText !== '') {
					const pre = '| 　 |  |  |\n';
					return pre + '| 　 | **' + exportRow.dividerText + '** |  |';
				} else {
					return '| 　 |  |  |';
				}
			} else {
				return '|  | ' + basic + '　| ' + typeHere + ' |';
			}
		}
		case UpgradeExportOptions_SimpleListOptions_BlockStyle.E:
			if (exportRow.divider) {
				if (exportRow.dividerText !== '') {
					const pre = '| 　 |  |  |  |\n';
					return pre + '| 　 | **' + exportRow.dividerText + '** |  |';
				} else {
					return '| 　 |  |  |';
				}
			} else {
				return '|  | ' + basic + '　| ' + typeHere + ' |';
			}
		default:
			return '- ' + basic;
	}
}

function upgradeExportRowSimple(
	row: UpgradeExportRow,
	ueo: UpgradeExportOptions,
	eo: ExportOptions
): string {
	const mark = row.mark;
	const leftCard = row.cardLeft !== null ? mdCardAndInfo(row.cardLeft, eo, true) : null;
	const rightCard = row.cardRight !== null ? mdCardAndInfo(row.cardRight, eo, true) : null;
	const arrow = row.cardLeft !== null && row.cardRight !== null ? (ueo.arrow?.character ?? '') : '';
	const all: string[] = [];
	if (mark !== '') {
		all.push(mark);
	}
	if (leftCard !== null) {
		all.push(leftCard);
	}
	if (arrow !== '') {
		all.push(arrow);
	}
	if (rightCard !== null) {
		all.push(rightCard);
	}
	return all.join(' ');
}

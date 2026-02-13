import type { CardResolver } from '@5argon/arkham-kohaku';

export interface TableEvents {
	onAddRow: () => void;
	onAddDivider: () => void;
	onClearAll: () => void;
}

export interface TableRowActionEvents {
	onDelete: (i: number) => void;
	onDeleteLeft: (i: number) => void;
	onDeleteRight: (i: number) => void;
	onMoveUp: (i: number) => void;
	onMoveDown: (i: number) => void;
	onMoveUpLeft: (i: number) => void;
	onMoveDownLeft: (i: number) => void;
	onMoveUpRight: (i: number) => void;
	onMoveDownRight: (i: number) => void;
}

export interface TableRowEditEvents {
	onMarkChanged: (i: number, n: string) => void;
	onLeftChanged: (i: number, n: string) => void;
	onRightChanged: (i: number, n: string) => void;
	onXpChanged: (i: number, n: number) => void;
	onCarryoverXpChanged: (i: number, n: number) => void;
	onXpLockChanged: (i: number, n: boolean, calc: number) => void;
	onXpCumulativeLockChanged: (i: number, n: boolean, calc: number) => void;
	onDividerChanged: (i: number, n: boolean) => void;
	onDividerTextChanged: (i: number, n: string) => void;
	onLoseFocus: (i: number) => void;
	onDropSwap: (
		fromIndex: number,
		fromRight: boolean,
		swapTo: string,
		toIndex: number,
		toRight: boolean
	) => void;
	onCustomizationCycle: (i: number, resolver: CardResolver) => void;
}

export interface RowActionEvents {
	onDelete: () => void;
	onDeleteLeft: () => void;
	onDeleteRight: () => void;
}

export interface RowEditEvents {
	onMarkChanged: (n: string) => void;
	onLeftChanged: (n: string) => void;
	onRightChanged: (n: string) => void;
	onXpChanged: (n: number) => void;
	onCarryoverXpChanged: (n: number) => void;
	onXpLockChanged: (n: boolean, calc: number) => void;
	onXpCumulativeLockChanged: (n: boolean, calc: number) => void;
	onDividerChanged: (n: boolean) => void;
	onDividerTextChanged: (n: string) => void;
	onLoseFocus: () => void;
	onDropSwap: (fromIndex: number, fromRight: boolean, swapTo: string, toRight: boolean) => void;
	onCustomizableCycle: (resolver: CardResolver) => void;
}

export function createEmptyRowActionEvents(): RowActionEvents {
	return {
		onDelete: () => {
			// do nothing
		},
		onDeleteLeft: () => {
			// do nothing
		},
		onDeleteRight: () => {
			// do nothing
		},
	};
}

export function createEmptyRowEditEvents(): RowEditEvents {
	return {
		onMarkChanged: () => {
			// do nothing
		},
		onLeftChanged: () => {
			// do nothing
		},
		onRightChanged: () => {
			// do nothing
		},
		onXpChanged: () => {
			// do nothing
		},
		onCarryoverXpChanged: () => {
			// do nothing
		},
		onXpLockChanged: () => {
			// do nothing
		},
		onXpCumulativeLockChanged: () => {
			// do nothing
		},
		onDividerChanged: () => {
			// do nothing
		},
		onDividerTextChanged: () => {
			// do nothing
		},
		onLoseFocus: () => {
			// do nothing
		},
		onDropSwap: () => {
			// do nothing
		},
		onCustomizableCycle: () => {
			// do nothing
		}
	};
}

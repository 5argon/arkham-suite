export interface Row {
	mark: string;
	left: string | null;
	right: string | null;
	xp: number;
	divider: boolean;
	dividerText: string;
	carryoverXp: number;
	xpUnlock: boolean;
	dividerXpCumulativeUnlock: boolean;
	custom: boolean;
	customizationChoice: number;
}

export const placeholderCard = 'p';

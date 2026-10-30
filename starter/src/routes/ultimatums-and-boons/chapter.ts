import {
	chapterOneBoons,
	chapterOneRefractions,
	chapterOneUltimatums,
	chapterTwoBoons,
	chapterTwoRefractions,
	chapterTwoUltimatums
} from '@5argon/arkham-kohaku';

export type Chapter = 1 | 2;
export type TabType = 'ultimatums' | 'boons' | 'refractions';

/** Chapter tabs in display order. */
export const chapters: Chapter[] = [2, 1];
export const tabTypes: TabType[] = ['ultimatums', 'boons', 'refractions'];

export const chapterLists: Record<Chapter, Record<TabType, string[]>> = {
	1: {
		ultimatums: chapterOneUltimatums,
		boons: chapterOneBoons,
		refractions: chapterOneRefractions
	},
	2: {
		ultimatums: chapterTwoUltimatums,
		boons: chapterTwoBoons,
		refractions: chapterTwoRefractions
	}
};

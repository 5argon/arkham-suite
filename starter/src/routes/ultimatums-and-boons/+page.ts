import { chapterLists, chapters, tabTypes, type Chapter, type TabType } from './chapter';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = ({ url }) => {
	const itemParam = url.searchParams.get('i');
	const chapterParam = Number(url.searchParams.get('c')) as Chapter;

	// Without a chapter in the URL, use the first chapter that lists the item.
	const candidateChapters = chapters.includes(chapterParam) ? [chapterParam] : chapters;

	if (itemParam) {
		for (const chapter of candidateChapters) {
			for (const tab of tabTypes) {
				const index = chapterLists[chapter][tab].indexOf(itemParam);
				if (index !== -1) {
					return {
						initialChapter: chapter,
						initialTab: tab,
						initialIndex: index
					};
				}
			}
		}
	}

	return {
		initialChapter: candidateChapters[0],
		initialTab: 'ultimatums' as TabType,
		initialIndex: 0
	};
};

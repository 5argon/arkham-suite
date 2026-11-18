import { goto, type AfterNavigate } from '$app/navigation';

/** Navigate an archive list (search, sort, page, filters) while keeping focus in the search box,
 *  then return to the top of the list. SvelteKit's `reset` option covers scroll and focus
 *  together, so the scroll is restored separately. */
export async function gotoKeepingFocus(url: string): Promise<void> {
	await goto(url, { reset: false });
	window.scrollTo(0, 0);
}

/** The archive lists, whose page, search, sort and filters live in the URL. */
const LIST_PATHS = ['/archive', '/archive/standalone'];

/** Whether the page was entered from an archive list that is still right behind it in history, so
 *  going back through history returns to its page, filters and scroll. Arriving with the browser's
 *  back button leaves the page that was left ahead in history, not behind. */
export function enteredFromList(navigation: AfterNavigate): boolean {
	const previousIsBehind = navigation.type !== 'popstate' || navigation.delta === 1;
	const from = navigation.from?.url?.pathname;
	return previousIsBehind && from !== undefined && LIST_PATHS.includes(from);
}

import { goto } from '$app/navigation';

/** Navigate an archive list (search, sort, page, filters) while keeping focus in the search box,
 *  then return to the top of the list. SvelteKit's `reset` option covers scroll and focus
 *  together, so the scroll is restored separately. */
export async function gotoKeepingFocus(url: string): Promise<void> {
	await goto(url, { reset: false });
	window.scrollTo(0, 0);
}

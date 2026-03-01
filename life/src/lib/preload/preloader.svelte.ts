/**
 * preloader.svelte.ts — predicted in-session route warming.
 *
 * The whole database is already in memory (see `database.svelte.ts`), so moving
 * between pages never re-fetches data. The only thing not yet downloaded when you
 * land somewhere is the *code* for pages you haven't visited. This coordinator
 * proactively imports those route chunks (via `preloadCode`) for the section you
 * just entered, so a brief good connection readies a whole predicted area for
 * instant navigation — for THIS session. It does NOT make the app survive a hard
 * reload offline; that would need a service worker (deliberately out of scope).
 *
 * Side-effect discipline (project rule "avoid rendering side effects"): `progress`
 * is seeded `$state`; all work runs from explicit `warm*` calls made in `onMount`
 * / event handlers, never from a reactive `$effect`. Every preload is best-effort
 * and swallows errors so it can never break navigation.
 */

import { browser } from '$app/environment';
import { preloadCode } from '$app/navigation';
import { databaseStore } from '$lib/database/database.svelte';

export type PreloadProgress = {
	/** Whether the progress bar should be visible. */
	active: boolean;
	/** Route chunks (and the payload step) warmed so far. */
	done: number;
	/** Total units of work for the current run. */
	total: number;
	/** True once the run finished — drives the "ready" caption before collapsing. */
	ready: boolean;
};

/** Static card sub-pages — each is its own route chunk. */
const CARD_SUBPAGES = ['core', 'asset', 'event', 'skill', 'keywords', 'levels'];
/** Any real class slug warms the shared `[class]` chunk (one is enough — same chunk). */
const REPRESENTATIVE_CLASS = 'guardian';
/** How long the "ready" caption lingers before the bar collapses (ms). */
const READY_LINGER_MS = 2500;

class Preloader {
	progress = $state<PreloadProgress>({ active: false, done: 0, total: 0, ready: false });

	/** Sections already warmed this session, so each warms at most once. */
	#warmed = new Set<string>();
	/** Identifies the latest run so older runs stop driving the shared bar. */
	#activeRun = 0;

	/** Warm a fixed top-level section's predicted destinations. */
	warmSection(section: 'home' | 'archive'): void {
		if (section === 'home') {
			// The home grid's six destinations — every click from home becomes instant.
			this.#warm('home', ['/archive', '/p', '/players', '/settings', '/database', '/guides']);
		} else {
			// `/archive/edit` is one querystring-keyed chunk shared by every campaign.
			this.#warm('archive', ['/archive/edit', '/archive/new', '/archive/import-export']);
		}
	}

	/**
	 * Warm one profile subject's whole viewing subtree, and assemble its compiled
	 * payload once (the load-bearing step — the sub-pages all read that one payload
	 * via context). `base` is `/p/private/${uid}`, already computed by the layout.
	 */
	warmProfile(uid: string, base: string): void {
		const hrefs = [
			base,
			`${base}/campaigns`,
			`${base}/cards`,
			...CARD_SUBPAGES.map((s) => `${base}/cards/${s}`),
			`${base}/cards/${REPRESENTATIVE_CLASS}`,
			`${base}/investigators`,
			`${base}/investigators/${REPRESENTATIVE_CLASS}`,
		];
		// One representative concrete campaign warms the shared `[campaign]` chunk.
		const firstCampaign = databaseStore.doc?.campaigns?.[0]?.campaignCode;
		if (firstCampaign) hrefs.push(`${base}/campaigns/${firstCampaign}`);

		this.#warm(`profile:${uid}`, hrefs, () => void databaseStore.getProfilePayload(uid));
	}

	/** Schedule a section's warm if it hasn't run yet this session. */
	#warm(key: string, hrefs: string[], finalStep?: () => void): void {
		if (!browser || this.#warmed.has(key)) return;
		this.#warmed.add(key);
		const total = hrefs.length + (finalStep ? 1 : 0);
		const runId = ++this.#activeRun;
		this.progress = { active: true, done: 0, total, ready: false };
		this.#idle(() => void this.#run(runId, hrefs, finalStep));
	}

	async #run(runId: number, hrefs: string[], finalStep?: () => void): Promise<void> {
		let done = 0;
		const bump = () => {
			done++;
			// Only the latest run owns the shared bar; older runs keep preloading silently.
			if (this.#activeRun === runId) this.progress = { ...this.progress, done };
		};
		for (const href of hrefs) {
			try {
				await preloadCode(href);
			} catch {
				// Best-effort: a failed preload must never surface or break navigation.
			}
			bump();
		}
		if (finalStep) {
			try {
				finalStep();
			} catch {
				/* ignore — the page will build the payload itself if needed */
			}
			bump();
		}
		if (this.#activeRun !== runId) return;
		this.progress = { ...this.progress, ready: true };
		this.#idle(() => {
			if (this.#activeRun === runId) this.progress = { active: false, done: 0, total: 0, ready: false };
		}, READY_LINGER_MS);
	}

	/** Run low-priority so warming never competes with paint/interaction. */
	#idle(fn: () => void, delay?: number): void {
		if (delay != null) {
			setTimeout(fn, delay);
		} else if (typeof requestIdleCallback === 'function') {
			requestIdleCallback(() => fn(), { timeout: 2000 });
		} else {
			setTimeout(fn, 200);
		}
	}
}

/** App-wide singleton. */
export const preloader = new Preloader();

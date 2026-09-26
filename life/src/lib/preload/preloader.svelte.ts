/**
 * Warms the route code of the section just entered (`preloadCode`), so later navigation within it
 * is instant for this session. The database is already in memory; this does not make a reload work
 * offline. Runs only from explicit `warm*` calls, and every preload swallows its errors.
 */

import { browser } from '$app/environment';
import { preloadCode } from '$app/navigation';
import { databaseStore } from '$lib/database/database.svelte';

export type PreloadProgress = {
	active: boolean;
	/** Route chunks (and the payload step) warmed so far. */
	done: number;
	total: number;
	/** The run finished; the bar shows "ready" briefly before collapsing. */
	ready: boolean;
};

/** Static card sub-pages — each is its own route chunk. */
const CARD_SUBPAGES = ['core', 'asset', 'event', 'skill', 'keywords', 'levels'];
/** Any class slug warms the shared `[class]` chunk. */
const REPRESENTATIVE_CLASS = 'guardian';
/** How long the "ready" caption lingers before the bar collapses (ms). */
const READY_LINGER_MS = 2500;

class Preloader {
	progress = $state<PreloadProgress>({ active: false, done: 0, total: 0, ready: false });

	/** Sections already warmed this session. */
	#warmed = new Set<string>();
	/** Only the latest run drives the progress bar. */
	#activeRun = 0;

	warmSection(section: 'home' | 'archive'): void {
		if (section === 'home') {
			this.#warm('home', ['/archive', '/p', '/players', '/settings', '/database', '/guides']);
		} else {
			this.#warm('archive', ['/archive/edit', '/archive/new', '/archive/import-export']);
		}
	}

	/** Warm a profile's subtree under `base` (`/p/<scope>/<uid>`) and build its payload once. */
	warmProfile(uid: string, base: string, scope: 'private' | 'loaded' = 'private'): void {
		const hrefs = [
			base,
			`${base}/campaigns`,
			`${base}/cards`,
			...CARD_SUBPAGES.map((s) => `${base}/cards/${s}`),
			`${base}/cards/${REPRESENTATIVE_CLASS}`,
			`${base}/investigators`,
			`${base}/investigators/${REPRESENTATIVE_CLASS}`,
		];
		// One campaign warms the shared `[campaign]` chunk.
		const firstCampaign = databaseStore.doc?.campaigns[0]?.campaignCode;
		if (firstCampaign) hrefs.push(`${base}/campaigns/${firstCampaign}`);

		const warmPayload =
			scope === 'loaded'
				? () => void databaseStore.getLoadedProfilePayload(uid)
				: () => void databaseStore.getProfilePayload(uid);
		this.#warm(`profile:${scope}:${uid}`, hrefs, warmPayload);
	}

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
			if (this.#activeRun === runId) this.progress = { ...this.progress, done };
		};
		for (const href of hrefs) {
			try {
				await preloadCode(href);
			} catch {
				// A failed preload only means that page loads on demand.
			}
			bump();
		}
		if (finalStep) {
			try {
				finalStep();
			} catch {
				// The page builds the payload itself.
			}
			bump();
		}
		if (this.#activeRun !== runId) return;
		this.progress = { ...this.progress, ready: true };
		this.#idle(() => {
			if (this.#activeRun === runId) this.progress = { active: false, done: 0, total: 0, ready: false };
		}, READY_LINGER_MS);
	}

	/** Low priority, so warming never competes with paint or input. */
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

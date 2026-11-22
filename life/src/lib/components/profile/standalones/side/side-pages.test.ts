import { describe, expect, it } from 'vitest';
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { STANDALONE_RULES } from '$lib/campaign/standalones/rules-registry';
import { CHALLENGES, ENCORE_INVESTIGATORS } from '$lib/campaign/standalones/side/challenges';
import {
	LOL_GROUPS,
	MTT_MACHINATIONS,
	MTT_PLOTS
} from '$lib/campaign/standalones/side/epic-multiplayer';
import { MEH_CULPRITS } from '$lib/campaign/standalones/side/excelsior';
import { FILMS } from '$lib/campaign/standalones/side/film-fatale';
import { MWG_FACTIONS } from '$lib/campaign/standalones/side/midwinter-gala';
import { cardByCode } from '$lib/card-data';
import { hasStandaloneText } from './text';

const side = getCampaignLog('side')!;
const meta = (id: string) => side.db.scenarioMeta?.find((m) => m.id === id);

describe('standalone page rules', () => {
	const all = Object.values(STANDALONE_RULES);

	it('name a scenario of the side catalogue and only its resolutions', () => {
		for (const r of all) {
			const m = meta(r.scenario);
			expect(m, r.scenario).toBeDefined();
			for (const e of r.endings ?? [])
				for (const res of e.resolutions)
					expect(m?.resolutions, `${r.scenario} ${e.id}`).toContain(res);
		}
	});

	it('have a label for every ending', () => {
		for (const r of all)
			for (const e of r.endings ?? [])
				expect(
					hasStandaloneText(`standalone_${r.prefix}_ending_${e.id}`),
					`${r.prefix} ${e.id}`
				).toBe(true);
	});

	it('show only cards the card data knows', () => {
		const codes = [
			...all.flatMap((r) => [
				...(r.endings ?? []).flatMap((e) => (e.code ? [e.code] : [])),
				...(r.cards ?? []).flatMap((c) => [c.code, ...(c.from ? [c.from] : [])])
			]),
			...CHALLENGES.flatMap((c) => [c.investigator, ...c.signature, ...c.weakness]),
			...ENCORE_INVESTIGATORS.map((i) => i.parallel),
			...MEH_CULPRITS.flatMap((c) => [c.boss, ...c.leads]),
			...FILMS.flatMap((f) => [f.boss, f.prop]),
			...MWG_FACTIONS.map((f) => f.leader),
			...LOL_GROUPS.map((g) => g.code),
			...MTT_MACHINATIONS.map((x) => x.code),
			...MTT_PLOTS.map((x) => x.code)
		];
		for (const code of codes) expect(cardByCode(code), code).toBeDefined();
	});

	it('label every challenge score', () => {
		for (const c of CHALLENGES) {
			if (!c.score) continue;
			expect(hasStandaloneText(`standalone_${c.prefix}_score_title`), c.prefix).toBe(true);
			expect(hasStandaloneText(`standalone_${c.prefix}_score_note`), c.prefix).toBe(true);
			if (c.score.kind === 'options')
				for (const o of c.score.options)
					expect(hasStandaloneText(`standalone_${c.prefix}_score_${o}`), `${c.prefix} ${o}`).toBe(
						true
					);
			expect(
				meta(c.scenario)?.choices?.some((q) => q.id === c.score!.choice),
				c.scenario
			).toBe(true);
		}
	});

	it('read only Extra questions the side catalogue asks', () => {
		for (const c of CHALLENGES)
			for (const id of [c.good.id, c.bad.id])
				expect(
					meta(c.scenario)?.choices?.some((q) => q.id === id),
					`${c.scenario} ${id}`
				).toBe(true);
	});
});

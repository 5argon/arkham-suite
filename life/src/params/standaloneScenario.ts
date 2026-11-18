import { standaloneScenarios } from '@5argon/arkham-campaign-data';

/** The `[scenario]` segment under `/standalones/pack/`: an official Scenario-Pack scenario id from
 *  the campaign-data `side` catalogue. Whether the subject played it is checked by the page. */
const ids = new Set(standaloneScenarios().map((s) => s.scenario));
export const match = ((param: string): boolean => ids.has(param));

import type { ParamMatcher } from '@sveltejs/kit';
import { standaloneScenarios } from '@5argon/arkham-campaign-data';

/**
 * The `[scenario]` segment under `/standalones/pack/` — an official Scenario-Pack
 * scenario id from the campaign-data `side` catalogue (fan-made are excluded). The
 * static "is it a known pack scenario?" gate; the page still checks whether the
 * subject actually played it. (Campaign-sourced standalones use the `[campaign]`
 * matcher + a plain `[scenario]` segment, validated in the page.)
 */
const ids = new Set(standaloneScenarios().map((s) => s.scenario));
export const match = ((param) => ids.has(param)) satisfies ParamMatcher;

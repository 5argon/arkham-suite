import { beforeEach } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetSimulateCaches } from '../src/solver/simulate.js';
import { _resetCatalog } from '../src/catalog.js';
import { _resetLoadCaches } from '../src/data/load.js';
import { initialState } from '../src/graph/state.js';
import type { CampaignState, LogId } from '../src/types.js';

/** Reset every memoized cache before each test for isolation. */
export function resetAll(): void {
	beforeEach(() => {
		_resetLoadCaches();
		_resetGraphMemo();
		_resetSimulateCaches();
		_resetCatalog();
	});
}

/** A campaign state with the given recorded logs / board assertions (everything else initial). */
export function stateWith(recorded: LogId[] = [], boardStates: string[] = [], over: Partial<CampaignState> = {}): CampaignState {
	return { ...initialState(), recorded: new Set(recorded), boardStates: new Set(boardStates), ...over };
}

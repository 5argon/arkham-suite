/**
 * Structured-effect application (pure).
 *
 * Every option in logic.json carries an `effects[]` array of structured deltas; this module
 * applies them to a mutable `Draft` (the working copy `state.ts` finalizes into a fresh
 * `CampaignState`). `time` effects are summed by the caller and folded into the time-track
 * advance (so markers fire correctly); everything else mutates the draft here.
 */

import type { BearerId, Effect, KeyId, LogId, MarkerSymbol, NodeId } from '../types.js';

export const CHAOS_CAP = 4;
/** The campaign card that, in hand, lets the cell make a 0-time Expedited Ticket jump. */
export const EXPEDITED_TICKET = 'Expedited Ticket';

/** A mutable working state. `state.ts` seeds it from a `CampaignState` and freezes it back. */
export interface Draft {
	recorded: Set<LogId>;
	tallies: Map<LogId, number>;
	keys: Map<KeyId, BearerId>;
	assets: Set<string>;
	tablet: number;
	elderThing: number;
	cultist: number;
	xpBonus: number;
	hasTicket: boolean;
	unlocked: Set<NodeId>;
	markers: Map<MarkerSymbol, number>;
}

/** Add `delta` of a chaos token, capping tablet/elderThing at 4 (overflow above the cap → +XP). */
function addToken(d: Draft, token: 'tablet' | 'elderThing' | 'cultist', delta: number): void {
	if (token === 'cultist') {
		d.cultist = Math.max(0, d.cultist + delta);
		return;
	}
	const cur = token === 'tablet' ? d.tablet : d.elderThing;
	let next = cur + delta;
	if (delta > 0 && next > CHAOS_CAP) {
		d.xpBonus += next - CHAOS_CAP; // adding to a full bag grants XP instead (campaign rule)
		next = CHAOS_CAP;
	}
	next = Math.max(0, next);
	if (token === 'tablet') d.tablet = next;
	else d.elderThing = next;
}

/** Sum the `time` effects in a list (the only effect the caller folds into the clock advance). */
export function sumTime(effects: readonly Effect[]): number {
	let t = 0;
	for (const e of effects) if (e.type === 'time') t += e.delta;
	return t;
}

/**
 * Apply one non-time effect to `draft`. `nowBox` is the clock value (after this step's time
 * advance) used to place a written `statusMarker` `offsetFromNow` boxes ahead.
 */
export function applyEffect(d: Draft, e: Effect, nowBox: number): void {
	switch (e.type) {
		case 'record':
			d.recorded.add(e.entryId);
			break;
		case 'crossOff':
			d.recorded.delete(e.entryId);
			break;
		case 'tally':
			d.tallies.set(e.entryId, (d.tallies.get(e.entryId) ?? 0) + e.delta);
			break;
		case 'key':
			d.keys.set(e.keyId, e.bearer);
			break;
		case 'token':
			addToken(d, e.token, e.delta);
			break;
		case 'trust':
			// Trust act: −1 Elder Thing, +1 Tablet (overflow above 4 → +XP).
			addToken(d, 'elderThing', -1);
			addToken(d, 'tablet', 1);
			break;
		case 'deception':
			addToken(d, 'tablet', -1);
			addToken(d, 'elderThing', 1);
			break;
		case 'time':
			break; // folded into the clock advance by the caller
		case 'xp':
			if (typeof e.amount === 'number') d.xpBonus += e.amount;
			break;
		case 'storyAsset':
			if (e.action === 'add') d.assets.add(e.asset);
			else d.assets.delete(e.asset);
			break;
		case 'statusMarker':
			d.markers.set(e.symbol, nowBox + e.offsetFromNow);
			break;
		case 'unlock':
			for (const l of e.locationIds) d.unlocked.add(l);
			break;
		case 'card':
			if (e.card === EXPEDITED_TICKET) d.hasTicket = e.action === 'add';
			break;
		case 'chaosTokenAdjust':
		case 'campaign': // win/lose surfaced at the finale step, not stored in state
		case 'note':
		case 'trauma':
			break;
	}
}

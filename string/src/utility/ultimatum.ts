import { Ultimatum } from '@5argon/arkham-kohaku';
import * as m from '../paraglide/messages.js';

/**
 * Get the translated name for an ultimatum.
 * Uses Paraglide messages to return the localized ultimatum name.
 */
export function ultimatumName(ultimatum: Ultimatum): string {
  switch (ultimatum) {
    case Ultimatum.Agony:
      return m.ultimatumAgony();
    case Ultimatum.BrokenPromises:
      return m.ultimatumBrokenPromises();
    case Ultimatum.BrokenVeil:
      return m.ultimatumBrokenVeil();
    case Ultimatum.Chaos:
      return m.ultimatumChaos();
    case Ultimatum.Disaster:
      return m.ultimatumDisaster();
    case Ultimatum.Dread:
      return m.ultimatumDread();
    case Ultimatum.Failure:
      return m.ultimatumFailure();
    case Ultimatum.Finality:
      return m.ultimatumFinality();
    case Ultimatum.ForbiddenKnowledge:
      return m.ultimatumForbiddenKnowledge();
    case Ultimatum.Hardship:
      return m.ultimatumHardship();
    case Ultimatum.Highlander:
      return m.ultimatumHighlander();
    case Ultimatum.Induction:
      return m.ultimatumInduction();
    case Ultimatum.Malevolence:
      return m.ultimatumMalevolence();
    case Ultimatum.Orthodoxy:
      return m.ultimatumOrthodoxy();
    case Ultimatum.TheScream:
      return m.ultimatumTheScream();
    case Ultimatum.Spiral:
      return m.ultimatumSpiral();
    case Ultimatum.Survival:
      return m.ultimatumSurvival();
    case Ultimatum.Ultimatums:
      return m.ultimatumUltimatums();
    default:
      throw new Error(`Unknown ultimatum: ${ultimatum}`);
  }
}

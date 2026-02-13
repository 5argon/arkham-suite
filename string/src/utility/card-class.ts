import { CardClass } from '@5argon/arkham-kohaku';
import {
  playerClassGuardian,
  playerClassMystic,
  playerClassNeutral,
  playerClassRogue,
  playerClassSeeker,
  playerClassSurvivor,
} from '../paraglide/messages.js';

export function cardClass(c: CardClass): string {
  switch (c) {
    case CardClass.Guardian:
      return playerClassGuardian();
    case CardClass.Seeker:
      return playerClassSeeker();
    case CardClass.Rogue:
      return playerClassRogue();
    case CardClass.Mystic:
      return playerClassMystic();
    case CardClass.Survivor:
      return playerClassSurvivor();
    case CardClass.Neutral:
      return playerClassNeutral();
    default:
      throw new Error(`Unknown class: ${c}`);
  }
}

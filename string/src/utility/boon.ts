import { Boon } from '@5argon/arkham-kohaku';
import * as m from '../paraglide/messages.js';

/**
 * Get the translated name for a boon.
 * Uses Paraglide messages to return the localized boon name.
 */
export function boonName(boon: Boon): string {
  switch (boon) {
    case Boon.Ancients:
      return m.boonAncients();
    case Boon.Athena:
      return m.boonAthena();
    case Boon.Destiny:
      return m.boonDestiny();
    case Boon.Hades:
      return m.boonHades();
    case Boon.Hermes:
      return m.boonHermes();
    case Boon.Morrigan:
      return m.boonMorrgan();
    case Boon.Osiris:
      return m.boonOsiris();
    case Boon.Persephone:
      return m.boonPersephone();
    case Boon.Thoth:
      return m.boonThoth();
    default:
      throw new Error(`Unknown boon: ${boon}`);
  }
}

import { Refraction } from '@5argon/arkham-kohaku';
import * as m from '../paraglide/messages.js';

/**
 * Get the translated name for a refraction.
 * Uses Paraglide messages to return the localized refraction name.
 */
export function refractionName(refraction: Refraction): string {
  switch (refraction) {
    case Refraction.UltimatumOfInvisibility:
      return m.refractionUltimatumOfInvisibility();
    case Refraction.UltimatumOfMultiplication:
      return m.refractionUltimatumOfMultiplication();
    case Refraction.UltimatumOfDeath:
      return m.refractionUltimatumOfDeath();
    case Refraction.UltimatumOfTheMan:
      return m.refractionUltimatumOfTheMan();
    case Refraction.UltimatumOfTheUnspeakableName:
      return m.refractionUltimatumOfTheUnspeakableName();
    case Refraction.UltimatumOfVenom:
      return m.refractionUltimatumOfVenom();
    case Refraction.UltimatumOfTheDrowned:
      return m.refractionUltimatumOfTheDrowned();
    case Refraction.UltimatumOfAnnoyance:
      return m.refractionUltimatumOfAnnoyance();
    case Refraction.BoonOfTheDreamer:
      return m.refractionBoonOfTheDreamer();
    case Refraction.BoonOfAtonement:
      return m.refractionBoonOfAtonement();
    case Refraction.BoonOfTheDance:
      return m.refractionBoonOfTheDance();
    case Refraction.BoonOfBliss:
      return m.refractionBoonOfBliss();
    case Refraction.BoonOfTheMiners:
      return m.refractionBoonOfTheMiners();
    case Refraction.UltimatumOfTheBrassCrown:
      return m.refractionUltimatumOfTheBrassCrown();
    case Refraction.UltimatumOfAmbuscade:
      return m.refractionUltimatumOfAmbuscade();
    case Refraction.UltimatumOfSpoilage:
      return m.refractionUltimatumOfSpoilage();
    default:
      throw new Error(`Unknown refraction: ${refraction}`);
  }
}

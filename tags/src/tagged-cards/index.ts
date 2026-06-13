import type { TaggedCard } from "../type.js";
import rcore from "./rcore.js";
import dwl from "./dwl.js";
import ptc from "./ptc.js";
import tfa from "./tfa.js";
import nat from "./nat.js";
import har from "./har.js";
import win from "./win.js";
import jac from "./jac.js";
import ste from "./ste.js";

/**
 * Every tagged card across all packs, in pack/position order.
 *
 * Append new packs here as their `tagged-cards/<pack>.ts` files land:
 * add one `import <pack> from "./<pack>.js";` above and one `...<pack>` spread below.
 */
export const allTaggedCards: TaggedCard[] = [
  ...rcore,
  ...dwl,
  ...ptc,
  ...tfa,
  ...nat,
  ...har,
  ...win,
  ...jac,
  ...ste,
];

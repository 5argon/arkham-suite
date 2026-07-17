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
import tcu from "./tcu.js";
import tde from "./tde.js";
import tic from "./tic.js";
import eote from "./eote.js";
import tsk from "./tsk.js";
import fhv from "./fhv.js";
import tdc from "./tdc.js";
import and from "./and.js";
import car from "./car.js";
import mar from "./mar.js";
import mig from "./mig.js";
import tom from "./tom.js";
import core2026 from "./core2026.js";
import rtnotz from "./rtnotz.js";
import rtdwl from "./rtdwl.js";
import rtptc from "./rtptc.js";
import rttfa from "./rttfa.js";
import rttcu from "./rttcu.js";

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
  ...tcu,
  ...tde,
  ...tic,
  ...eote,
  ...tsk,
  ...fhv,
  ...tdc,
  ...and,
  ...car,
  ...mar,
  ...mig,
  ...tom,
  ...core2026,
  ...rtnotz,
  ...rtdwl,
  ...rtptc,
  ...rttfa,
  ...rttcu,
];

import { TagBase } from "../../base.js";

export enum TagTypeUsesMarker {
  UsesBoardMarker = "uses-board-marker",
}

/**
 * Moves its use-tokens onto BOARD entities (locations, enemies, investigators)
 * as markers, later consumed for remote effects — the EOTE leyline/gate family
 * (Archive of Conduits' four gates, Occult Reliquary). Distinct from
 * uses-support (tokens onto other PLAYER cards) and uses-self-place.
 * (Created autonomously 2026-07-17 — review welcome.)
 */
export interface TagUsesBoardMarker extends TagBase {
  type: TagTypeUsesMarker.UsesBoardMarker;
}

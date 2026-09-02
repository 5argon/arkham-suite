import { TagBase } from "../../base.js";

export enum TagTypeRemote {
  RemoteInvestigate = "remote-investigate",
  RemoteMove = "remote-move",
  RemotePlayEvent = "remote-play-event",
}

interface TagRemoteBase extends TagBase {}

/** Investigate a location other than your own ("as if you were there"). */
export interface TagRemoteInvestigate extends TagRemoteBase {
  type: TagTypeRemote.RemoteInvestigate;
}

/** Move to any revealed location, not just a connecting one (teleport-style). */
export interface TagRemoteMove extends TagRemoteBase {
  type: TagTypeRemote.RemoteMove;
}

/**
 * Play an EVENT as if you were at another location (Luke Robinson's "as if you
 * were at a connecting location", Miguel de la Cruz) — the event-play member of the
 * remote family.
 */
export interface TagRemotePlayEvent extends TagRemoteBase {
  type: TagTypeRemote.RemotePlayEvent;
}

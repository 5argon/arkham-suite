import { TagBase } from "../../base.js";

export enum TagTypeRemote {
  RemoteInvestigate = "remote-investigate",
  RemoteMove = "remote-move",
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

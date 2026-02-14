import { TagBase } from "../../base.js";

export enum TagTypeAuto {
  AutoEvade = "auto-evade",
  AutoSuccess = "auto-success",
}

interface TagAutoBase extends TagBase {}

export interface TagAutoEvade extends TagAutoBase {
  type: TagTypeAuto.AutoEvade;
}

export interface TagAutoSuccess extends TagAutoBase {
  type: TagTypeAuto.AutoSuccess;
}

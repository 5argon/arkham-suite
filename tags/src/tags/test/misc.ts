import { TagBase } from "../../base.js";

export enum TagTypeTestMisc {
  TestYouPerform = "test-you-perform",
}

interface TagTestMiscBase extends TagBase {}

export interface TagTestYouPerform extends TagTestMiscBase {
  type: TagTypeTestMisc.TestYouPerform;
}

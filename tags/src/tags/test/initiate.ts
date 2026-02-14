import { TagBase } from "../../base.js";

export enum TagTypeTestInitiate {
  TestInitiateAgility = "test-initiate-agility",
  TestInitiateCombat = "test-initiate-combat",
  TestInitiateIntellect = "test-initiate-intellect",
  TestInitiateWillpower = "test-initiate-willpower",
}

interface TagTestInitiateBase extends TagBase {
  difficulty: number;
}

export interface TagTestInitiateAgility extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateAgility;
}

export interface TagTestInitiateCombat extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateCombat;
}

export interface TagTestInitiateIntellect extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateIntellect;
}

export interface TagTestInitiateWillpower extends TagTestInitiateBase {
  type: TagTypeTestInitiate.TestInitiateWillpower;
}

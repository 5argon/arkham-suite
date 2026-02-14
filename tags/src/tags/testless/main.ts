import { TagBase } from "../../base.js";

export enum TagTypeTestless {
  TestlessDamageYourLocation = "testless-damage-your-location",
  TestlessDamageYourLocationMultiple = "testless-damage-your-location-multiple",
  TestlessDamageConnectingLocation = "testless-damage-connecting-location",
  TestlessDamageAttackingEnemy = "testless-damage-attacking-enemy",
  TestlessClue = "testless-clue",
  TestlessEvade = "testless-evade",
}

interface TagTestlessBase extends TagBase {}

interface TagTestlessWithValueBase extends TagTestlessBase {
  value: number;
}

export interface TagTestlessDamageYourLocation extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageYourLocation;
}

export interface TagTestlessDamageYourLocationMultiple extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageYourLocationMultiple;
}

export interface TagTestlessDamageConnectingLocation extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageConnectingLocation;
}

export interface TagTestlessDamageAttackingEnemy extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessDamageAttackingEnemy;
}

export interface TagTestlessClue extends TagTestlessWithValueBase {
  type: TagTypeTestless.TestlessClue;
}

export interface TagTestlessEvade extends TagTestlessBase {
  type: TagTypeTestless.TestlessEvade;
}

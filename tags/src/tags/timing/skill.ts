import { TagBase } from "../../base.js";
import type { TimingQualifier } from "../../type.js";

export enum TagTypeTimingSkill {
  // ST.1 Determine skill type of test. Skill test of that type begins.
  TimingSkillSt1DetermineSkillType = "timing-skill-st1-determine-skill-type",
  
  // ST.2 Commit cards from hand to skill test.
  TimingSkillSt2CommitCards = "timing-skill-st2-commit-cards",
  
  // ST.3 Reveal chaos token.
  TimingSkillSt3RevealChaosToken = "timing-skill-st3-reveal-chaos-token",
  
  // ST.4 Apply chaos symbol effect(s).
  TimingSkillSt4ApplyChaosEffect = "timing-skill-st4-apply-chaos-effect",
  
  // ST.5 Determine investigator's modified skill value.
  TimingSkillSt5DetermineSkillValue = "timing-skill-st5-determine-skill-value",
  
  // ST.6 Determine success/failure of skill test.
  TimingSkillSt6DetermineResult = "timing-skill-st6-determine-result",
  
  // ST.7 Apply skill test results.
  TimingSkillSt7ApplyResults = "timing-skill-st7-apply-results",
  
  // ST.8 Skill test ends.
  TimingSkillSt8TestEnds = "timing-skill-st8-test-ends",
}

interface TagTimingSkillBase extends TagBase {
  timing: TimingQualifier;
}

// ST.1 Determine skill type of test. Skill test of that type begins.
// This step formalizes the beginning of a skill test. There are four types of skill tests:
// willpower tests, intellect tests, combat tests, and agility tests.
export interface TagTimingSkillSt1DetermineSkillType extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt1DetermineSkillType;
}

// ST.2 Commit cards from hand to skill test.
// The investigator performing the skill test may commit any number of cards with an appropriate
// skill icon from their hand. Each other investigator at the same location may commit one card.
export interface TagTimingSkillSt2CommitCards extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt2CommitCards;
}

// ST.3 Reveal chaos token.
// The investigator performing the skill test reveals one chaos token at random from the chaos bag.
export interface TagTimingSkillSt3RevealChaosToken extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt3RevealChaosToken;
}

// ST.4 Apply chaos symbol effect(s).
// Apply any effects initiated by the symbol on the revealed chaos token.
export interface TagTimingSkillSt4ApplyChaosEffect extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt4ApplyChaosEffect;
}

// ST.5 Determine investigator's modified skill value.
// Start with the base skill and apply all active modifiers, including committed icons,
// effects of chaos tokens revealed, and all active card abilities.
export interface TagTimingSkillSt5DetermineSkillValue extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt5DetermineSkillValue;
}

// ST.6 Determine success/failure of skill test.
// Compare the investigator's modified skill value to the difficulty of the skill test.
export interface TagTimingSkillSt6DetermineResult extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt6DetermineResult;
}

// ST.7 Apply skill test results.
// The card ability or game rule that initiated the test indicates the consequences
// of success and/or failure. Resolve the appropriate consequences at this time.
export interface TagTimingSkillSt7ApplyResults extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt7ApplyResults;
}

// ST.8 Skill test ends.
// This step formalizes the end of this skill test. Discard all cards that were committed
// to this skill test, and return all revealed chaos tokens to the chaos bag.
export interface TagTimingSkillSt8TestEnds extends TagTimingSkillBase {
  type: TagTypeTimingSkill.TimingSkillSt8TestEnds;
}

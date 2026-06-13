import { TagBase } from "../../base.js";

export enum TagTypeSkillValueSource {
  SkillValueFromResource = "skill-value-from-resource",
}

interface TagSkillValueSourceBase extends TagBase {
  /**
   * The denominator: skill value gains +1 for every `per` resources held
   * (e.g. "+1 skill value for every 5 resources" => per = 5).
   */
  per: number;
}

/**
 * Skill value scales off the resources you HOLD (not spend), e.g.
 * "+1 skill value for every 5 resources" or base value "equal to half your
 * resources". Distinct from StatsModPumpResource (per resource SPENT) and from
 * flat boosts.
 */
export interface TagSkillValueFromResource extends TagSkillValueSourceBase {
  type: TagTypeSkillValueSource.SkillValueFromResource;
}

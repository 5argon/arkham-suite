import { CompoundTagType } from "./compound-tag-type.js";
import { TagType } from "./tag-type-union.js";

/**
 * To decide whether to create a new tag, or add arguments to an existing tag,
 * picture a system that suggests similar cards based on "aspects" of the card.
 *
 * Each aspect is represented by a tag, and it find other cards with the same tag
 * regardless of the tag's argument. (Though it could offer to further filter by the argument.)
 *
 * For example a tag `TagBoldFight` exists, but not `TagBold` with argument "fight".
 * Because it is unlikely that user wants to find any card with bold action designator.
 *
 * In the case that it is needed, we can make a compound tag which can group multiple tags together.
 */
export interface TagBase {
  type: TagType;
}

/**
 * Cards cannot be tagged with a compound tag. However, each tag could be searched for
 * compound tags that contains it.
 */
export interface CompoundTagBase {
  type: CompoundTagType;
  tags: TagType[];
}

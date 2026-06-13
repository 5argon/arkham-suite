import { tagStrings, baseLocale } from "./tag-strings.js";
import type { TagType } from "./tag-type-union.js";
import type { CompoundTagType } from "./compound-tags/compound-tags.js";
import type { TagGroupId } from "./tag-group.js";

export interface LocaleOpt {
  /** Locale to render in; defaults to the package base locale ("en"). */
  locale?: string;
}

const keyFor = (v: string) => v.replaceAll("-", "_");
// Compound type values carry a `c-` namespace prefix on the machine id (so they are
// self-describing in the merged JSON / logs). The i18n key strips it, so display
// strings stay keyed by the bare name (`tag_compound_bold_action`, not `..._c_...`).
const compoundKey = (v: string) => keyFor(v.replace(/^c-/, ""));

function lookup(key: string, locale?: string): string | undefined {
  return tagStrings[locale ?? baseLocale]?.[key] ?? tagStrings[baseLocale]?.[key];
}

/** Localized display name for a tag type. */
export function tagName(type: TagType, opts?: LocaleOpt): string {
  return lookup(`tag_${keyFor(type)}`, opts?.locale) ?? type;
}

/** Localized display name for a tag group. */
export function tagGroupName(id: TagGroupId, opts?: LocaleOpt): string {
  return lookup(`tag_group_${keyFor(id)}`, opts?.locale) ?? id;
}

/** Localized display name for a compound tag. */
export function compoundTagName(type: CompoundTagType, opts?: LocaleOpt): string {
  return lookup(`tag_compound_${compoundKey(String(type))}`, opts?.locale) ?? String(type);
}

/** Friendly localized description of a tag type (undefined if none is authored yet). */
export function tagDescription(type: TagType, opts?: LocaleOpt): string | undefined {
  return lookup(`desc_tag_${keyFor(type)}`, opts?.locale) || undefined;
}

/** Friendly localized description of a tag group (undefined if none is authored yet). */
export function tagGroupDescription(id: TagGroupId, opts?: LocaleOpt): string | undefined {
  return lookup(`desc_group_${keyFor(id)}`, opts?.locale) || undefined;
}

/** Friendly localized description of a compound tag (undefined if none is authored yet). */
export function compoundTagDescription(type: CompoundTagType, opts?: LocaleOpt): string | undefined {
  return lookup(`desc_compound_${compoundKey(String(type))}`, opts?.locale) || undefined;
}

/** Locales for which the package ships strings. */
export const availableLocales: string[] = Object.keys(tagStrings);

export { baseLocale };

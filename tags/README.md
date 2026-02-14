# @5argon/arkham-tags

Tag each Arkham Horror : The Card Game's corresponding to what are contained in its game effect text box. This makes them searchable without having to perform unreliable text processing of what you are interested in.

This is similar to "heal damage" and "heal horror" already in use in arkhamdb card database, because they are needed for Carolyn and Vincent's deckbuilding. This time we are adding tags even through they are not needed for any investigators, but needed for the deckbuilders.

## Compound Tags

One compound tag is a predetermined collection of tags. One tag can participate in multiple compound tags. This system allows tagging only the most specific case available and don't have to think about any broader ones, they joins the broader group automatically.

For example, a card that trigger things on a certain symbols, and a card that seal symbol tokens, are both considered related to a compound tag of cards "playing" with symbols.

## Example Usages

Cards were overlapping between decks to play with one collection. Each overlapping cards contains a number of tags. For each tag, we can search for all other cards in the game with the same tag but possibly different arguments, as potentially good enough replacement of that card. We can then further filter by investigator access but it is not the task of this package.

Additionally for each tag, search all compound tags that use it. For each compound tag found, all its tags could also be used to search for more cards that are broadly matching.

## Format

The tags are to be distributed in JSON format. But the design came from TypeScript type definitions so it is harder to make mistakes.

What's inside `src/tags` folder follows very rigid pattern.

- Always one folder inside to act as broad category of the tags. This name is appended to all tags inside as a prefix. Even if there is only one kind of tag inside, you must make a folder for it.
- Inside each folder has `index.ts` that exports everything from all files. Each other file contains multiple tags that's to have both folder name's prefix and file name's prefix. If a descriptive file name is hard to come up with, you can use `main.ts` as the file name.
- In each file :
  - `TagType[FolderName][FileName]` : `enum` of discriminating string for the tag used within the file. If using `main.ts`, the `[FileName]` part can be omitted.
  - `Tag[FolderName][FileName]Base` : Base type for all tags in this folder to extend from. If using `main.ts`, the `[FileName]` part can be omitted.
  - `Tag[FolderName][FileName][Something]` : Each tag with the appropriate `type` using `TagType[FolderName][FileName]`. If using `main.ts`, the `[FileName]` part can be omitted.

If there is only to be one kind of tag inside the file, the `[Something]` can be empty, and the enum can consist of only one choice named like the enum itself.

## Adding New Tags

After adding or modifying tags in the `src/tags/` folder structure, you MUST regenerate the union files to ensure TypeScript can properly type-check your tags. Run:

```bash
bun run sync-unions
```

This will automatically:
1. Scan all `.ts` files in `src/tags/` subdirectories
2. Extract all `export enum TagType*` declarations
3. Extract all `export interface Tag*` declarations (excluding those ending with "Base")
4. Regenerate `src/tag-type-union.ts` with all enum types
5. Regenerate `src/tag-interface-union.ts` with all tag interfaces

The script follows the established conventions:
- Only scans first-level subdirectories in `src/tags/`
- Ignores `index.ts` files
- Automatically groups imports by category folder
- Sorts all types and interfaces alphabetically

**Important**: Do NOT manually edit `tag-type-union.ts` or `tag-interface-union.ts` - they are auto-generated. If the generated files are out of sync, the `Tag` type will show as `any` and TypeScript will not catch errors.

## Tagging Mechanism

Currently the best "UI" to tag cards is VSCode + TypeScript. I've wired up the types such that the editor autocompletes and warns you of missing / wrong arguments.

The core mechanism is the `type` required field of all tags where if you could figure out this one field, it will discriminate all the unions to exactly 1 type and will begs you for all other required fields automatically. The intellisense can help you find the right one if you type roughly but not exactly.

You can use go to reference on any of the `TagType___` type to jump to the file that defines it. There, a good editor can also show how many times that tag was used, and maybe we can find dead tags or some that should be merged.

It is recommended to tag in the order that appears in the text, so we can see easier what's missing.

After we tags all cards in TypeScript, I hope to convert them to JSON later to become real source of truth.

## Tagging Fundamentals

It is unavoidable that the tagger needs to know all the available tags, and also what intentionally aren't available because they wouldn't be that useful and adds too much to the tagging time. For example, a tag that tell the existence of [action] in the card doesn't exist because that would be easy with string processing.

Tags are hierarchical in their name to help tagger recall tags after reading the text on the card and try to find the right one for it. Here are all the big ones that are used often.

The most important helper to figure out the tags to add is that all tag type enum starts with `TagType`, this significantly narrows down what intellisense is showing.

- There are tags in category "cost" for each trigger type : "action", "reaction", "free". But there is no cost tags of the uses type of that asset because it is kind of obvious and useless. Exhaust cost and resource cost might have applications.
- "timing" category is a big one that you can tag the timing on free / reaction and Fast cards. Subcategory includes "phase sequence" when they refer to any point of the 4 phases outside of skill test timings, "skill" when inside any ST1~8 of the skill test timings, and "when" or "after" for all other cases. "forced" is separated because the timing for those are weirder.
- Skill card effects do not use timing tags. Their effect that occurs when skill is successful, etc. should use "skill-test-condition" tags.

But there are some unexpected ones : 

- It might sounds like there should be a "deal" category for deal damage and deal horror, however I've made "testless" category instead to also include testless evade and that's not a "deal".
- You might expect "draw" and "search" to be top level category, but they are under "deck".
- Explicit "Testless" category exists. We need this because for example, the "discover clues" sometimes follows a test and also check for test's result and doesn't really feel like they are testless even though that part is testless.
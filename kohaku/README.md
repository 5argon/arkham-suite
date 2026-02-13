# @5argon/arkham-kohaku

Offer type definitions and utilities to work with various Arkham Horror : The Card Game ecosystem, such as arkhamdb.com, ArkhamCards, or arkham.build.

## Enums

Most of the game terms are defined in TypeScript [`enum`](https://www.typescriptlang.org/docs/handbook/enums.html), with string value corresponding from the original JSON. (Like "litas" being a value for `DunwichEncounterSet.LostInTimeAndSpace`.) If you really want a type of union of string literals, you can make it yourself with [`keyof typeof`](https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-compile-time).
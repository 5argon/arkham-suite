# @5argon/arkham-string

Project containing various localized strings used in official Arkham Horror : The Card Game product, such as campaign name, class name, encounter set name.

## Sources

- My own [3mm Divider](https://arkham-starter.com/divider) project. It contains community-contributed terms to be put on dividers. Many of these terms doesn't exist on arkhamdb but are useful.
- (Not available yet) Translated text on the cards from `https://github.com/kamalisk/arkhamdb-json-data/`.

## Entry points

It exports 3 symbols :

- `m` : Stands for "messages". It is a Paraglide `messages` module, which contains all terms, represented as functions.
- `r` : Stands for "runtime". Also a Paraglide module, you can see the available language and configure what comes out of `m` when there is no explicit language.
- `u` : Stands for "utility". These are hand-written functions that help you get the right term, given some AHLCG-specific input.

## How it works

This project uses [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs). From (linear) key-value pair JSON in `./messages`, it generates one function per term. Calling the function would get you the string. This package exports those generated functions, not the JSON. This makes each string individually tree-shakable.

Paraglide doesn't support any nesting in organizing the term, so I use prefix to convey the nesting instead. Naming convention is camel case.

## Peer dependency : @5argon/arkham-kohaku

A more important feature of this package is that it can `switch case` the right term for you given a AHLCG kind-of-things, such as `Campaign.TheForgottenAge` or `CardClass.Survivor`. The definition of those things lives in `@5argon/arkham-kohaku` package.

## Scripts

- `import` : In `messages` folder there is a CSV file with terms from my 3mm Divider project. This script read content of that file into respective `languageCode.json`. In the future I'll add card-related terms from arkhamdb.
- `build` : Use Paraglide to turn all the `json` into functions, which are then exported after building the project. This script then use `tsc` to build the project as well.


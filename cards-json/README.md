# cards-json

A package of Deno scripts that prepare `cards.json` file, a modified database of all cards in the game that https://arkham-starter.com uses.

This `cards.json` is in the same format as stored in https://github.com/Kamalisk/arkhamdb-json-data. (e.g. The `duplicate_of` remains unresolved, no `duplicated_by`, etc.) The input is a `pack` folder from that repository placed on the root of this package.

## List of modifications

- All `text` and `back_text` removed except some keywords, since site always show card images and will not render the card text.
- The Scarlet Keys Upgrade Sheets are added after the last card of this expansion with card type "upgrade".

## Commands

### `pack` (merge-pack)

Merges all JSON files from the `pack` folder into `pulls/json/cards.json`. This is the first step that should be run before other scripts. Run with `yarn merge-pack` or `deno run --allow-read --allow-write pack.ts`.

This script handles the `duplicate_of` field specially:
- First pass: collects all cards and tracks which ones have `duplicate_of`
- Second pass: resolves `duplicate_of` by copying all fields from the target card, then overriding with the current card's fields
- The `duplicate_of` field is kept in the resolved card

### `download`

Blatantly steals images of all those cards from arkham.build as much as possible, as needed by `cards.json`. If something aren't available, the next command can handle it. Every cards are considered English.

This empties the target folder on each run. As this use someone else's bandwidth, you shouldn't run this often.

### `patch`

Add additional card graphics to the `download` result, whether it's English or other languages. These came from `patch` folder. Now we are ready to create `valid.json` which tells you what images are available or missing.

### `process`

Make variations of card graphics from `true` folder.

## Then?

- `cards.json` placed on `src/lib/data` on the site. This file is imported by client code on any pages that need to use all cards in the game, ensuring client only load this module once.
- `cards.json` is also uploaded to Cloudflare R2. The server side worker will download this JSON and cache it, so it could work with things such as URL parameters while knowing all cards in the game. We cannot let this JSON contribute to worker's code since it will exceed 3 MB limit of the free tier.
- All graphic folders except `true` are then synchroized to Cloudflare R2 with `rclone`, site's `<img>` then use those images.
# Card Reviews content

Everything here is validated by `src/lib/server/reviews.test.ts`, which names what's wrong and how to fix it. Card codes are always the card's own page: a reprint uses the Core Set 2026 printing.

## `source/*.json`: videos and articles made elsewhere

Each file is a list. A source can talk about any number of cards, and anything talking about a card can be added, even if its title doesn't name the card.

```json
{
	"by": "playing-board-games",
	"title": "4 Cards From Chapter 2 That May (Or Should!) Be Tabooed",
	"date": "2026-11-03",
	"media": { "youtube": "tDS08o6TMDM" },
	"cards": [{ "code": "60362", "start": "12:34" }, { "code": "12052" }]
}
```

- `by` is a file in `../contributor`, or use `"guest": { "name": "...", "url": "...", "avatarUrl": "..." }` for someone appearing once.
- `date` is when it came out, and can't be before Chapter 2 was announced (2025-10-31). It's shown apart from the point in time it speaks about.
- `environment` is the point in time it speaks about: `evergreen` or a later point's id. It defaults to the point on `date`, and anything older than the first point is Evergreen. A preview comes out before its product does, so one for a product beginning a new point should name that point. A point can talk about its own cards and cards pushed out before it, like a later review adding to an earlier one, but not cards that came out after it.
- `media` is `{ "youtube": id }`, `{ "twitch": id }`, or `{ "url": page }` for anything else, adding `"as": "video"` or `"as": "audio"` when it isn't something to read. Everything opens on its own site in a new tab.
- A video card can add `"start"`, and its link opens at that time. An article card can add `"text"`, the words to jump to on the page. Don't add the creator's verdict: readers should go and find out.
- Something about a campaign adds `"campaigns": ["cob"]`, and is listed on that campaign's page behind a button. `"cards"` can be empty then, and it can be older than the Chapter 2 announcement. For a site with its own page per campaign, link that page rather than every article it lists. Something only about a whole product, like an unboxing of a box with no campaign, doesn't go on this site.
- `"language": "es"` when it isn't in English, and `"humor": true` for satire.
- A roundup or any post going through many cards is one source, with each card's `text` jumping to its own paragraph. Cards sharing a paragraph share the `text`. It's separate from that creator's own preview of the card, since what it says differs.

## `card/<code>/`: hand-written reviews

Each review is one markdown file named by its id, like `card/12073/5argon-bandages.md`, starting with its details as YAML front matter. The rest is the review, in the same format as a deck guide. The id is what its link ends with, so don't rename a published one.

```md
---
by: 5argon
date: 2026-11-04
environment: evergreen
---

The review starts here.
```

`originalUrl` is where the same review was first published, like `https://arkhamdb.com/card/12070#review-5992`, a blog post or a video. It shows as a link at the top of the review. The text is the author's own: bring it over word for word. Someone appearing once uses `guest` instead of `by`, with `name` and optionally `url` and `avatarUrl` under it. A review has no title: the card and its author are enough, and a subsection heading is how to say what a part is about.

A heading of any level with a link to a card in it is a subsection about that card, usually an investigator. It shows as that card's card line in a divider instead of as text:

```md
## [Marie Lambeau](/card/60451)

Why this card is so good on Marie.

### **[Dexter Drake](/card/12010)**: the fast version
```

Bold, italics and icons around the link make no difference, since the card line takes its place. Other words stay, as plain text under the card line, and become what the list says it's about. A heading linking several cards shows them all in one divider, one per line; separate them with only spaces or punctuation unless you want the words as a title. Each card linked gets it collected onto its page, under "Marie Lambeau in Reviews of Other Cards", linking right to it. It shares the review's author and environment. To mention a card in a heading without this, leave it unlinked. A link to the card under review, or to one with no page like a Chapter 1 card, still shows as a card line but isn't collected anywhere.

## `card/<code>/buildql.json`: BuildQL Presets

Searches on arkham.build made for one card, shown on its page under "BuildQL Presets". Each preset is a row: its label, a search without an investigator (`ch = 2 & (...)`), then one for each investigator of the latest point of the Current environment who can take the card (`ch = 2 & ia = "<investigator>" & (...)`), worked out when the site is built. So leave `ch` and `ia` out of the query. On an investigator's page and on a signature card's page there's only that investigator, and the presets show as a grid of buttons. On a weakness's page there's only the search without one.

```json
{
	"presets": [
		"weapon",
		"tool-and-not-weapon",
		{ "label": "[[Firearm]] with ammo", "query": "tr == \"firearm\" & text = \"uses ammo\"" }
	]
}
```

A preset on more than one card is written once in `buildql-presets.json`, next to the card folders, and a card names it by its key. So the same search reads the same everywhere, and fixing it fixes every page. A preset only one card has is written out right there. A test fails when a key isn't in `buildql-presets.json`, when a shared preset isn't used, when a card writes out a shared preset or one with a shared label, and when two cards write out the same preset, which then belongs with the shared ones.

`buildql-presets.json` is in order by theme, not by name: card kinds and traits, then stats and tests, actions, succeeding and failing, enemies, damage and horror, and resources. Shared presets on a card come in that same order, so related ones sit together, like "Benefits from taking horror", "Benefits from horror placed on it" and "Benefits from being defeated". A test fails when they don't. A new shared preset goes next to the ones it belongs with. A preset written out on one card can go anywhere among them, wherever it reads best.

A preset can have an `icon`, a `FaIconType` name shown before its label, like `"icon": "Health"`. Icons mark the searches every investigator's page has, which come first on it in this order: "Use good stats" (`GoodStats`), "Lv. 0 double commit for …" (`DoubleCommit`), "Helps with damage" (`Health`) and "Helps with horror" (`Sanity`) for an investigator with 5 or 6 of it, or whose play leans on it (Daniela both since she's attacked a lot, Isabelle both for her ability, Carolyn horror, Marie damage), "Gain resource" (`Resource`) and "Draws cards" (`DrawCards`). A preset with an icon comes before those without on any card, and a test fails when it doesn't or when the name isn't a `FaIconType`.

To narrow a preset down to some levels or costs, give its use a range instead of writing it into the query, so every label words it the same way. A shared preset's label is written singular and on its own, like "Asset", "Event" or "[[Spell]] event".

| Use | Label | Added to the query |
| --- | --- | --- |
| `{ "preset": "event", "level": [0, 0] }` | Lv. 0 event | `xp = 0` |
| `{ "preset": "spell-event", "level": [1, 5] }` | Lv. 1~5 [[Spell]] event | `xp >= 1 & xp <= 5` |
| `{ "preset": "asset", "cost": [2, 2] }` | Asset costed exactly 2 | `cost = 2` |
| `{ "preset": "asset", "cost": [3, null] }` | Asset costed 3 or more | `cost >= 3` |
| `{ "preset": "asset", "cost": [0, 2] }` | Asset costed 2 or less | `cost >= 0 & cost <= 2`, which leaves out X costs |
| `{ "preset": "asset", "cost": [1, 2] }` | Asset costed 1~2 | `cost >= 1 & cost <= 2` |
| `{ "preset": "event", "level": [0, 0], "doubleCommit": true }` | Lv. 0 event for a double commit | `xp = 0 & (willpower + wild >= 2 \| intellect + wild >= 2 \| combat + wild >= 2 \| agility + wild >= 2)`, a card giving 2 or more icons to a test of one skill |

A preset written out on one card takes `level` and `cost` too. A range never goes into `buildql-presets.json`, and a test fails on a query that compares `xp`, `level` or `cost` itself.

Hovering a square shows the investigator and the whole query. On a page for one investigator only, `"all": true` on a preset adds the search without them as a second button, for a card that helps others too; the two read "(Usable)" and "(All)". For a shared preset, write `{ "preset": "<key>", "all": true }`. To use the investigator in the query yourself, write `{ia}` where their code goes, like `ia != "{ia}"` for cards they can't take yet. Then the query isn't limited to what they can take, and there's no square without an investigator. A label can show icons and traits the same way card text does, like `"Uses [agility]"` or `"[[Ally]] with 2+ health"`. The query language is at https://github.com/arkham-build/arkham.build/blob/main/frontend/src/store/lib/buildql/buildql.md. A test catches a word that isn't a field, unbalanced parentheses, and comparing two fields of different types.

### Writing a query

Queries search the raw ArkhamDB text, ignoring case: icons are `[agility]`, traits `[[Tome]]`, keywords `<b>Fight</b>`.

- `text = "a b"` is fuzzy: the words in order, up to 20 characters apart, and a word can be part of a longer one. `text == "a b"` is that exact text.
- Several options of one field go in a list: `text ? ["a", "b"]` matches any of them fuzzily and `text ?? ["a", "b"]` exactly, and `text !? [...]` / `text !?? [...]` match none of them. A test fails on the same comparison chained instead, like `text = "a" | text = "b"` or `text != "a" & text != "b"`. A regex stays on its own.
- A trait, the type and a faction are each a whole word, so compare them with `==` and `!==`: `tr == "tome"`, `type == "asset"`, `faction == "survivor"`. With `=` a trait would also find a longer one with it inside, like "Ritual Site" for "ritual", and the tooltip would call it fuzzy. A test catches it. A slot is the exception: `slot = "hand"` finds "Hand" and "Hand x2", and `slot == "hand x2"` only two-handed ones.
- A word inside a longer one is the usual trap: "as" in "fast" and "has", "less" in "bless", "fail" in "[auto_fail]", "take" in "takes", "exhaust" in "exhausted", "discard" in "discarding". Use `==` or a longer phrase.
- The 20 characters run out when a card's name sits between the words, as in "Secrets on Typewriter may be spent as if". Split it into two terms joined with `&`.
- `!=` and `!==` leave out the whole card if the text appears anywhere on it, even in another ability.
- `cost` and `xp` comparisons fail for a card without one, like a permanent, which is usually what you want. An X cost counts as -2, so give a cost range a lower end, `cost >= 0`.
- Comparing two fields only works when they're the same type, like `health > sanity`. `text = name` is an error, and arkham.build then shows every card instead of saying so. There's no way to put a card's own name into a text search; Will of the Cosmos writes `"discard {name}"` anyway, waiting for arkham.build to support it.

Patterns that worked:

- An action using a stat: `text = "<b>fight</b> [combat]"`, which also finds "Fight ([combat] or [agility])". A Parley card that tests a stat: `text == "<b>parley" & text == "[intellect]"`.
- Being tested on a stat: `text ? ["([agility]", "[agility])"] | text == "test [agility]"`. Chapter 2 puts the stat an action tests in parentheses, as in "<b>Fight</b> ([combat]). Add your [willpower] to your [combat]", and only a plain test like "Test [willpower] (5)" goes without.
- Using a stat at all adds `text = "add [agility]"`, for a card that adds it to another stat's test, like Lockpicks.
- Healing: the tags `hd = true` and `hh = true`, kept by ArkhamDB, rather than the text.
- Weaknesses stay in by default, since one can be worth knowing about. `subtype != "weakness"` (fuzzy on purpose) leaves out both kinds when a preset needs it.
- Preset on the card that helps, finding what it helps, like Stock Ammo Reload's `tr == "firearm" & text = "uses ammo"`.

Check a query against the card text before adding it, in `src/lib/server/data/card-text.json`. That file has Chapter 1 cards too, but every search is locked to `ch = 2`, so only the Chapter 2 packs count (`core_2026`, `tom`, `car`, `and`, `mar`, `mig`, `cob`). Leave out a term that only finds Chapter 1 wording: it makes the query longer for a newcomer to read and finds nothing.

## `preview/*.json`: Preview Season

What creators said from the review copies they got before the cards were sold, in the order it came out. Each file is one season, with sources grouped as they were on the schedule, and each group lists the `products` whose preview season it's part of. `"official": true` keeps a post off the card pages. `"media": { "discord": true }` credits what can't be linked to.

A card that's just been revealed isn't in the card data yet, so it's stated by hand instead of by `code`. A test asks for its `code` once the card data has it.

```json
{ "name": "Some New Card", "type": "asset", "class": "guardian", "level": 2 }
```

`class` can be a list for a multiclass card, and `level` can be left out for level 0.

## `chapter-one/*.json`: reviews from Chapter 1

A file per Chapter 1 product, named by its route. These are kept out of the way on purpose: only a small link at the bottom of that product's `/player` page leads here. They aren't in the sitemap, on anyone's reviewer page, in Recent or in any count elsewhere.

A card is what a review belongs to, so each entry says which cards it speaks about, with `cards` as above (including `text` to jump to), `"covers"`, or both. `"covers"` is `"all"`, `"investigators"`, or a list of classes like `["guardian"]`, which skips investigators and cards only one investigator can take. Something that can't be pinned down to cards, like a top 5 whose cards aren't known or an unboxing, is left out.

FFG took its Chapter 1 articles down in the move to its new site, so link to the Wayback Machine. A test catches a link to the old address. `date` can be left out when it can't be found, and that sorts it last. `"preview": true` tags something shown before the product came out.

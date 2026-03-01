# arkham.life (`@5argon/arkham-life`)

A local, browser-based tool for recording your *Arkham Horror: The Card Game* history — campaigns, decks, achievements, and card/investigator usage — and turning it into a customizable **profile** you can view and (soon) deploy a public copy of.

There are no accounts and no backend for your data: everything lives in your own browser. The app itself is a static client served from Cloudflare.

---

## Core terminology

These are the words used consistently across the UI and the code.

### Database

The **Database** is your entire local data file. It is stored in the browser's **IndexedDB** and holds everything:

- the **Campaign Archive** (all recorded campaigns),
- your **players** and **play groups**,
- your **profile widget settings** (layout + scope).

The Database is *not* just your campaigns — it is the whole document. In code it is the `DatabaseDocument` (`src/lib/database/document.ts`), held in memory by the reactive `databaseStore` (`src/lib/database/database.svelte.ts`).

Because IndexedDB can be evicted by the browser, the only durable backup is the file you export: a compressed **`.arkhamlife`** file (Manage Database, or Archive → Import / Export).

### Campaign Archive

The **Campaign Archive** is the set of recorded campaigns inside the Database (route `/archive`; `CampaignRecord[]`). Each campaign holds its metadata, participants, decks, and recorded log entries.

### Players, You, Other Players, Play Group, Guest

Every person is identified by a stable **UID** (`XXX-XXX-XXX`).

- **You** — the Database owner (`doc.owner`).
- **Other Players** — additional players you manage and record on behalf of (`doc.players`). You and your Other Players make up your **roster**.
- **Play Group** — a named bundle of players with its own combined profile (`doc.playGroups`).
- **Guest** — someone who isn't in your roster, frozen into a campaign as a baked snapshot (name + portrait + UID). Guests are derived, not stored as a flag: the same shared campaign yields a different guest set in each person's Database. A roster member always shows live (rename once, update everywhere); a guest stays frozen.

A **single campaign** can be handed to another player with "Export this campaign" — a self-contained file with every participant baked in (`src/lib/database/campaign-share.ts`).

### Profile

A **Profile** is the rendered, computed view of a *subject* — the whole account, one player, or one play group — at `/p/private/[uid]`. It is built from the Database, never edited directly.

- **Pane** — a page within a profile. The hierarchy is `home → { campaigns → campaign detail, cards → card-class detail, investigators → investigator-class detail }` (`PaneId`).
- **Widget** — one customizable unit placed on a pane (e.g. Campaign Clear Grid, Calendar, Achievements, Player Cards Usage, Most Used Investigators, **Win/Loss Record**). The full catalogue is in `src/lib/campaign/profile-widgets.ts`; each user's per-pane layout is the `ProfileSettings` document in `src/lib/campaign/profile-settings.ts`. Widgets are reordered/hidden per pane; the global `ownedProducts` + `trackedTiers` scope decides what counts (unearned slots are "blanks"), and a widget may override that scope.
- **Win/Loss Record** — the widget showing a lifetime win / loss / special / in-progress tally per campaign family.

### Compiled Profile

The **Compiled Profile** is a precomputed, render-ready JSON snapshot of a profile — everything the profile pages draw from, already aggregated. You can export it from Manage Database for inspection or reuse; deploying a public copy is the planned use ("Deployed (coming soon)" on the profile list).

A per-subject precompute **cache** (`src/lib/database/profile-cache.ts`) keeps profiles fast; it is derived data and is stripped from exported `.arkhamlife` files (rebuilt on import).

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/new` | Create a Database |
| `/archive`, `/archive/new`, `/archive/edit`, `/archive/import-export` | The Campaign Archive |
| `/players` | Manage You, Other Players, and Play Groups |
| `/p` | List of profiles (you, players, play groups) |
| `/p/private/[uid]` | A profile — `home` / `campaigns` / `cards` / `investigators`, each with a `customize` editor |
| `/database/manage` | Back up, restore, or delete the Database; advanced JSON exports |
| `/settings` | Account-wide profile settings (owned products, tracked tiers, defaults) |
| `/guide` | How arkham.life works |

---

## Source layout

```
src/
├── lib/
│   ├── database/      # The Database: document model, reactive store, IndexedDB
│   │                  # persistence, .arkhamlife export/backup, UIDs, single-campaign
│   │                  # share, and the profile builder + precompute cache.
│   ├── campaign/      # Campaign analysis: recorded-state codec, clear status,
│   │                  # achievements, collections, investigators, ownership, and the
│   │                  # profile widget catalogue + settings.
│   ├── profile/       # Shared, framework-free profile type shapes + helpers.
│   ├── paraglide/     # GENERATED Paraglide output (gitignored; see Localization).
│   └── components/
│       └── profile/   # Profile rendering, foldered to mirror the nav hierarchy
│                      # (see "Profile components & localization" below).
└── routes/            # SvelteKit routes (see table above).
```

---

## Profile components & localization

### Component folders mirror the navigation tree

Everything under `src/lib/components/profile/` is organized by the **navigation level** a
component belongs to, so a widget's folder tells you where it appears — and matches the message
namespace it pulls strings from:

```
components/profile/
  _framework/     # the ProfileWidgets renderer, widget-registry glue, layout/scope editors (infra)
  _primitives/    # generic, prop-driven UI with no domain: WidgetFrame, WidgetTable,
                  #   StatNumbers, LitTileGrid, TokenCoinRow
  home/           # Home pane: HomeSection + its aggregate widgets (clear grid, calendar, …)
  campaigns/      # Campaigns (overall): index, win/loss, all-achievements, deaths & insanities
    campaign/     # one Campaign (shared): overview, resolution coverage, achievements,
                  #   scenario XP, special interactions, ResolutionChips, …
      tsk/  eote/  ptc/  tcu/  tdc/     # campaign-specific widgets, by family
  cards/    class/         # Player Cards (overall, then per class)
  investigators/  class/   # Investigators (overall, then per class)
```

Rules of thumb when adding a component:

- A widget is locked to one nav level → it lives in that level's folder.
- Generic, domain-free UI → `_primitives/` (prop-driven, no own copy).
- Campaign-domain but cross-family (e.g. `ResolutionChips` — resolutions only exist for
  campaigns) → `campaigns/campaign/`. Family-specific → `campaigns/campaign/<family>/`.
- The widget catalogue + `widgetLabel()`/`widgetTitle()` live in
  `src/lib/campaign/profile-widgets.ts`; `ProfileWidgets.svelte` (in `_framework/`) dispatches
  every widget id to its component.

### Localization (Paraglide / inlang)

User-facing English in the profile layer is authored as **Paraglide messages**, not hardcoded.
Setup: `@inlang/paraglide-js` v2, `project.inlang/`, the Vite plugin compiles
`messages/**` → `src/lib/paraglide/` (gitignored, regenerated on dev/build; `yarn paraglide-compile`
to force). Source locale only today (`languageTags: ['en']`); everything is *translatable*, with
other locales a future fill-in.

**Message namespaces mirror the same nav tree** — `messages/profile/{shared, framework, home,
campaigns, campaigns/campaign, campaigns/campaign/<family>, cards, cards/class, investigators,
investigators/class}/{lang}.json` — each declared in `project.inlang/settings.json` `pathPattern`.

- **Key naming:** path-mirrored, greppable prefix + component + thing, e.g. `home_calendar_undated`,
  `campaign_tsk_routes_recent`, `campaign_eote_member_killed`, `framework_label_tsk_routes`.
  Keys are globally unique; repeating English across components is fine and preferred over sharing.
- **Usage:** `import * as m from '$lib/paraglide/messages.js'` then `m.key()` / `m.key({ count, tier })`.
- **Plurals / enums** use inlang **variants** (one phrase = one message), e.g.
  `m.campaign_eote_member_killed({ count })` with a `countPlural` selector, or `shared_difficulty`
  selecting on `tier`. See `messages/profile/shared/en.json` for the canonical patterns.
- **`shared` is the only cross-cutting namespace** — exactly the output of the cross-cutting helper
  *functions*: `difficulty.ts` (`difficultyLabel`/`difficultyAbbr`), `plural.ts` (`times`),
  `resolutions.ts` (`resolutionLabel`/`resolutionShort`), and class names. Call those helpers rather
  than re-authoring difficulty/plural/resolution/class strings.
- **Package-sourced strings are NOT localized here** (marked `// i18n: package-sourced` at call
  sites): anything resolved at render time from `@5argon/arkham-campaign-data`
  (`getCampaignLog(...).en.*`: scenario/resolution/ending/achievement/choice/collection names &
  text) or `@5argon/arkham-tsk-solver` (scenario reference title/location/key/version labels). Those
  packages own their own translations.

**Adding a new campaign widget** → `campaigns/campaign/<family>/Foo.svelte` +
`messages/profile/campaigns/campaign/<family>/en.json` keyed `campaign_<family>_foo_*`, registered in
`profile-widgets.ts` and dispatched in `ProfileWidgets.svelte`.

---

## Persistence & backup

- **IndexedDB** is the always-on, crash-safe working copy (`IndexedDbAdapter`). The storage seam is `PersistenceAdapter` (`src/lib/database/persistence.ts`).
- **Backup** = export the whole Database to a `.arkhamlife` file and keep it somewhere safe. Importing one **replaces** the Database in this browser.
- **Share** = export a single campaign and hand the file to another player; they import it as a new campaign.

---

## Preloading (instant in-session navigation)

Because the whole `DatabaseDocument` is read into memory **once** on startup, page-to-page
navigation never re-fetches data — the only thing not yet downloaded when you land somewhere is
the **route code** for pages you haven't visited. The **preloader**
(`src/lib/preload/preloader.svelte.ts`) proactively imports those chunks (`preloadCode` from
`$app/navigation`) for the section you just entered, so wandering around it stays instant **for
the current session**. The unit of work is the route *code chunk*, not per-entity data — e.g.
`/archive/edit` is one shared chunk for every campaign, and a profile's panes all share one
compiled payload built once via `getProfilePayload(uid)`.

It is triggered from `onMount` at three entry points (never a reactive `$effect`):

- **Home** (`routes/+page.svelte`) → warms the home-grid destinations.
- **Archive** (`routes/archive/+page.svelte`) → warms the editor + new/import.
- **Any profile pane** (`routes/p/private/[uid]/+layout.svelte`) → warms the whole subject
  subtree and builds its payload once.

> **Adding a new page? Check the predicted href sets in `preloader.svelte.ts`.** If a new route
> belongs to a section users reach next, add its concrete path to that section's list so it gets
> warmed: the `'home'` / `'archive'` lists in `warmSection`, or the profile subtree in
> `warmProfile` (including `CARD_SUBPAGES`). For a **dynamic** route (`[class]`, `[campaign]`),
> warm **one** representative concrete href — it loads the shared chunk for all of them; don't
> enumerate every instance. Forgetting this isn't a bug (the page still loads on demand), you just
> miss the instant-nav optimization.

A slim debug readout (`src/lib/components/PreloadProgressBar.svelte`) shows progress as a
**count of resolved `preloadCode` calls** (SvelteKit exposes no byte progress). It is gated behind
`{#if dev}` in the root layout — visible only under `yarn dev`, tree-shaken from production.

This is an **in-session** optimization only: it does **not** survive a hard reload / revisit with
no network (that needs a service worker — not yet implemented), and card **images** still come
from the CDN, so they only appear if previously loaded.

---

## Development

```bash
yarn dev          # start the dev server
yarn build        # production build
yarn check        # type-check (svelte-check)
yarn test         # unit tests (vitest)
```

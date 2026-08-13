# arkham-suite

A monorepository that makes up 2 sites: https://arkham-starter.com and https://arkham.life. They are fansite of Arkham Horror : The Card Game.

- arkham-starter.com : Static site of easier game's information access.
- arkham.life : Finished campaign archival service. See your lifetime play stats compiled from archived campaigns. (Not being made yet.)

Both are SvelteKit site using Svelte 5.

## Machine Setup

Works on macOS and Windows. Everything below is the same on both.

### Required tools

| Tool | Why | Install |
| --- | --- | --- |
| Node 22+ | Everything | nodejs.org, or `winget install OpenJS.NodeJS.LTS` |
| Yarn 4 | The package manager for the whole monorepo | `corepack enable` (the `packageManager` field pins the version) |
| `bun` | `string`'s `import` script, and `publint` inside `icon`'s `package` step shells out to `bun pm pack` | `npm i -g bun` |
| `deno` | Every script under `cards-json/scripts`, `tags/script`, `starter/deno`, and `icon/tool` | `npm i -g deno` |

Optional, only for `starter`'s `screenshot:setup` script and the Playwright suites:

- `yarn workspace @5argon/arkham-starter playwright install chromium`. The browser
  build is pinned to the Playwright version, so a Chromium already on the machine
  from some other project usually will not match.

Optional, only for the card-image pipeline in `cards-json`:

- `rclone`, configured with an `r2ahlcg:` remote pointing at the `arkham-card-images`
  R2 bucket — needed by `yarn sync` only.
- A `pack/` folder pulled from
  [arkhamdb-json-data](https://github.com/Kamalisk/arkhamdb-json-data) — it is
  gitignored, so it has to be placed there by hand.

### First run on a new machine

```sh
cp starter/.env.example starter/.env   # PUBLIC_CARD_CDN_URL
yarn setup
```

`yarn setup` = `yarn install` + `yarn generate` + `yarn build`, and `yarn generate`
produces everything that is gitignored but required before anything type-checks:

1. `yarn generate:paraglide` — Paraglide message functions for `string`, `ui`,
   `starter` and `life`. Nothing compiles before this.
2. `yarn generate:svelte-kit` — `svelte-kit sync` in `icon`, `ui`, `life` and
   `starter`. Their `tsconfig.json` files extend `./.svelte-kit/tsconfig.json`, so
   this has to exist first.
3. `yarn generate:icon` — `icon`'s `dist/` via svelte-package. `ui` and `starter`
   import `@5argon/arkham-icon` from `dist/`, so without it they report dozens of
   "Cannot find module '@5argon/arkham-icon'" errors.

Then `yarn build` (`tsc -b`) builds the `dist/` of the pre-built packages.

### Checking your work

- `yarn build` at the root — all pre-built packages, and type-checks `life` and
  `starter` through project references. Expected to be clean.
- `yarn workspace @5argon/arkham-starter check` — svelte-check on the site. Expected
  to be clean apart from `<slot>`-deprecation warnings.
- `yarn workspace @5argon/arkham-collection test` — the only real test suite (45 tests).

### Yarn and Deno share one `node_modules`

The root `deno.json` sets `nodeModulesDir: "none"` on purpose. With the previous
`"auto"`, any `deno` command run from a directory inside the repo replaced Yarn's
`node_modules` with Deno's own `node_modules/.deno` layout plus symlinks — so
dependency versions came from Deno's resolver instead of `yarn.lock`, and a plain
`yarn install` did not undo it (Yarn's install state still looked current, so the
symlinks into `.deno` survived; only `rm -rf node_modules && yarn install` repaired
it). With `"none"`, Deno resolves `npm:` specifiers from its own global cache and
leaves `node_modules` alone. Don't switch it back.

### Notes for Windows

- Line endings are pinned to LF by `.gitattributes`. Git for Windows sets
  `core.autocrlf=true` in its system config, so without that file a Windows checkout
  gets CRLF everywhere. `git status` hides it (the same setting normalises on the way
  back in), but `prettier --check` defaults to `endOfLine: "lf"` and so reports every
  one of those files as unformatted — `yarn lint` is unusable in that state.
  A checkout made **before** `.gitattributes` existed keeps its CRLF; renormalise it
  once with:

  ```sh
  git rm --cached -r -q .
  git reset --hard
  ```

  Verify with `git ls-files --eol | grep -c w/crlf`, which should print `0`.
- On a ReFS volume, `git status` can report freshly-emitted files (the ones `tsc -b`
  rewrites) as modified even when the content is identical. `git diff` shows nothing
  for them; `git add <path>` clears the stale entry. Careful with the inverse too:
  the same stale cache can make `git diff -- <path>` print nothing for a file that
  *did* change. `git status --short` is the reliable signal.
- The Deno tooling had three places that split paths on `/` and so mis-parsed the
  host separator — `tags/script/generate-unions.ts` (it wrote imports like
  `"./tags/action\additional.ts/index.js"` into the union files),
  `tags/script/preprocess-tags.ts`, and `starter/deno/divider-static-script.ts`.
  All three are fixed; keep normalising with `replaceAll('\\', '/')` or `basename()`
  when adding more.

### Known-broken, unrelated to platform

- `yarn workspace @5argon/arkham-icon build` fails: `EncounterSetIcon.svelte`'s
  exhaustive `switch` does not cover 22 `EncounterSet` members that exist in `kohaku`
  (`EnthrallingEncore`, `ArcaneLock`, `ArkhamCh2`, `AshenPilgrims`, `BadWeather`,
  `Bystanders`, … `QueenOfAsh`). Use `yarn workspace @5argon/arkham-icon package`,
  which is what `yarn generate:icon` runs, until those icons exist.
- `cards-json`'s `process` task cannot start: `@deno/canvas`
  (`https://deno.land/x/canvas@v1.4.2`) fails to import under Deno 2.9 with
  `brotli error` — Deno cannot decode the brotli-encoded response deno.land serves for
  `src/lib.js`. Either vendor the module or move to a `jsr:`/`npm:` canvas.
  `deno check ./scripts/patch.ts` also reports 5 `Uint8Array` vs `ArrayBuffer`
  mismatches against the current `@jsquash/*` types; `deno run` does not type-check,
  so it still executes.
- `yarn workspace @5argon/arkham-starter test` exits 1 — `vitest.config.js` is there
  but the package has no test files.
- `yarn workspace @5argon/arkham-life-ui check` reports ~40 errors, all from
  `ui/tsconfig.json` setting `"paths": {}` — which enforces the no-`$lib` rule for
  `src/lib` but also stops `src/routes` (the component sandbox) from resolving its own
  `$lib` imports. The sandbox route `/button/Button` also 500s on a real Svelte bug
  (`snippet_without_render_tag` in `FaIcon`).
- `yarn workspace @5argon/arkham-life check` reports ~20 errors. `life` is not being
  worked on yet.

## Folder

- `life` : The `arkham.life` site. 
- `starter` : The `arkham-starter.com` site.
  - **Important**: The `starter` package uses Paraglide for translations. Message files are organized in `messages/{route}/{locale}.json` folders (common, about, campaign, card, deck, tool, etc.) with descriptive naming matching the route structure like `campaign_title`, `tool_runic_axe_title`, etc. After modifying any translation files, run `bun run paraglide-compile` in the `starter` directory to regenerate the message functions.
- `kohaku` : Common TypeScript symbols for shared usage between all packages to ensure compatibility and handle future refactors well. We can make sure when Fantasy Flight Games introduces something, making change in this package and compile would reveal problems across all packages if we use them properly.
- `string` : Translated strings of terms in the game for shared usage between all packages.
- `ui` : UI pieces for use in `life` and `starter`. It supports dark mode, and primary / secondary colors can be changed so `arkham.life` and `arkham-starter.com` has different theme yet share the same layout.
  - **Important**: The `ui` package uses Paraglide for translations. Message files are organized in `messages/{category}/{locale}.json` folders (basic, button, card, form, layout, navigation, typography) with descriptive naming like `card_deck_size`, `form_type_grouped`, etc. After modifying any translation files, run `bun run paraglide-compile` in the `ui` directory to regenerate the message functions.
  - **Critical Translation Rule**: All user-facing strings in the `ui` package MUST use Paraglide message functions imported from `'../paraglide/messages.js'`. Never hardcode English or any language strings directly in components. This is essential because:
    - The `ui` package is a shared library used by multiple sites that need different language support
    - Game terminology translations are in the separate `string` package (`@5argon/arkham-string`), but UI element strings (buttons, labels, controls) belong in the `ui` package's Paraglide system
    - Example: `label="Square Grid"` ❌ WRONG → `label={m.button_square_grid()}` ✅ CORRECT
    - Always import with: `import * as m from '../paraglide/messages.js';`
  - **Critical Import Rule**: The `ui` package MUST NOT use `$lib` imports. Since this package exports source files for hot-reload by consuming packages, all internal imports must use relative paths (e.g., `'../layout/Modal.svelte'`, `'./card-item.js'`). Using `$lib` breaks Vite hot-reload in `starter` and `life` packages.
- `icon` : Icons for this game presented as Svelte components.

## Package Build System

This monorepo uses different build strategies for different packages:

### Hot-Reload Packages (Export Source Files)
- **`ui`**: Exports source TypeScript/Svelte files directly (`./src/lib/index.ts`). Changes to `ui` are instantly hot-reloaded in `starter` and `life` without needing a build step.
  - **No build command** - the package is consumed directly from source
  - **Validation**: Use `yarn check` or `bun run check` to validate TypeScript changes
  - **Paraglide changes**: After modifying translation files in `messages/`, run `bun run paraglide-compile` before the changes are hot-reloaded

### Pre-built Packages (Export from dist/)
- **`kohaku`**: TypeScript package that exports compiled JavaScript from `dist/` folder
  - **Build required**: Run `npm run build` or `bun run build` (runs `tsc -b`) after making changes
  - Changes are NOT hot-reloaded - consuming packages only see the compiled output
  
- **`string`**: Translated game terminology package that exports from `dist/` folder
  - **Build required**: Run `npm run build` or `bun run build` (runs `tsc -b`) after making changes
  - **Paraglide changes**: Run `bun run paraglide` before building if translation files were modified
  - Changes are NOT hot-reloaded - consuming packages only see the compiled output

**Why the difference?** The `ui` package contains Svelte components that need to be processed by the consuming project's Vite pipeline anyway, so it exports source files. The `kohaku` and `string` packages are pure TypeScript/JavaScript utilities that are more stable and can be pre-compiled for better performance and compatibility.

## Svelte Rules

- **`svelte/require-each-key`**: Every `{#each}` block MUST have a key expression: `{#each items as item (item.id)}`. Never write `{#each items as item}` without a key. Use a stable unique property (`id`, `code`, `href`, etc.) or the item itself if it is a primitive.

## Workflow

## Current Progress

Before proceeding to `life` site, what I'd like to do is to make `starter` using UI components from `ui` as much as possible, along with porting its UI that it created so in the future `life` could use them as well.

Currently `starter` is doing its own thing, and even import some pieces from `legacy-ui` which I want to remove ASAP.

How the `ui` package works is that it expects all the projects using it to have the same `static` folder content. Theme can be customized by "primary" and "secondary" color that the UI pieces are using via Tailwind. The `life` site would be green/yellow but `starter` site would be `purple-brown`. Both should support light and dark mode, via ways demonstrated in `SbToolbar.svelte`.
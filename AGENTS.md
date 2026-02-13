# arkham-suite

A monorepository that makes up 2 sites: https://arkham-starter.com and https://arkham.life. They are fansite of Arkham Horror : The Card Game.

- arkham-starter.com : Static site of easier game's information access.
- arkham.life : Finished campaign archival service. See your lifetime play stats compiled from archived campaigns. (Not being made yet.)

Both are SvelteKit site using Svelte 5.

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

## Workflow

## Current Progress

Before proceeding to `life` site, what I'd like to do is to make `starter` using UI components from `ui` as much as possible, along with porting its UI that it created so in the future `life` could use them as well.

Currently `starter` is doing its own thing, and even import some pieces from `legacy-ui` which I want to remove ASAP.

How the `ui` package works is that it expects all the projects using it to have the same `static` folder content. Theme can be customized by "primary" and "secondary" color that the UI pieces are using via Tailwind. The `life` site would be green/yellow but `starter` site would be `purple-brown`. Both should support light and dark mode, via ways demonstrated in `SbToolbar.svelte`.
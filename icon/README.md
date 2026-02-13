# @5argon/arkham-icon

A Svelte 5 component library providing icons and visual elements for Arkham Horror: The Card Game, designed for use in the arkham-suite monorepo.

## Overview

This package exports Svelte components representing various game icons, symbols, and visual elements used throughout the Arkham Horror LCG. It's primarily consumed by the `ui` package and other packages in the monorepo.

## Package Structure

### Individual Icons (`/individual/svelte/`)

Hundreds of individual Svelte icon components representing:
- Game symbols (Willpower, Intellect, Combat, Agility, etc.)
- Chaos tokens (Elder Sign, Auto Fail, Skull, Cultist, etc.)
- Product expansions (Core Set, Dunwich Legacy, etc.)
- Encounter sets and campaign elements
- Investigator-specific icons
- Card type icons

### Central Utilities (`/central/`)

Higher-level components that use types from `@5argon/arkham-kohaku` to automatically select the correct icon:

- **`ProductIcon`**: Given a `Product` enum from kohaku, displays the corresponding product/expansion icon

### Entry Points

- **Main export** (`index.ts`): Exports central utilities like `ProductIcon`
- **Game export** (`game.ts`): Exports commonly-used game symbols like `Health` and `Sanity`

## Usage

```typescript
import { ProductIcon } from '@5argon/arkham-icon';
import { Product } from '@5argon/arkham-kohaku';

// Use ProductIcon with kohaku's Product enum
<ProductIcon product={Product.CoreSet} />
```

```typescript
import { Health, Sanity } from '@5argon/arkham-icon/game';

// Use individual game icons
<Health />
<Sanity />
```

## Development

Start the development server:

```bash
yarn dev
```

The dev server includes a showcase page at `src/routes/+page.svelte` for previewing icons.

## Building

Build the package with TypeScript type checking:

```bash
yarn build
```

This runs `svelte-check` to ensure type safety before building. The build will fail if there are any TypeScript errors.

Run type checking only:

```bash
yarn check
```

## Icon Generation

Icons are generated from SVG files using a Deno script:

```bash
yarn generate
```

This processes SVG files in `tool/svg/` and generates Svelte components in `src/lib/individual/svelte/`.

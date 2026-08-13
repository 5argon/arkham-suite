# arkham-suite

This is a monorepo for https://arkham-starter.com (already online) and https://arkham.life (campaign archival site, experimenting) which is facilitated by Yarn workspaces.

## Getting started

Needs Node 22+, Yarn 4 (`corepack enable`), plus `bun` and `deno` on `PATH`.

```sh
cp starter/.env.example starter/.env
yarn setup
yarn workspace @5argon/arkham-starter dev
```

`yarn setup` installs, generates the Paraglide messages / `svelte-kit sync` output /
`icon`'s `dist` that the repo does not track, then builds. See
[AGENTS.md](./AGENTS.md) for the per-package detail and the known-broken list.

## SvelteKit Site Packages

- `/starter` : `@5argon/arkham-starter`
- `/life` : `@5argon/arkham-life`

## Helper Packages

- `/ui` : `@5argon/arkham-life-ui` : UI pieces intended to be shared between my two sites. Running SvelteKit dev on this package also works as a Storybook-like component development sandbox.
- `/cards-json` : `@5argon/cards-json` : Toolings to prepare `cards.json` which is a database of all cards in the game.

## Modular Packages

- `/string` : `@5argon/arkham-string` : Package of strings related to the game, each term made with Paraglide.
- `/icon` : `@5argon/arkham-icon` : Icon components made from [ArkhamCards' icomoon project](https://github.com/zzorba/ArkhamCards/blob/master/assets/icomoon/project.json).
- `/kohaku` : `@5argon/arkham-kohaku` : Definitions of many things of the game that all packages depends on.

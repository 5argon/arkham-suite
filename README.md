# arkham-suite

This is a monorepo for https://arkham-starter.com (already online) and https://arkham.life (campaign archival site, experimenting) which is facilitated by Yarn workspaces.

## SvelteKit Site Packages

- `/starter` : `@5argon/arkham-starter`
- `/life` : `@5argon/arkham-life`

## SvelteKit Helper Package

- `/ui` : `@5argon/arkham-life-ui` : UI pieces intended to be shared between my two sites. Running SvelteKit dev on this package also works as a Storybook-like component development sandbox.

## Modular Packages

- `/string` : `@5argon/arkham-string` : Package of strings related to the game, each term made with Paraglide.
- `/icon` : `@5argon/arkham-icon` : Icon components made from [ArkhamCards' icomoon project](https://github.com/zzorba/ArkhamCards/blob/master/assets/icomoon/project.json).
- `/kohaku` : `@5argon/arkham-kohaku` : Definitions of many things of the game that all packages depends on.

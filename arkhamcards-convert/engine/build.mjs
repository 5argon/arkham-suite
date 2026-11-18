/**
 * Bundles the campaign guide engine of the ArkhamCards app (from a local clone) into
 * `engine/dist/engine.mjs`, runnable in Node.
 *
 * The clone's path aliases (`@data/…`, `@lib/…`) resolve into the clone. Bare imports of the
 * packages the engine's logic uses (lodash, stable, deep-equal, ttag) resolve from this package's
 * dependencies. Every other package (React Native, React, Apollo, Expo, Firebase…) becomes one inert
 * stand-in: the engine files import app modules that use them, but processing a campaign never runs
 * that code.
 *
 * Usage: node engine/build.mjs [<ArkhamCards clone>]   (default ~/Documents/ArkhamCards)
 */
import { build } from 'esbuild';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const clone = resolve(
	process.argv[2] ?? process.env.ARKHAMCARDS_DIR ?? join(homedir(), 'Documents', 'ArkhamCards')
);
if (!existsSync(join(clone, 'src/data/scenario/CampaignGuide.ts'))) {
	throw new Error(`${clone} is not an ArkhamCards clone (no src/data/scenario/CampaignGuide.ts).`);
}

/** The clone's tsconfig `paths`, longest prefix first so `@app_constants` wins over `@app`. */
const ALIASES = [
	['@app_constants', 'src/app_constants'],
	['@navigation', 'src/navigation'],
	['@components', 'src/components'],
	['@generated', 'src/generated'],
	['@reducers', 'src/reducers'],
	['@actions', 'src/actions'],
	['@assets', 'assets'],
	['@styles', 'src/styles'],
	['@icons', 'src/icons'],
	['@data', 'src/data'],
	['@lib', 'src/lib'],
	['@app', 'src/application']
];

/** Packages bundled for real; everything else is stood in for. */
const REAL_PACKAGES = new Set(['lodash', 'stable', 'deep-equal', 'ttag']);

/** Platform files first, as the React Native bundler resolves them. */
const EXTENSIONS = ['.ios.tsx', '.ios.ts', '.native.tsx', '.native.ts', '.tsx', '.ts', '.js', '.json'];

function isFile(path) {
	return existsSync(path) && statSync(path).isFile();
}

/** A module path inside the clone, with the extension or index file the bundler would pick. */
function resolveInClone(base) {
	if (isFile(base)) return base;
	for (const ext of EXTENSIONS) if (isFile(base + ext)) return base + ext;
	for (const ext of EXTENSIONS) if (isFile(join(base, 'index' + ext))) return join(base, 'index' + ext);
	return null;
}

/**
 * Answers every property read, call and `new` with itself, so app code can load without running.
 * Its prototype answers every name too: esbuild's import wrapper copies a module's own properties
 * onto an object made from the module's prototype, and named imports read from that object.
 */
const STAND_IN = `
const read = (prop) => {
	if (prop === '__esModule' || prop === 'then' || prop === Symbol.iterator) return undefined;
	if (prop === Symbol.toPrimitive) return () => '';
	if (prop === 'prototype') return {};
	return standIn;
};
const everyName = new Proxy({}, { get: (_target, prop) => read(prop) });
const standIn = new Proxy(function standIn() {}, {
	get: (_target, prop) => read(prop),
	getPrototypeOf: () => everyName,
	apply: () => standIn,
	construct: () => standIn
});
module.exports = standIn;
`;

const cloneModules = {
	name: 'arkhamcards-clone',
	setup(b) {
		b.onResolve({ filter: /^@[a-z_]+(\/.*)?$/ }, (args) => {
			const match = ALIASES.find(
				([alias]) => args.path === alias || args.path.startsWith(alias + '/')
			);
			if (!match) return undefined;
			const [alias, target] = match;
			const path = resolveInClone(join(clone, target + args.path.slice(alias.length)));
			if (!path) return { errors: [{ text: `Cannot resolve ${args.path} in the clone` }] };
			return { path };
		});
		b.onResolve({ filter: /^[^./]/ }, (args) => {
			const name = args.path.startsWith('@')
				? args.path.split('/').slice(0, 2).join('/')
				: args.path.split('/')[0];
			if (REAL_PACKAGES.has(name)) return undefined;
			return { path: args.path, namespace: 'stand-in' };
		});
		b.onLoad({ filter: /.*/, namespace: 'stand-in' }, () => ({ contents: STAND_IN, loader: 'js' }));
	}
};

const assetLoaders = Object.fromEntries(
	['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ttf', '.otf', '.mp3', '.wav', '.db', '.txt'].map(
		(ext) => [ext, 'empty']
	)
);

const result = await build({
	entryPoints: [join(here, 'entry.ts')],
	outfile: join(here, 'dist', 'engine.mjs'),
	bundle: true,
	format: 'esm',
	platform: 'node',
	target: 'node22',
	tsconfig: join(here, 'tsconfig.engine.json'),
	resolveExtensions: EXTENSIONS,
	nodePaths: [join(here, '..', 'node_modules'), join(here, '..', '..', 'node_modules')],
	loader: assetLoaders,
	define: { __DEV__: 'false' },
	plugins: [cloneModules],
	logLevel: 'warning',
	metafile: true
});

const inputs = Object.keys(result.metafile.inputs);
const fromClone = inputs.filter((p) => !p.startsWith('stand-in:') && !p.includes('node_modules'));
const standIns = [...new Set(inputs.filter((p) => p.startsWith('stand-in:')).map((p) => p.slice(9)))];
console.log(`Bundled ${fromClone.length} clone files; ${standIns.length} packages stood in for.`);
console.log(`Wrote ${join(here, 'dist', 'engine.mjs')}`);

// arkham.life's document operations and log codec, with `$lib` resolved into life/src/lib and the
// workspace packages (@5argon/*) from their built dists.
const lifeLib = join(here, '..', '..', 'life', 'src', 'lib');
const lifeModules = {
	name: 'life-lib',
	setup(b) {
		b.onResolve({ filter: /^\$lib(\/.*)?$/ }, (args) => {
			const path = resolveInClone(join(lifeLib, args.path.slice('$lib'.length)));
			if (!path) return { errors: [{ text: `Cannot resolve ${args.path} in life/src/lib` }] };
			return { path };
		});
	}
};
for (const [entry, out] of [
	['life-entry.ts', 'life.mjs'],
	['life-check-entry.ts', 'life-check.mjs']
]) {
await build({
	entryPoints: [join(here, entry)],
	outfile: join(here, 'dist', out),
	bundle: true,
	format: 'esm',
	platform: 'node',
	target: 'node22',
	tsconfig: join(here, 'tsconfig.engine.json'),
	nodePaths: [join(here, '..', '..', 'node_modules')],
	plugins: [lifeModules],
	logLevel: 'warning'
});
console.log(`Wrote ${join(here, 'dist', out)}`);
}

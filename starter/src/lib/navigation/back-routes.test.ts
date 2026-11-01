import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { backRoutes } from './back-routes';

const srcDirectory = join(process.cwd(), 'src');
const routesDirectory = join(srcDirectory, 'routes');

function filesIn(directory: string): string[] {
	return readdirSync(directory, { recursive: true, encoding: 'utf8' }).map((file) =>
		join(directory, file)
	);
}

const pageRoutes = filesIn(routesDirectory)
	.filter((file) => file.endsWith('+page.svelte'))
	.map((file) => '/' + relative(routesDirectory, file).replace(/\/?\+page\.svelte$/, ''))
	.sort();

const data = {
	author: { name: 'Author' },
	backName: 'Named Page',
	entry: { primary: { name: 'Deck' } },
	team: { name: 'Team' }
};

describe('back routes', () => {
	it('has a hand-written back label and parent for exactly the pages of the site', () => {
		expect(pageRoutes.length).toBeGreaterThan(0);
		expect(Object.keys(backRoutes).sort()).toEqual(pageRoutes);
	});

	it('names every page', () => {
		for (const [route, entry] of Object.entries(backRoutes)) {
			expect(entry?.label(data), route).toMatch(/\S/);
		}
	});

	it('only leaves home without a parent, and every parent is a page needing no data to name', () => {
		for (const [route, entry] of Object.entries(backRoutes)) {
			if (route === '/') {
				expect(entry?.parent).toBeNull();
				continue;
			}
			const parent = backRoutes[entry!.parent!];
			expect(parent, route).toBeDefined();
			expect(parent!.label({}), route).toMatch(/\S/);
		}
	});
});

describe('back button', () => {
	it('keeps the table light, since it loads on every page', () => {
		const source = readFileSync(join(srcDirectory, 'lib/navigation/back-routes.ts'), 'utf8');
		expect(source).not.toMatch(/^import (?!type)[^\n]*@5argon/m);
	});

	it('is only rendered by the root layout, so no page has its own', () => {
		const offenders = filesIn(srcDirectory)
			.filter((file) => file.endsWith('.svelte') && !file.endsWith('PageBackButton.svelte'))
			.filter((file) => /<BackButton\b|icon=\{FaIconType\.Back\}/.test(readFileSync(file, 'utf8')))
			.map((file) => relative(srcDirectory, file));
		expect(offenders).toEqual([]);
	});
});

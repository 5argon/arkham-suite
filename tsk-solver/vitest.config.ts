import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Solver runs are CPU-bound (state-space search); allow generous per-test time.
		testTimeout: 30000,
		// Each solve runs several bounded searches (incl. constructive high-count padding). Cap parallel
		// forks and give each a roomy heap so concurrent solve-heavy suites don't exhaust memory. (The
		// browser worker only ever runs ONE solve at a time, so this is purely a test-harness concern.)
		pool: 'forks',
		poolOptions: { forks: { maxForks: 3, minForks: 1, execArgv: ['--max-old-space-size=3072'] } }
	},
	// Allow importing source `.js` specifiers (NodeNext style) that resolve to `.ts` siblings.
	resolve: {
		extensions: ['.ts', '.js', '.json']
	}
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Solver runs are CPU-bound (state-space search); allow generous per-test time.
		testTimeout: 30000
	},
	// Allow importing source `.js` specifiers (NodeNext style) that resolve to `.ts` siblings.
	resolve: {
		extensions: ['.ts', '.js', '.json']
	}
});

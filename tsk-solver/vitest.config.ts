import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// The manual plan simulator is synchronous and cheap (no state-space search), so the old
		// fork/heap limits are no longer needed — defaults are fine.
		testTimeout: 15000
	},
	// Allow importing source `.js` specifiers (NodeNext style) that resolve to `.ts` siblings.
	resolve: {
		extensions: ['.ts', '.js', '.json']
	}
});

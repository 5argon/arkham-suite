import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_CARD_CDN_URL: {
		public: true,
		static: true,
		description: 'Base URL of the card image CDN.'
	},
	DATABASE_URL: {
		schema: (value) => value,
		description: 'Postgres connection string for the server database.'
	}
});

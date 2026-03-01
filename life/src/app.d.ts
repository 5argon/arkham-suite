/// <reference types="@sveltejs/kit" />
/// <reference types="@cloudflare/workers-types" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {}

	interface Platform {
		env: Record<string, never>;
		cf?: Record<string, unknown>;
		ctx: ExecutionContext;
	}
}

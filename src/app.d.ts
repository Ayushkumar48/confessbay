// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { resolve } from '$app/paths';
declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}
	}
	type ResolvedUrl = ReturnType<typeof resolve>;
	// interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};

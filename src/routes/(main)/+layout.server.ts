import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.user) {
		redirect(308, resolve('/login'));
	}
	return {
		user: locals.user
	};
}

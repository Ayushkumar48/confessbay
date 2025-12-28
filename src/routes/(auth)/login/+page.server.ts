import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export async function load({ locals }) {
	if (locals.user) redirect(308, resolve('/feed'));
}

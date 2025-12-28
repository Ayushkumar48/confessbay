import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load = async ({ locals }) => {
	if (locals.user) redirect(308, resolve('/feed'));
};

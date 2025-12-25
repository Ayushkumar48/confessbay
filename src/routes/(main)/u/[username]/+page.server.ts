import { redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (locals.user?.username === params.username) {
		redirect(308, '/profile');
	}
}

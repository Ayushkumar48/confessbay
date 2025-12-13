import { redirect } from '@sveltejs/kit';
import { getConversations } from './data.remote';
import { resolve } from '$app/paths';

export const load = async ({ locals }) => {
	if (!locals.user) redirect(308, resolve('/login'));
	const conversations = await getConversations({ userId: locals.user.id });
	return { conversations };
};

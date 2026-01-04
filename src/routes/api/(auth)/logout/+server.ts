import { deleteSessionTokenCookie } from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { logout } from '../../../(auth)/login/data.remote';

export async function POST(event) {
	const sessionId = await event.request.json();
	await logout(sessionId);
	deleteSessionTokenCookie(event);

	return json({
		success: true
	});
}

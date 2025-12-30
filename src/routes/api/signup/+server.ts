import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { json, error } from '@sveltejs/kit';
import { signup } from '../../(auth)/signup/date.remote.js';

export async function POST(event) {
	const userData = await event.request.json();
	const res = await signup(userData);
	if (!res.userId) {
		console.error(res.message);
		throw error(400, 'Error while creating account');
	}
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, res.userId);
	setSessionTokenCookie(event, sessionToken, session.expiresAt, true);

	return json({ success: true, user: res.user });
}

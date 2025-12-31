import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import { login } from '../../(auth)/login/data.remote.js';

export async function POST(event) {
	const userData = await event.request.json();
	const res = await login(userData);

	if (!res.userId) {
		return json({ message: res.message }, { status: 400 });
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, res.userId);

	setSessionTokenCookie(event, sessionToken, session.expiresAt, true);

	return json({
		success: true
	});
}

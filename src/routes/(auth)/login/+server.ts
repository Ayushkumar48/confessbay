import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export async function POST(event) {
	const { userId } = await event.request.json();
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
}

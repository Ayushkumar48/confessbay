import { sessionCookieName, validateSessionTokenCore } from '../src/lib/server/auth-core';
import type { Socket, ExtendedError } from 'socket.io';

export async function middleware(socket: Socket, next: (err?: ExtendedError) => void) {
	try {
		const raw = socket.handshake.headers.cookie || '';
		const cookies = Object.fromEntries(raw.split(';').map((v) => v.trim().split('=')));
		const sessionToken = cookies[sessionCookieName];
		if (!sessionToken) {
			return next(new Error('No session cookie'));
		}
		const user = await validateSessionTokenCore(sessionToken);
		if (!user?.userId) return next(new Error('Invalid session'));
		socket.data.userId = user.userId;
		next();
	} catch (err: unknown) {
		console.error(err);
		next(new Error('Authentication failed'));
	}
}

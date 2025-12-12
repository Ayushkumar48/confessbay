import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { db } from './db/core';
import * as table from './db/schema';
import { eq } from 'drizzle-orm';

export const sessionCookieName = 'auth-session';

export async function validateSessionTokenCore(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [result] = await db
		.select({
			user: {
				id: table.user.id
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) return null;
	if (Date.now() >= result.session.expiresAt.getTime()) {
		await db.delete(table.session).where(eq(table.session.id, result.session.id));
		return null;
	}

	return { userId: result.user.id };
}

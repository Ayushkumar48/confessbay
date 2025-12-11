import { user } from '$lib/shared';
import { eq } from 'drizzle-orm';
import { db } from './db';

export async function getOtherUser(friendUsername?: string, userId?: string) {
	if (userId) {
		const [otherUser] = await db.select().from(user).where(eq(user.id, userId));
		return otherUser;
	}
	if (friendUsername) {
		const [otherUser] = await db.select().from(user).where(eq(user.username, friendUsername));
		return otherUser;
	}
	return null;
}

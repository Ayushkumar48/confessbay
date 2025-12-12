import { user } from '$lib/shared';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { getSvgUrl } from './auth';

export async function getOtherUser(friendUsername?: string, userId?: string) {
	if (userId) {
		const [otherUser] = await db.select().from(user).where(eq(user.id, userId));
		const avatarUrl = await getSvgUrl(otherUser?.avatar);
		return { ...otherUser, avatar: avatarUrl };
	}
	if (friendUsername) {
		const [otherUser] = await db.select().from(user).where(eq(user.username, friendUsername));
		const avatarUrl = await getSvgUrl(otherUser?.avatar);
		return { ...otherUser, avatar: avatarUrl };
	}
	return null;
}

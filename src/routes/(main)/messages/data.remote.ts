import { query } from '$app/server';
import { db } from '$lib/server/db';
import { conversations, user } from '$lib/shared';
import { and, desc, eq, or } from 'drizzle-orm';
import z from 'zod';

export const getConversations = query(z.object({ userId: z.string() }), async ({ userId }) => {
	const convs = await db
		.select({
			conversation: conversations,
			otherUser: user
		})
		.from(conversations)
		.where(or(eq(conversations.userId1, userId), eq(conversations.userId2, userId)))
		.innerJoin(
			user,
			or(
				and(eq(conversations.userId1, userId), eq(conversations.userId2, user.id)),
				and(eq(conversations.userId2, userId), eq(conversations.userId1, user.id))
			)
		)
		.orderBy(desc(conversations.lastMessageAt), desc(conversations.updatedAt));
	return convs;
});

import { query } from '$app/server';
import { getSvgUrl } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { decryptMessage } from '$lib/server/encryption-utils';
import { chats, conversations, user } from '$lib/shared';
import { and, desc, eq, or } from 'drizzle-orm';
import z from 'zod';

export const getConversations = query(z.object({ userId: z.string() }), async ({ userId }) => {
	const convs = await db
		.select({
			conversation: conversations,
			lastMessage: chats,
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
		.leftJoin(chats, eq(conversations.lastMessageId, chats.id))
		.orderBy(desc(chats.createdAt), desc(conversations.updatedAt));

	const withAvatars = await Promise.all(
		convs.map(async (c) => {
			const avatar = await getSvgUrl(c.otherUser.avatar);
			let lastMessage;
			if (c.lastMessage) {
				lastMessage = decryptMessage(
					c.lastMessage.message,
					c.lastMessage.iv,
					c.lastMessage.authTag
				);
			}
			return {
				...c,
				otherUser: {
					...c.otherUser,
					avatar
				},
				lastMessage: { ...c.lastMessage, message: lastMessage }
			};
		})
	);
	console.log(withAvatars);
	return withAvatars;
});

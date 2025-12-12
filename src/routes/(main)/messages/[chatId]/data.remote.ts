import { getRequestEvent, query } from '$app/server';
import { chatsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { decryptMessage } from '$lib/server/encryption-utils';
import { getOtherUser } from '$lib/server/utils';
import { chats, conversations } from '$lib/shared';
import { and, asc, eq } from 'drizzle-orm';
import z from 'zod';

export const getConversation = query(
	z.object({
		userId1: z.string().optional(),
		userId2: z.string().optional(),
		chatId: z.string().optional()
	}),
	async (input) => {
		const { userId1, userId2, chatId } = input;
		if (chatId) {
			const [conversation] = await db
				.select()
				.from(conversations)
				.where(eq(conversations.id, chatId));
			if (!conversation)
				return {
					success: false,
					message: 'Conversation not found'
				};
			return {
				success: true,
				message: 'Conversation retrieved successfully',
				conversation
			};
		}
		if (!userId1 || !userId2) {
			return {
				success: false,
				message: 'User IDs are required'
			};
		}
		const smaller = userId1 < userId2 ? userId1 : userId2;
		const larger = userId1 < userId2 ? userId2 : userId1;

		const [conversation] = await db
			.select()
			.from(conversations)
			.where(and(eq(conversations.userId1, smaller), eq(conversations.userId2, larger)))
			.limit(1);
		if (!conversation) {
			return {
				success: false,
				message: 'Conversation not found'
			};
		}
		return {
			success: true,
			message: 'Conversation retrieved successfully',
			conversation: conversation
		};
	}
);

export const getConversationForChat = query(
	z.object({
		userId1: z.string().optional(),
		userId2: z.string().optional(),
		chatId: z.string().optional()
	}),
	async (input) => {
		const { locals } = getRequestEvent();
		const res = await getConversation({ ...input });
		if (!res.success || !res.conversation) {
			return {
				success: false,
				message: 'Conversation not found',
				conversation: null,
				currentChatUser: null
			};
		}
		const otherUserId =
			res.conversation.userId1 === locals.user?.id
				? res.conversation.userId2
				: res.conversation.userId1;
		const currentChatUser = await getOtherUser(undefined, otherUserId);
		if (!currentChatUser)
			return {
				success: false,
				message: 'User not found',
				conversation: null,
				currentChatUser: null
			};
		return { success: true, conversation: res.conversation, currentChatUser };
	}
);

export const storeChat = query(chatsInsertSchema, async (input) => {
	await db.insert(chats).values(input);
});

export const getMessagesWithChatId = query(z.object({ chatId: z.string() }), async (input) => {
	return (
		await db
			.select()
			.from(chats)
			.where(eq(chats.conversationId, input.chatId))
			.orderBy(asc(chats.createdAt))
			.limit(40)
	).map((m) => ({ ...m, message: decryptMessage(m.message, m.iv, m.authTag) }));
});

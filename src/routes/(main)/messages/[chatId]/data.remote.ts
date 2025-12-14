import { getRequestEvent, query } from '$app/server';
import { chatsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { decryptMessage } from '$lib/server/encryption-utils';
import { isOnline } from '$lib/server/dragonfly/presence';
import { getOtherUser } from '$lib/server/utils';
import { chats, conversations } from '$lib/shared';
import { and, desc, eq } from 'drizzle-orm';
import z from 'zod';
import { alias } from 'drizzle-orm/pg-core';

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
				currentChatUser: null,
				isUserOnline: false
			};
		const isUserOnline = await isOnline(otherUserId);
		return { success: true, conversation: res.conversation, currentChatUser, isUserOnline };
	}
);

export const storeChat = query(chatsInsertSchema, async (input) => {
	await db.insert(chats).values(input);
});

export const getMessagesWithChatId = query(z.object({ chatId: z.string() }), async (input) => {
	const reply = alias(chats, 'reply');
	const rows = await db
		.select({
			message: chats,
			reply: reply
		})
		.from(chats)
		.leftJoin(reply, eq(chats.repliedTo, reply.id))
		.where(eq(chats.conversationId, input.chatId))
		.orderBy(desc(chats.createdAt))
		.limit(40);

	const decrypted = await Promise.all(
		rows.map(async (row) => {
			const m = row.message;
			const r = row.reply;

			let decryptedMessage = null;
			if (m.chatMessageType === 'text') {
				decryptedMessage = decryptMessage(m.message, m.iv, m.authTag);
			}

			let decryptedReply = null;

			if (r && r.chatMessageType === 'text' && r.message) {
				decryptedReply = decryptMessage(r.message, r.iv, r.authTag);
			}

			return {
				...m,
				message: decryptedMessage,
				reply: r
					? {
							...r,
							message: decryptedReply
						}
					: null
			};
		})
	);

	return decrypted.reverse();
});

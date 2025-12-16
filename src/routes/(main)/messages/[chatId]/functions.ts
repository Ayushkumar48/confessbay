import { getRequestEvent } from '$app/server';
import type { ChatsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { isOnline } from '$lib/server/dragonfly/presence';
import { decryptMessage } from '$lib/server/encryption-utils';
import { getOtherUser } from '$lib/server/utils';
import { chats, conversations, user } from '$lib/shared';
import { and, desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type z from 'zod';

type LocalU = {
	userId1?: string;
	userId2?: string;
	chatId?: string;
};

type LocalU2 = { messageId: string; deleterId: string; senderId: string };
export async function getConversationFn({ userId1, userId2, chatId }: LocalU) {
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

export async function getConversationForChatFn(input: LocalU) {
	const { locals } = getRequestEvent();
	const res = await getConversationFn({ ...input });
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

export async function storeChatFn(input: z.infer<ChatsInsertSchema>) {
	await db.insert(chats).values(input);
}

export async function getMessagesWithChatIdFn({ chatId }: { chatId: string }) {
	{
		const reply = alias(chats, 'reply');
		const replySender = alias(user, 'replySender');
		const rows = await db
			.select({
				message: chats,
				reply: reply,
				replySender: {
					id: replySender.id,
					firstName: replySender.firstName,
					lastName: replySender.lastName
				}
			})
			.from(chats)
			.leftJoin(reply, eq(chats.repliedTo, reply.id))
			.leftJoin(replySender, eq(reply.senderId, replySender.id))
			.where(eq(chats.conversationId, chatId))
			.orderBy(desc(chats.createdAt))
			.limit(40);

		const decrypted = await Promise.all(
			rows.map(async (row) => {
				const m = row.message;
				const r = row.reply;
				const s = row.replySender;

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
								message: decryptedReply,
								sender: s
							}
						: null
				};
			})
		);

		return decrypted.reverse();
	}
}

export async function deleteMessageFn({ messageId, deleterId, senderId }: LocalU2) {
	if (deleterId === senderId) {
		await db
			.update(chats)
			.set({
				isDeletedBySender: true,
				updatedAt: new Date()
			})
			.where(eq(chats.id, messageId));
	} else {
		await db
			.update(chats)
			.set({
				isDeletedByReceiver: true,
				updatedAt: new Date()
			})
			.where(eq(chats.id, messageId));
	}
}

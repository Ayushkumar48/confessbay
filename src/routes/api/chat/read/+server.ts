import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chats, conversations } from '$lib/shared';
import { eq, and, inArray, isNull } from 'drizzle-orm';
import { z } from 'zod';

const markAsReadSchema = z.object({
	chatId: z.string(),
	messageIds: z.array(z.string()),
	userId: z.string()
});

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { chatId, messageIds, userId } = markAsReadSchema.parse(body);

		if (messageIds.length === 0) {
			return json({ success: false, error: 'No message IDs provided' }, { status: 400 });
		}

		// Get the conversation to determine which user is reading
		const [conversation] = await db
			.select()
			.from(conversations)
			.where(eq(conversations.id, chatId))
			.limit(1);

		if (!conversation) {
			return json({ success: false, error: 'Conversation not found' }, { status: 404 });
		}

		const now = new Date();

		// Update messages as read (only if not already read and not sent by the reading user)
		await db
			.update(chats)
			.set({
				readAt: now,
				updatedAt: now
			})
			.where(
				and(
					eq(chats.conversationId, chatId),
					inArray(chats.id, messageIds),
					isNull(chats.readAt) // Only update if not already read
				)
			);

		// Recalculate actual unread count for the user who read the messages
		const isUser1 = conversation.userId1 === userId;

		// Count remaining unread messages
		const unreadMessages = await db
			.select({ count: chats.id })
			.from(chats)
			.where(
				and(
					eq(chats.conversationId, chatId),
					eq(chats.senderId, isUser1 ? conversation.userId2 : conversation.userId1),
					isNull(chats.readAt)
				)
			);

		const actualUnreadCount = unreadMessages.length;

		// Update with actual count
		if (isUser1) {
			await db
				.update(conversations)
				.set({
					unreadCountForUser1: actualUnreadCount
				})
				.where(eq(conversations.id, chatId));
		} else {
			await db
				.update(conversations)
				.set({
					unreadCountForUser2: actualUnreadCount
				})
				.where(eq(conversations.id, chatId));
		}

		return json({
			success: true,
			markedCount: messageIds.length,
			unreadCount: actualUnreadCount
		});
	} catch (err) {
		console.error('Error marking messages as read:', err);
		return json({ success: false, error: 'Failed to mark messages as read' }, { status: 500 });
	}
}

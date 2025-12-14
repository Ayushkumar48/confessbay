import { json } from '@sveltejs/kit';
import { chatsInsertSchema, conversationsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { chats, conversations, user } from '$lib/shared';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { decryptMessage } from '$lib/server/encryption-utils';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const msg = chatsInsertSchema.parse(body);
		await db.insert(chats).values(msg);
		await db
			.update(conversations)
			.set({
				lastMessageId: msg.id
			})
			.where(eq(conversations.id, msg.conversationId));

		if (msg.repliedTo) {
			const replySender = alias(user, 'replySender');

			const [replyData] = await db
				.select({
					reply: chats,
					replySender: {
						id: replySender.id,
						firstName: replySender.firstName,
						lastName: replySender.lastName
					}
				})
				.from(chats)
				.leftJoin(replySender, eq(chats.senderId, replySender.id))
				.where(eq(chats.id, msg.repliedTo));

			let replyObject = null;
			if (replyData) {
				const r = replyData.reply;
				const s = replyData.replySender;

				let decryptedReply = null;
				if (r && r.chatMessageType === 'text' && r.message) {
					decryptedReply = decryptMessage(r.message, r.iv, r.authTag);
				}

				replyObject = r
					? {
							...r,
							message: decryptedReply,
							sender: s
						}
					: null;
			}

			const enrichedMessage = {
				...msg,
				reply: replyObject
			};

			console.log('API returning enriched message:', JSON.stringify(enrichedMessage, null, 2));
			return json(enrichedMessage);
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error storing chat:', err);
		return json({ success: false, error: 'Failed to store message' }, { status: 500 });
	}
}

export async function PATCH({ request }) {
	try {
		const body = await request.json();
		const conversation = conversationsInsertSchema.parse(body);
		await db
			.update(conversations)
			.set({
				...conversation
			})
			.where(eq(conversations.id, conversation.id));
		return json({ success: true });
	} catch (err) {
		console.error('Error updating chat:', err);
		return json({ success: false, error: 'Failed to update message' }, { status: 500 });
	}
}

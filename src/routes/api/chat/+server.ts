import { json } from '@sveltejs/kit';
import { chatsInsertSchema, conversationsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { chats, conversations } from '$lib/shared';
import { eq } from 'drizzle-orm';

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

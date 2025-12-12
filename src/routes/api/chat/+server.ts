import { json } from '@sveltejs/kit';
import { chatsInsertSchema } from '$lib/client/schema';
import { db } from '$lib/server/db';
import { chats } from '$lib/shared';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const msg = chatsInsertSchema.parse(body);

		await db.insert(chats).values(msg);
		return json({ success: true });
	} catch (err) {
		console.error('Error storing chat:', err);
		return json({ success: false, error: 'Failed to store message' }, { status: 500 });
	}
}

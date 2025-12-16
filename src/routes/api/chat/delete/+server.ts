import { json } from '@sveltejs/kit';
import { deleteMessage } from '../../../(main)/messages/[chatId]/data.remote';

export async function POST({ request }) {
	try {
		const { messageId, deleterId, senderId, userId } = await request.json();

		if (!messageId || !deleterId || !senderId) {
			return json({ success: false, message: 'Missing required fields' }, { status: 400 });
		}

		if (deleterId !== userId) {
			return json(
				{ success: false, message: 'Unauthorized to delete this message' },
				{ status: 403 }
			);
		}

		await deleteMessage({ messageId, deleterId, senderId });

		return json({ success: true, message: 'Message deleted successfully' });
	} catch (error) {
		console.error('Error deleting message:', error);
		return json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}

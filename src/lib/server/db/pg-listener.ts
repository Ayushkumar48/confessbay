import { Client, type Notification } from 'pg';
import type { Server as SocketIOServer } from 'socket.io';

export interface ConversationUnreadChangedEvent {
	conversationId: string;
	userId1: string;
	userId2: string;
	unreadCountUser1: number;
	unreadCountUser2: number;
	updatedAt: string; // ISO timestamp
}

export async function startPgListener(io: SocketIOServer): Promise<void> {
	const client = new Client({
		connectionString: process.env.DATABASE_URL
	});

	await client.connect();
	await client.query('LISTEN conversation_unread_changed');

	client.on('notification', (msg: Notification) => {
		if (!msg.payload) return;

		let data: ConversationUnreadChangedEvent;

		try {
			data = JSON.parse(msg.payload) as ConversationUnreadChangedEvent;
		} catch (err) {
			console.error('Invalid PG payload', err);
			return;
		}

		io.to(data.userId1).emit('unread:update', {
			conversationId: data.conversationId,
			unreadCount: data.unreadCountUser1
		});

		io.to(data.userId2).emit('unread:update', {
			conversationId: data.conversationId,
			unreadCount: data.unreadCountUser2
		});
	});

	client.on('error', (err) => {
		console.error('Postgres LISTEN error', err);
		process.exit(1);
	});
}

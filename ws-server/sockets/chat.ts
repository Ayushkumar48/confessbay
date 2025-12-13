import type { Conversation } from '../../src/lib/shared';
import type { Socket, Server } from 'socket.io';

export function chatStats(io: Server, socket: Socket) {
	return async (data: { conversation: Conversation; action?: string }) => {
		const isBroadcastAction = data.action === 'block' || data.action === 'unblock';
		if (isBroadcastAction) {
			io.to(data.conversation.id).emit('chat-stats', data.conversation);
		} else {
			socket.emit('chat-stats', data.conversation);
		}
		await fetch('http://localhost:5173/api/chat', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data.conversation)
		});
	};
}

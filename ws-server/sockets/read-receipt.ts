import type { Socket, Server } from 'socket.io';

export function markMessagesAsRead(io: Server, socket: Socket) {
	return async ({ chatId, messageIds }: { chatId: string; messageIds: string[] }) => {
		const userId = socket.data.userId;

		if (!chatId || !messageIds || messageIds.length === 0) {
			return;
		}

		try {
			const response = await fetch('http://localhost:5173/api/chat/read', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chatId,
					messageIds,
					userId
				})
			});

			if (response.ok) {
				io.to(chatId).emit('messages:read', {
					messageIds,
					readBy: userId,
					readAt: new Date().toISOString()
				});
			} else {
				console.error('Error marking messages as read:', response.statusText);
			}
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	};
}

import { encryptMessage } from '../../src/lib/server/encryption-utils';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { Socket, Server } from 'socket.io';

export function sendMessage(io: Server, socket: Socket) {
	return async ({
		chatId,
		message,
		replyTo
	}: {
		chatId: string;
		message: string;
		replyTo?: string | null;
	}) => {
		const userId = socket.data.userId;
		const date = new Date();
		const { encrypted, iv, authTag } = encryptMessage(message);
		const messageId = encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15)));

		const value = {
			id: messageId,
			senderId: userId,
			conversationId: chatId,
			message: encrypted,
			iv,
			authTag,
			chatMessageType: 'text',
			deliveredAt: date.toISOString(),
			isDeleted: false,
			repliedTo: replyTo || null,
			createdAt: date.toISOString(),
			updatedAt: date.toISOString()
		};

		if (replyTo) {
			try {
				const response = await fetch('http://localhost:5173/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(value)
				});

				if (response.ok) {
					const savedMessage = await response.json();
					const emittedMessage = {
						...savedMessage,
						message: message
					};
					io.to(chatId).emit('message', emittedMessage);
				} else {
					console.error('Error saving message to database:', response.statusText);
					io.to(chatId).emit('message', {
						...value,
						message: message
					});
				}
			} catch (error) {
				console.error('Error saving message to database:', error);
				io.to(chatId).emit('message', {
					...value,
					message: message
				});
			}
		} else {
			io.to(chatId).emit('message', {
				...value,
				message: message
			});

			fetch('http://localhost:5173/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(value)
			}).catch((error) => {
				console.error('Error saving message to database:', error);
			});
		}
	};
}

export function deleteMessage(io: Server, socket: Socket) {
	return async ({
		chatId,
		messageId,
		senderId,
		userId
	}: {
		chatId: string;
		messageId: string;
		senderId: string;
		userId: string;
	}) => {
		const deleterId = socket.data.userId;

		try {
			const response = await fetch('http://localhost:5173/api/chat/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messageId,
					deleterId,
					senderId,
					userId
				})
			});

			if (response.ok) {
				io.to(chatId).emit('message:deleted', {
					messageId,
					deleterId,
					senderId
				});
			} else {
				console.error('Error deleting message from database:', response.statusText);
				socket.emit('message:delete:error', {
					messageId,
					error: 'Failed to delete message'
				});
			}
		} catch (error) {
			console.error('Error deleting message from database:', error);
			socket.emit('message:delete:error', {
				messageId,
				error: 'Failed to delete message'
			});
		}
	};
}

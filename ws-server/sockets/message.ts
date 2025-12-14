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

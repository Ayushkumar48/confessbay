import { encryptMessage } from '../../src/lib/server/encryption-utils';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { Socket, Server } from 'socket.io';

export function sendMessage(io: Server, socket: Socket) {
	return async ({ chatId, message }: { chatId: string; message: string }) => {
		const userId = socket.data.userId;
		const date = new Date();
		const { encrypted, iv, authTag } = encryptMessage(message);
		const value = {
			id: encodeBase32LowerCase(crypto.getRandomValues(new Uint8Array(15))),
			senderId: userId,
			conversationId: chatId,
			message: encrypted,
			iv,
			authTag,
			chatmessageType: 'text',
			deliveredAt: date.toISOString(),
			isDeleted: false,
			createdAt: date.toISOString(),
			updatedAt: date.toISOString()
		};
		io.to(chatId).emit('message', { ...value, message: message });
		await fetch('http://localhost:5173/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(value)
		});
	};
}

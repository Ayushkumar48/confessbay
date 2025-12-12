import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { sessionCookieName, validateSessionTokenCore } from '../src/lib/server/auth-core';
import { encryptMessage } from '../src/lib/server/encryption-utils';
import { encodeBase32LowerCase } from '@oslojs/encoding';
export default function injectSocketIO(server: HTTPServer) {
	const io = new Server(server, {
		cors: {
			origin: 'http://localhost:5173',
			credentials: true
		}
	});

	io.use(async (socket, next) => {
		try {
			// 1. Parse cookies from handshake
			const raw = socket.handshake.headers.cookie || '';
			const cookies = Object.fromEntries(raw.split(';').map((v) => v.trim().split('=')));
			const sessionToken = cookies[sessionCookieName];

			if (!sessionToken) {
				return next(new Error('No session cookie'));
			}

			// 2. Validate session using your existing function
			const user = await validateSessionTokenCore(sessionToken);

			if (!user?.userId) return next(new Error('Invalid session'));

			// 3. Store userId in socket data
			socket.data.userId = user.userId;

			next();
		} catch (err: unknown) {
			console.error(err);
			next(new Error('Authentication failed'));
		}
	});

	io.on('connection', (socket) => {
		const userId = socket.data.userId; // SAFE & VERIFIED

		// JOIN ROOM
		socket.on('join', (chatId) => {
			socket.join(chatId);
		});

		// HANDLE MESSAGES
		socket.on('message', async ({ chatId, message }: { chatId: string; message: string }) => {
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

			// BROADCAST
			io.to(chatId).emit('message', { ...value, message: message });

			// STORE IN DB
			await fetch('http://localhost:5173/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(value)
			});
		});
	});
}

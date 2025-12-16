import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { middleware } from './middleware';
import { sendMessage, deleteMessage } from './sockets/message';
import { chatStats, startTyping, stopTyping } from './sockets/chat';
import { markMessagesAsRead } from './sockets/read-receipt';
import { markOffline, markOnline, refreshOnline } from '../src/lib/server/dragonfly/presence';
import { startPgListener } from '../src/lib/server/db/pg-listener';

export default function injectSocketIO(server: HTTPServer) {
	const io = new Server(server, {
		cors: {
			origin: 'http://localhost:5173',
			credentials: true
		}
	});
	io.use(middleware);
	startPgListener(io);
	io.on('connection', (socket) => {
		const userId = socket.data.userId as string | undefined;
		if (!userId) {
			socket.disconnect(true);
			return;
		}
		socket.join(userId);
		markOnline(userId);
		socket.broadcast.emit('presence:online', { userId });
		const heartbeat = setInterval(() => {
			refreshOnline(userId);
		}, 30_000);

		socket.on('join', (chatId) => {
			socket.join(chatId);
		});
		socket.on('message', sendMessage(io, socket));
		socket.on('message:delete', deleteMessage(io, socket));
		socket.on('messages:read', markMessagesAsRead(io, socket));
		socket.on('chat-stats', chatStats(io, socket));
		socket.on('typing:start', startTyping(socket));
		socket.on('typing:stop', stopTyping(socket));
		socket.on('disconnect', async () => {
			clearInterval(heartbeat);
			await markOffline(userId);
			socket.broadcast.emit('presence:offline', { userId });

			for (const room of socket.rooms) {
				if (room !== socket.id) {
					socket.to(room).emit('typing:stop', {
						userId: socket.data.userId
					});
				}
			}
		});
	});
}

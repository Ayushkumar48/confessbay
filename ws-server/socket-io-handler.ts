import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { middleware } from './middleware';
import { sendMessage } from './sockets/message';
import { chatStats } from './sockets/chat';

export default function injectSocketIO(server: HTTPServer) {
	const io = new Server(server, {
		cors: {
			origin: 'http://localhost:5173',
			credentials: true
		}
	});
	io.use(middleware);
	io.on('connection', (socket) => {
		socket.on('join', (chatId) => {
			socket.join(chatId);
		});
		socket.on('message', sendMessage(io, socket));
		socket.on('chat-stats', chatStats(io, socket));
	});
}

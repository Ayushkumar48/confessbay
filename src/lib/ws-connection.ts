import ioClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:5173';

export function createSocket(chatId: string) {
	const socket = ioClient(ENDPOINT, {
		withCredentials: true
	});

	socket.on('connect', () => {
		socket.emit('join', chatId);
	});

	return socket;
}

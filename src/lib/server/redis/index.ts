import Redis from 'ioredis';

export const dragonfly = new Redis({
	host: '127.0.0.1',
	port: 6380
});

dragonfly.on('connect', () => {
	console.log('🟢 Redis connected');
});

dragonfly.on('error', (err) => {
	console.error('🔴 Redis error', err);
});

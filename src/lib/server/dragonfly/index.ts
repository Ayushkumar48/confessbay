import Redis from 'ioredis';
import { building } from '$app/environment';

let dragonfly: Redis | null = null;

if (!building) {
	dragonfly = new Redis({
		host: '127.0.0.1',
		port: 6380
	});

	dragonfly.on('connect', () => {
		console.log('🟢 Dragonfly connected');
	});

	dragonfly.on('error', (err) => {
		console.error('🔴 Dragonfly error', err);
	});
}

export { dragonfly };

import { dragonfly } from '.';

const TTL = 60; // seconds

export async function markOnline(userId: string) {
	await dragonfly.set(`user:online:${userId}`, '1', 'EX', TTL);
}

export async function refreshOnline(userId: string) {
	await dragonfly.set(`user:online:${userId}`, '1', 'EX', TTL);
}

export async function markOffline(userId: string) {
	await dragonfly.del(`user:online:${userId}`);
}

export async function isOnline(userId: string) {
	return (await dragonfly.exists(`user:online:${userId}`)) === 1;
}

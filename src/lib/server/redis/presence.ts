import { redis } from '.';

const TTL = 60; // seconds

export async function markOnline(userId: string) {
	await redis.set(`user:online:${userId}`, '1', 'EX', TTL);
}

export async function refreshOnline(userId: string) {
	await redis.expire(`user:online:${userId}`, TTL);
}

export async function markOffline(userId: string) {
	await redis.del(`user:online:${userId}`);
}

export async function isOnline(userId: string) {
	return (await redis.exists(`user:online:${userId}`)) === 1;
}

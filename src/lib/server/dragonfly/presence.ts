import { user } from '../db/schema';
import { dragonfly } from '.';
import { db } from '../db/core';
import { eq } from 'drizzle-orm';

const TTL = 60; // seconds

export async function markOnline(userId: string) {
	await dragonfly.set(`user:online:${userId}`, '1', 'EX', TTL);
}

export async function refreshOnline(userId: string) {
	await dragonfly.set(`user:online:${userId}`, '1', 'EX', TTL);
}

export async function markOffline(userId: string) {
	await Promise.all([
		dragonfly.del(`user:online:${userId}`),
		db
			.update(user)
			.set({
				lastSeenAt: new Date()
			})
			.where(eq(user.id, userId))
	]);
}

export async function isOnline(userId: string) {
	return (await dragonfly.exists(`user:online:${userId}`)) === 1;
}

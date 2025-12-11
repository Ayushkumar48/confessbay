import { query } from '$app/server';
import { user } from '$lib/shared';
import { eq, or } from 'drizzle-orm';
import { generateRandomAvatar, generateUserId } from '$lib/utils';
import { hash } from '@node-rs/argon2';
import { uploadSvg } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { userInsertSchema } from '$lib/client/schema';

export const signup = query(userInsertSchema, async (input) => {
	try {
		const [existingUser] = await db
			.select()
			.from(user)
			.where(
				or(
					eq(user.email, input.email),
					eq(user.username, input.username),
					eq(user.phoneNumber, input.phoneNumber || '')
				)
			);
		if (existingUser) {
			if (input?.phoneNumber && existingUser?.phoneNumber === input.phoneNumber) {
				return { success: false, message: 'Phone number already exists' };
			}
			if (existingUser?.email === input?.email || existingUser?.username === input?.username) {
				return { success: false, message: 'Email or Username already exists' };
			} else {
				return { success: false, message: 'User already exists' };
			}
		}
		const passwordHash = await hash(input.password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		let avatarKey = '';
		const userId = generateUserId();
		if (!input.avatar) {
			avatarKey = await uploadSvg(generateRandomAvatar(userId), userId);
		}
		const [newUser] = await db
			.insert(user)
			.values({
				...input,
				id: userId,
				avatar: avatarKey,
				password: passwordHash
			})
			.returning();
		return { success: true, message: 'Signup successful', user: newUser };
	} catch (error) {
		console.error(error);
		return { success: false, message: 'Signup failed, Internal Server Error' };
	}
});

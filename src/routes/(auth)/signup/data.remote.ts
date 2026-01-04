import { command } from '$app/server';
import { hash } from '@node-rs/argon2';
import { user } from '$lib/shared';
import { eq, or } from 'drizzle-orm';
import { generateRandomAvatar, generateUserId } from '$lib/utils';
import { uploadSvg } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { signupSchema } from '$lib/client/schema';

export const signup = command(signupSchema, async (input) => {
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
		const passwordHash = await hash(input.password as string, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		let avatarKey = '';
		const userId = generateUserId();
		if (!input.avatar) {
			avatarKey = await uploadSvg(await generateRandomAvatar(userId), userId);
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
		return {
			success: true,
			userId: newUser.id
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: 'Unable to create account, Internal Server Error' };
	}
});

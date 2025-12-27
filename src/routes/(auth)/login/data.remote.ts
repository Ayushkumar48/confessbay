import { query } from '$app/server';
import { verify } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { user } from '$lib/shared';
import { eq, or } from 'drizzle-orm';
import { userSelectSchema } from '$lib/client/schema';
import z from 'zod';
import { invalidateSession } from '$lib/server/auth';

export const login = query(userSelectSchema, async (input) => {
	try {
		const [existingUser] = await db
			.select()
			.from(user)
			.where(or(eq(user.email, input.username), eq(user.username, input.username)));
		if (!existingUser) {
			return { success: false, message: 'User not found' };
		}
		if (!existingUser.password) {
			return {
				success: false,
				message: 'This account is associated with Google.\nPlease login with Google.'
			};
		}
		const validPassword = await verify(existingUser.password, input.password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return { success: false, message: 'Incorrect username or password' };
		}
		return {
			success: true,
			message: 'Signup successful',
			user: { ...existingUser, password: null }
		};
	} catch (error) {
		console.error(error);
		return { success: false, message: 'Signup failed, Internal Server Error' };
	}
});

export const logout = query(z.string(), async (input) => {
	try {
		await invalidateSession(input);
		return { success: true, message: 'Logout successful' };
	} catch (error) {
		console.error(error);
		return { success: false, message: 'Logout failed, Internal Server Error' };
	}
});

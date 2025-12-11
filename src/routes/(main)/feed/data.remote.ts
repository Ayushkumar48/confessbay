import { query } from '$app/server';
import { db } from '$lib/server/db';
import {
	confessions,
	likes,
	replies,
	reports,
	user,
	type User,
	type UserLite
} from '$lib/server/db/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getSvgUrl } from '$lib/server/auth';
import z from 'zod';
import { confessionsInsertSchema, repliesInsertSchema } from '$lib/client/schema';
import { generateUserId } from '$lib/utils';

const userKey = (u?: User | UserLite) => {
	if (!u) return '';
	return 'id' in u && u.id ? `id:${u.id}` : `avatar:${String((u as UserLite).avatar ?? '')}`;
};

function isFullUser(u?: User | UserLite | null): u is User {
	if (!u) return false;
	return (
		typeof (u as User).email === 'string' &&
		typeof (u as User).createdAt !== 'undefined' &&
		typeof (u as User).city !== 'undefined'
	);
}

export const getConfessionPosts = query(
	z.object({
		userId: z.string().optional()
	}),
	async (input) => {
		try {
			const fromUser = alias(user, 'fromUser');
			const toUser = alias(user, 'toUser');
			const replyUser = alias(user, 'replyUser');

			const confessionsData = await db
				.select({
					confession: confessions,
					confessedFromUser: fromUser,
					confessedToUser: toUser
				})
				.from(confessions)
				.leftJoin(fromUser, eq(confessions.confessedFrom, fromUser.id))
				.leftJoin(toUser, eq(confessions.confessedTo, toUser.id))
				.orderBy(desc(confessions.lastUpdatedAt))
				.limit(20);

			if (!confessionsData || confessionsData.length === 0) {
				return [];
			}

			const confessionIds = confessionsData.map((c) => c.confession.id);
			const repliesPromise = db
				.select({
					reply: replies,
					user: {
						id: replyUser.id,
						firstName: replyUser.firstName,
						lastName: replyUser.lastName,
						username: replyUser.username,
						avatar: replyUser.avatar,
						anonymous: replyUser.anonymous
					}
				})
				.from(replies)
				.leftJoin(replyUser, eq(replies.userId, replyUser.id))
				.where(inArray(replies.confessionId, confessionIds));

			const reportsPromise = db
				.select()
				.from(reports)
				.where(inArray(reports.confessionId, confessionIds));

			const likesPromise = input.userId
				? db
						.select({ confessionId: likes.confessionId })
						.from(likes)
						.where(and(inArray(likes.confessionId, confessionIds), eq(likes.userId, input.userId)))
				: Promise.resolve([]);

			const [allReplies, allReports, userLikes] = await Promise.all([
				repliesPromise,
				reportsPromise,
				likesPromise
			]);
			const uniqueUserMap = new Map<string, User | UserLite>();
			for (const c of confessionsData) {
				if (c.confessedFromUser) {
					uniqueUserMap.set(userKey(c.confessedFromUser), c.confessedFromUser as User);
				}
				if (c.confessedToUser) {
					uniqueUserMap.set(userKey(c.confessedToUser), c.confessedToUser as User);
				}
			}
			for (const r of allReplies) {
				if (r.user) {
					const key = userKey(r.user);
					if (!uniqueUserMap.has(key)) {
						uniqueUserMap.set(key, r.user);
					}
				}
			}

			const avatarFetchPromises: Array<Promise<readonly [string, string]>> = [];
			for (const [key, u] of uniqueUserMap.entries()) {
				const avatar = (u as User | UserLite).avatar;
				if (avatar !== undefined && avatar !== null && avatar !== '') {
					avatarFetchPromises.push(getSvgUrl(avatar).then((url) => [key, url] as const));
				}
			}

			const avatarResults = await Promise.all(avatarFetchPromises);
			for (const [key, url] of avatarResults) {
				const u = uniqueUserMap.get(key);
				if (u) {
					u.avatar = url;
				}
			}

			const repliesByConfession = Object.groupBy(allReplies, (r) => r.reply.confessionId);
			const reportsByConfession = Object.groupBy(allReports, (r) => r.confessionId);

			const likedIds = new Set<string>(
				(userLikes ?? []).map((l: { confessionId: string }) => l.confessionId)
			);

			return confessionsData.map((c) => {
				const fromKey = c.confessedFromUser ? userKey(c.confessedFromUser) : '';
				const toKey = c.confessedToUser ? userKey(c.confessedToUser) : '';
				const maybeFrom = fromKey ? uniqueUserMap.get(fromKey) : undefined;
				const enrichedFrom =
					maybeFrom && isFullUser(maybeFrom) ? (maybeFrom as User) : c.confessedFromUser;

				const maybeTo = toKey ? uniqueUserMap.get(toKey) : undefined;
				const enrichedTo = maybeTo && isFullUser(maybeTo) ? (maybeTo as User) : c.confessedToUser;

				const repliesFor = (repliesByConfession[c.confession.id] ?? []).map((r) => {
					let replyUserObj = r.user;
					if (r.user) {
						const k = userKey(r.user);
						const mapped = uniqueUserMap.get(k);
						if (mapped) {
							replyUserObj = isFullUser(mapped) ? (mapped as User) : r.user;
						}
					}
					return {
						...r.reply,
						user: replyUserObj
					};
				});

				return {
					...c,
					confessedFromUser: enrichedFrom,
					confessedToUser: enrichedTo,
					replies: repliesFor,
					reports: reportsByConfession[c.confession.id] ?? [],
					currentUserLiked: likedIds.has(c.confession.id)
				};
			});
		} catch (error) {
			console.error(error);
			throw new Error('Failed to fetch confession posts');
		}
	}
);

export const newConfessionPost = query(
	confessionsInsertSchema.extend({
		userId: z.string().optional()
	}),
	async (input) => {
		try {
			const {
				confessedFrom,
				confessedTo,
				message,
				isAnonymous,
				category,
				visibility,
				repliesEnabled,
				userId
			} = input;
			const confessionId = generateUserId();
			await db.insert(confessions).values({
				id: confessionId,
				confessedFrom,
				confessedTo,
				message,
				isAnonymous,
				category,
				visibility,
				repliesEnabled
			});
			const fromUser = alias(user, 'fromUser');
			const toUser = alias(user, 'toUser');
			const [confession] = await db
				.select({
					confession: confessions,
					confessedFromUser: fromUser,
					confessedToUser: toUser
				})
				.from(confessions)
				.leftJoin(fromUser, eq(confessions.confessedFrom, fromUser.id))
				.leftJoin(toUser, eq(confessions.confessedTo, toUser.id))
				.where(eq(confessions.id, confessionId))
				.limit(1);
			if (confession.confessedFromUser) {
				confession.confessedFromUser.avatar = await getSvgUrl(confession.confessedFromUser.avatar);
			}
			if (!confession) throw new Error('Failed to fetch created confession');
			let currentUserLiked = false;
			if (userId) {
				const userLike = await db
					.select({ confessionId: likes.confessionId })
					.from(likes)
					.where(and(eq(likes.confessionId, confessionId), eq(likes.userId, userId)))
					.limit(1);

				currentUserLiked = userLike.length > 0;
			}
			const enrichedConfession = {
				...confession,
				replies: [],
				reports: [],
				currentUserLiked
			};
			return { success: true, confessionPost: enrichedConfession };
		} catch (error) {
			console.error(error);
			return { success: false, message: 'Posting confession failed!' };
		}
	}
);

export const likePost = query(
	z.object({
		userId: z.string().optional(),
		confessionId: z.string()
	}),
	async (input) => {
		if (!input.userId) {
			return { success: false, message: 'Please Login to like the post!' };
		}
		try {
			await db.transaction(async (tx) => {
				const existingLike = await tx
					.select()
					.from(likes)
					.where(and(eq(likes.userId, input.userId!), eq(likes.confessionId, input.confessionId)))
					.limit(1);
				if (existingLike.length > 0) {
					await tx
						.delete(likes)
						.where(
							and(eq(likes.userId, input.userId!), eq(likes.confessionId, input.confessionId))
						);
					await tx
						.update(confessions)
						.set({ likes: sql`${confessions.likes} - 1` })
						.where(eq(confessions.id, input.confessionId));
				} else {
					await tx.insert(likes).values({
						id: generateUserId(),
						userId: input.userId!,
						confessionId: input.confessionId
					});
					await tx
						.update(confessions)
						.set({ likes: sql`${confessions.likes} + 1` })
						.where(eq(confessions.id, input.confessionId));
				}
			});
			return { success: true, message: '' };
		} catch (err) {
			console.error(err);
			return { success: false, message: 'Posting confession failed!' };
		}
	}
);

export const newReply = query(repliesInsertSchema, async (input) => {
	try {
		const [reply] = await db.insert(replies).values(input).returning();
		const [replyUser] = await db
			.select({
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				avatar: user.avatar,
				anonymous: user.anonymous
			})
			.from(user)
			.where(eq(user.id, reply.userId));

		if (replyUser && replyUser.avatar !== undefined && replyUser.avatar !== null) {
			replyUser.avatar = await getSvgUrl(replyUser.avatar);
		}

		return { success: true, reply: { ...reply, user: replyUser }, message: '' };
	} catch (err) {
		console.error(err);
		return { success: false, reply: null, message: 'Error while replying the post!' };
	}
});

export const deleteReply = query(
	z.object({
		replyId: z.string()
	}),
	async (input) => {
		try {
			await db.delete(replies).where(eq(replies.id, input.replyId));
			return { success: true, message: '' };
		} catch (err) {
			console.error(err);
			return { success: false, message: 'Error while deleting reply!' };
		}
	}
);

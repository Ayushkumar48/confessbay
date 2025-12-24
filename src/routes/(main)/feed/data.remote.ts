import { query } from '$app/server';
import { db } from '$lib/server/db';
import {
	confessions,
	likes,
	replies,
	reports,
	user,
	type ConfessionWithToAndFrom,
	type ReplyWithUser,
	type User,
	type UserLite
} from '$lib/server/db/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getSvgUrl } from '$lib/server/auth';
import z from 'zod';
import { confessionsInsertSchema, repliesInsertSchema } from '$lib/client/schema';
import { generateUserId } from '$lib/utils';

export const getConfessionPosts = query(
	z.object({
		userId: z.string().optional()
	}),
	async (input): Promise<ConfessionWithToAndFrom[]> => {
		try {
			const fromUser = alias(user, 'fromUser');
			const toUser = alias(user, 'toUser');
			const replyUser = alias(user, 'replyUser');

			/* -------------------- 1. Confessions -------------------- */

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

			if (confessionsData.length === 0) return [];

			const confessionIds = confessionsData.map((c) => c.confession.id);

			/* -------------------- 2. Parallel queries -------------------- */

			const repliesPromise = db
				.select({
					confessionId: replies.confessionId,
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
				.select({
					confessionId: reports.confessionId,
					count: sql<number>`count(*)`
				})
				.from(reports)
				.where(inArray(reports.confessionId, confessionIds))
				.groupBy(reports.confessionId);

			const likesPromise = input.userId
				? db
						.select({ confessionId: likes.confessionId })
						.from(likes)
						.where(and(inArray(likes.confessionId, confessionIds), eq(likes.userId, input.userId)))
				: Promise.resolve([]);

			const [allReplies, reportCounts, userLikes] = await Promise.all([
				repliesPromise,
				reportsPromise,
				likesPromise
			]);

			/* -------------------- 3. Maps (typed) -------------------- */

			const repliesByConfession = new Map<string, ReplyWithUser[]>();

			for (const r of allReplies) {
				const list = repliesByConfession.get(r.confessionId) ?? [];
				list.push({
					...r.reply,
					user: r.user
				});
				repliesByConfession.set(r.confessionId, list);
			}

			const reportsByConfession = new Map<string, number>();
			for (const r of reportCounts) {
				reportsByConfession.set(r.confessionId, r.count);
			}

			const likedIds = new Set<string>(userLikes.map((l) => l.confessionId));

			/* -------------------- 4. User dedupe -------------------- */

			const userMap = new Map<string, User | UserLite>();

			for (const c of confessionsData) {
				if (c.confessedFromUser) userMap.set(c.confessedFromUser.id, c.confessedFromUser);
				if (c.confessedToUser) userMap.set(c.confessedToUser.id, c.confessedToUser);
			}

			for (const r of allReplies) {
				if (r.user) userMap.set(r.user.id, r.user);
			}

			/* -------------------- 5. Avatar resolve -------------------- */

			await Promise.all(
				Array.from(userMap.values())
					.filter((u): u is User | UserLite => Boolean(u.avatar))
					.map(async (u) => {
						u.avatar = await getSvgUrl(u.avatar!);
					})
			);

			/* -------------------- 6. Final shape -------------------- */

			return confessionsData.map((c) => ({
				confession: c.confession,
				confessedFromUser: c.confessedFromUser
					? (userMap.get(c.confessedFromUser.id) ?? null)
					: null,
				confessedToUser: c.confessedToUser ? (userMap.get(c.confessedToUser.id) ?? null) : null,
				replies: repliesByConfession.get(c.confession.id) ?? [],
				reportsCount: reportsByConfession.get(c.confession.id) ?? 0,
				currentUserLiked: likedIds.has(c.confession.id)
			}));
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

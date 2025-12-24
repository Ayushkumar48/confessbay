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
} from '$lib/shared';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import z from 'zod';
import { getSvgUrl } from '$lib/server/auth';
import { confessionCategory, visibility } from '$lib/shared/enums';

export const getConfessionPostsWithCategory = query(
	z.object({
		userId: z.string().optional(),
		category: z.enum(confessionCategory),
		visibility: z.enum(visibility).optional().nullable()
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
				.where(
					and(
						eq(confessions.category, input.category),
						input.visibility ? eq(confessions.visibility, input.visibility) : undefined
					)
				)
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

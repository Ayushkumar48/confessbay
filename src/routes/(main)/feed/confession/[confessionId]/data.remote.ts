import { query } from '$app/server';
import { getSvgUrl } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { confessions, likes, replies, reports, user } from '$lib/shared';
import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import z from 'zod';

export const getConfessionWithId = query(
	z.object({
		confessionId: z.string(),
		userId: z.string().optional()
	}),
	async (input) => {
		try {
			const fromUser = alias(user, 'fromUser');
			const toUser = alias(user, 'toUser');
			const replyUser = alias(user, 'replyUser');

			const [confession] = await db
				.select({
					confession: confessions,
					confessedFromUser: fromUser,
					confessedToUser: toUser
				})
				.from(confessions)
				.leftJoin(fromUser, eq(confessions.confessedFrom, fromUser.id))
				.leftJoin(toUser, eq(confessions.confessedTo, toUser.id))
				.where(eq(confessions.id, input.confessionId))
				.limit(1);

			if (!confession) throw new Error('Confession not found');

			const [allReplies, allReports] = await Promise.all([
				db
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
					.where(eq(replies.confessionId, input.confessionId)),

				db.select().from(reports).where(eq(reports.confessionId, input.confessionId))
			]);

			if (confession.confessedFromUser) {
				confession.confessedFromUser.avatar = await getSvgUrl(confession.confessedFromUser.avatar);
			}
			if (confession.confessedToUser) {
				confession.confessedToUser.avatar = await getSvgUrl(confession.confessedToUser.avatar);
			}
			for (const r of allReplies) {
				if (r.user && r.user.avatar !== undefined && r.user.avatar !== null) {
					r.user.avatar = await getSvgUrl(r.user.avatar);
				}
			}

			let currentUserLiked = false;
			if (input.userId) {
				const userLike = await db
					.select({ confessionId: likes.confessionId })
					.from(likes)
					.where(and(eq(likes.confessionId, input.confessionId), eq(likes.userId, input.userId)))
					.limit(1);
				currentUserLiked = userLike.length > 0;
			}

			return {
				...confession,
				replies: allReplies.map((r) => ({
					...r.reply,
					user: r.user
				})),
				reports: allReports,
				currentUserLiked
			};
		} catch (error) {
			console.error(error);
			throw new Error('Failed to fetch confession!');
		}
	}
);

import { query } from '$app/server';
import { getSvgUrl } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { getOtherUser, groupBy } from '$lib/server/utils';
import {
	confessions,
	followers,
	friends,
	likes,
	replies,
	reports,
	user,
	type ConfessionWithToAndFrom,
	type User,
	type UserLite
} from '$lib/shared';
import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import z from 'zod';

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

export const getMyConfessionPosts = query(
	z.object({
		userId: z.string()
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
				.where(
					or(eq(confessions.confessedFrom, input.userId), eq(confessions.confessedTo, input.userId))
				)
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

			const likesPromise = db
				.select({ confessionId: likes.confessionId })
				.from(likes)
				.where(and(inArray(likes.confessionId, confessionIds), eq(likes.userId, input.userId)));

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

			const repliesByConfession = groupBy(allReplies, (r) => r.reply.confessionId);
			const reportsByConfession = groupBy(allReports, (r) => r.confessionId);

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
			}) as unknown as ConfessionWithToAndFrom[];
		} catch (error) {
			console.error(error);
			throw new Error('Failed to fetch my confession posts!');
		}
	}
);

export const getUserFriends = query(
	z.object({ username: z.string(), currentUserId: z.string().optional() }),
	async (input) => {
		const { username } = input;

		const otherUser = await getOtherUser(username);
		if (!otherUser) {
			return { success: false, message: 'Requested user not found' };
		}
		const allFriends = await db
			.select({
				friends: friends,
				user: user
			})
			.from(friends)
			.innerJoin(
				user,
				or(
					and(eq(friends.userId1, otherUser.id), eq(user.id, friends.userId2)),
					and(eq(friends.userId2, otherUser.id), eq(user.id, friends.userId1))
				)
			);
		return { success: true, message: 'Friends retrieved successfully', friends: allFriends };
	}
);

export const getUserFollowers = query(z.object({ username: z.string() }), async (input) => {
	const { username } = input;

	const otherUser = await getOtherUser(username);
	if (!otherUser) {
		return { success: false, message: 'Requested user not found' };
	}
	const allFollowers = await db
		.select({ followers, user })
		.from(followers)
		.where(eq(followers.followingId, otherUser.id))
		.innerJoin(user, eq(followers.followerId, user.id));
	return {
		success: true,
		message: 'Followers retrieved successfully',
		followers: allFollowers
	};
});

export const getUserFollowings = query(z.object({ username: z.string() }), async (input) => {
	const { username } = input;

	const otherUser = await getOtherUser(username);
	if (!otherUser) {
		return { success: false, message: 'Requested user not found' };
	}
	const allFollowings = await db
		.select({ following: followers, user })
		.from(followers)
		.where(eq(followers.followerId, otherUser.id))
		.innerJoin(user, eq(followers.followingId, user.id));
	return {
		success: true,
		message: 'Following retrieved successfully',
		followings: allFollowings
	};
});

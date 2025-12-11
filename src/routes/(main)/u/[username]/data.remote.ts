import { query } from '$app/server';
import { colleges, conversations, followers, friends, user } from '$lib/shared';
import { and, eq, sql } from 'drizzle-orm';
import z from 'zod';
import { getSvgUrl } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { getOtherUser } from '$lib/server/utils';
import { generateUserId } from '$lib/utils';

export const getUserProfile = query(
	z.object({ username: z.string(), currentUserId: z.string().optional() }),
	async (input) => {
		try {
			const [existingUser] = await db.select().from(user).where(eq(user.username, input.username));
			if (!existingUser) {
				redirect(308, resolve('/feed'));
			}
			const [counts] = await db
				.select({
					friendsCount: sql<number>`
              (
                SELECT COUNT(*)
                FROM friends
                WHERE
                  (friends.user_id1 = ${existingUser.id} OR friends.user_id2 = ${existingUser.id})
                  AND friends.status = 'accepted'
              )
            `.as('friendsCount'),
					followersCount: sql<number>`
              (
                SELECT COUNT(*)
                FROM followers
                WHERE followers.following_id = ${existingUser.id}
              )
            `.as('followersCount'),
					followingsCount: sql<number>`
              (
                SELECT COUNT(*)
                FROM followers
                WHERE followers.follower_id = ${existingUser.id}
              )
            `.as('followingsCount')
				})
				.from(sql`(SELECT 1) as temp`);

			let collegeData = null;
			if (existingUser.collegeId) {
				const [college] = await db
					.select()
					.from(colleges)
					.where(eq(colleges.id, existingUser.collegeId));
				collegeData = college;
			}
			let isFollowing = false;
			let friendStatus: 'pending' | 'accepted' | 'rejected' | null = null;
			let friendshipRequestedBy: string | null = null;
			if (input.currentUserId) {
				const [followingRow] = await db
					.select()
					.from(followers)
					.where(
						and(
							eq(followers.followerId, input.currentUserId),
							eq(followers.followingId, existingUser.id)
						)
					);

				isFollowing = !!followingRow;
				const userA = input.currentUserId < existingUser.id ? input.currentUserId : existingUser.id;
				const userB = input.currentUserId < existingUser.id ? existingUser.id : input.currentUserId;

				const [friendship] = await db
					.select()
					.from(friends)
					.where(and(eq(friends.userId1, userA), eq(friends.userId2, userB)));

				if (friendship) {
					friendStatus = friendship.status;
					friendshipRequestedBy = friendship.requestedBy;
				}
			}
			existingUser.avatar = await getSvgUrl(existingUser.avatar);
			return {
				success: true,
				message: 'User found',
				user: {
					...existingUser,
					password: null,
					college: collegeData,
					...counts,
					isFollowing,
					friendStatus,
					friendshipRequestedBy
				}
			};
		} catch (error) {
			console.error(error);
			redirect(308, resolve('/feed'));
		}
	}
);
export const getFriendship = query(
	z.object({ userId1: z.string(), userId2: z.string() }),
	async (input) => {
		const { userId1, userId2 } = input;
		const smaller = userId1 < userId2 ? userId1 : userId2;
		const larger = userId1 < userId2 ? userId2 : userId1;

		const [friendship] = await db
			.select({ friendship: friends })
			.from(friends)
			.where(and(eq(friends.userId1, smaller), eq(friends.userId2, larger)))
			.limit(1);
		if (!friendship) {
			return {
				success: false,
				message: 'Friendship not found'
			};
		}
		return {
			success: true,
			message: 'Friendship retrieved successfully',
			friendship: friendship.friendship
		};
	}
);

export const getConversation = query(
	z.object({
		userId1: z.string().optional(),
		userId2: z.string().optional(),
		chatId: z.string().optional()
	}),
	async (input) => {
		const { userId1, userId2, chatId } = input;
		if (chatId) {
			const [conversation] = await db
				.select()
				.from(conversations)
				.where(eq(conversations.id, chatId));
			if (!conversation)
				return {
					success: false,
					message: 'Conversation not found'
				};
			return {
				success: true,
				message: 'Conversation retrieved successfully',
				conversation
			};
		}
		if (!userId1 || !userId2) {
			return {
				success: false,
				message: 'User IDs are required'
			};
		}
		const smaller = userId1 < userId2 ? userId1 : userId2;
		const larger = userId1 < userId2 ? userId2 : userId1;

		const [conversation] = await db
			.select()
			.from(conversations)
			.where(and(eq(conversations.userId1, smaller), eq(conversations.userId2, larger)))
			.limit(1);
		if (!conversation) {
			return {
				success: false,
				message: 'Conversation not found'
			};
		}
		return {
			success: true,
			message: 'Conversation retrieved successfully',
			conversation: conversation
		};
	}
);

export const makeFriendRquest = query(
	z.object({ friendUsername: z.string(), currentUserId: z.string() }),
	async (input) => {
		const otherUser = await getOtherUser(input.friendUsername);
		if (!otherUser) {
			return { success: false, message: 'Requested user not found' };
		}
		const { currentUserId } = input;
		const userA = currentUserId < otherUser.id ? currentUserId : otherUser.id;
		const userB = currentUserId < otherUser.id ? otherUser.id : currentUserId;
		const [friendship] = await db
			.select({ id: friends.id })
			.from(friends)
			.where(and(eq(friends.userId1, userA), eq(friends.userId2, userB)));
		if (friendship) {
			return { success: false, message: 'Friendship already exists' };
		}
		await db.insert(friends).values({
			id: generateUserId(),
			userId1: userA,
			userId2: userB,
			status: 'pending',
			requestedBy: input.currentUserId
		});
		return { success: true, message: 'Friend request sent' };
	}
);

export const removeFriend = query(
	z.object({ friendUsername: z.string(), currentUserId: z.string() }),
	async (input) => {
		const otherUser = await getOtherUser(input.friendUsername);
		if (!otherUser) {
			return { success: false, message: 'Requested user not found' };
		}
		const userId1 = input.currentUserId < otherUser.id ? input.currentUserId : otherUser.id;
		const userId2 = input.currentUserId < otherUser.id ? otherUser.id : input.currentUserId;
		const [friendship] = await db
			.select({ id: friends.id })
			.from(friends)
			.where(and(eq(friends.userId1, userId1), eq(friends.userId2, userId2)));
		if (!friendship) {
			return { success: false, message: 'Friendship does not exist' };
		}
		await db.delete(friends).where(and(eq(friends.userId1, userId1), eq(friends.userId2, userId2)));
		return { success: true, message: 'Friend removed' };
	}
);

export const makeFollow = query(
	z.object({ friendUsername: z.string(), currentUserId: z.string() }),
	async (input) => {
		const { friendUsername, currentUserId } = input;
		const otherUser = await getOtherUser(friendUsername);
		if (!otherUser) {
			return { success: false, message: 'Requested user not found' };
		}
		const [existingFollow] = await db
			.select()
			.from(followers)
			.where(and(eq(followers.followerId, currentUserId), eq(followers.followingId, otherUser.id)));
		if (existingFollow) {
			return { success: false, message: 'Already following this user' };
		}
		await db.insert(followers).values({
			followerId: currentUserId,
			followingId: otherUser.id
		});
		return { success: true, message: 'Followed successfully' };
	}
);

export const makeUnfollow = query(
	z.object({ friendUsername: z.string(), currentUserId: z.string() }),
	async (input) => {
		const { friendUsername, currentUserId } = input;
		const otherUser = await getOtherUser(friendUsername);
		if (!otherUser) {
			return { success: false, message: 'Requested user not found' };
		}
		const [existingFollow] = await db
			.select()
			.from(followers)
			.where(and(eq(followers.followerId, currentUserId), eq(followers.followingId, otherUser.id)));
		if (!existingFollow) {
			return { success: false, message: 'Not following this user' };
		}
		await db
			.delete(followers)
			.where(and(eq(followers.followerId, currentUserId), eq(followers.followingId, otherUser.id)));
		return { success: true, message: 'Unfollowed successfully' };
	}
);

export const acceptFriendRequest = query(
	z.object({ friendRequestId: z.string() }),
	async (input) => {
		const { friendRequestId } = input;

		const [friendship] = await db
			.update(friends)
			.set({ status: 'accepted', acceptedAt: new Date() })
			.where(eq(friends.id, friendRequestId))
			.returning();

		return {
			success: true,
			friendship,
			message: 'Friend request accepted successfully'
		};
	}
);

export const createConversation = query(
	z.object({ userId1: z.string(), userId2: z.string() }),
	async (input) => {
		const { userId1, userId2 } = input;
		const smaller = userId1 < userId2 ? userId1 : userId2;
		const larger = userId1 < userId2 ? userId2 : userId1;

		const [existingConversation] = await db
			.select()
			.from(conversations)
			.where(and(eq(conversations.userId1, smaller), eq(conversations.userId2, larger)))
			.limit(1);

		if (existingConversation) {
			return {
				success: true,
				message: 'Conversation already exists',
				conversation: existingConversation
			};
		}

		try {
			const [conversation] = await db
				.insert(conversations)
				.values({ id: generateUserId(), userId1: smaller, userId2: larger })
				.returning();

			return {
				success: true,
				message: 'Chat created successfully',
				conversation
			};
		} catch (error) {
			console.error('Error creating conversation:', error);
			return {
				success: false,
				message: 'Failed to create conversation'
			};
		}
	}
);

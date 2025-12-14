import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import {
	getMyConfessionPosts,
	getUserFollowers,
	getUserFollowings,
	getUserFriends
} from './data.remote.js';

export async function load({ locals }) {
	if (!locals.user) {
		redirect(308, resolve('/login'));
	}
	const username = locals.user.username;
	const [allConfessions, allFriendsData, followersData, followingData] = await Promise.all([
		getMyConfessionPosts({ userId: locals.user.id }),
		getUserFriends({ username }),
		getUserFollowers({ username }),
		getUserFollowings({ username })
	]);
	return {
		allConfessions,
		allFriends: allFriendsData.friends,
		followers: followersData.followers,
		following: followingData.followings
	};
}

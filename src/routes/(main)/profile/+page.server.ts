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
	const allConfessions = await getMyConfessionPosts({ userId: locals.user.id });
	const allFriends = (await getUserFriends({ username })).friends;
	const followers = (await getUserFollowers({ username })).followers;
	const following = (await getUserFollowings({ username })).followings;
	return {
		allConfessions,
		allFriends,
		followers,
		following
	};
}

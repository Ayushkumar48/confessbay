import { error, json } from '@sveltejs/kit';
import {
	getMyConfessionPosts,
	getUserFollowers,
	getUserFollowings,
	getUserFriends
} from '../../(main)/profile/data.remote';

export async function GET({ locals }) {
	if (!locals.user || !locals.session) {
		return error(401, { message: 'Not Authorized' });
	}
	const [allConfessions, allFriendsData, followersData, followingData] = await Promise.all([
		getMyConfessionPosts({ userId: locals.user.id }),
		getUserFriends({ username: locals.user.username }),
		getUserFollowers({ username: locals.user.username }),
		getUserFollowings({ username: locals.user.username })
	]);

	return json({
		allConfessions,
		allFriends: allFriendsData.friends,
		followers: followersData.followers,
		following: followingData.followings
	});
}

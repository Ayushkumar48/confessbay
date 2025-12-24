import { resolve } from '$app/paths';
import { fail, redirect } from '@sveltejs/kit';
import { getConfessionPosts } from '../feed/data.remote';
import { confessionCategories } from '$lib/shared/frontend-enums.js';
import { getConfessionPostsWithCategory } from './data.remote.js';
import { confessionCategory, visibility as visibilityEnum } from '$lib/shared/enums.js';

export async function load({ url, locals }) {
	if (!locals.user) {
		redirect(308, resolve('/login'));
	}
	const category = url.searchParams.get('category');
	const visibility = url.searchParams.get('visibility');
	console.log(visibility);
	if (!category || category === 'All') {
		return {
			confessions: await getConfessionPosts({
				userId: locals.user.id
			})
		};
	}
	const isValidCategory = confessionCategories.some((c) => c.label === category);
	if (!isValidCategory) {
		return fail(404, { message: 'Invalid category' });
	}
	return {
		confessions: await getConfessionPostsWithCategory({
			userId: locals.user.id,
			category: category as (typeof confessionCategory)[number],
			visibility: visibility as (typeof visibilityEnum)[number]
		})
	};
}

import { resolve } from '$app/paths';
import { confessionsInsertSchema } from '$lib/client/schema.js';
import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { logout } from '../../(auth)/login/data.remote.js';
import { newConfessionPost } from './data.remote.js';

export async function load({ locals }) {
	if (!locals.user) {
		redirect(308, resolve('/login'));
	}
	return {
		form: await superValidate(zod4(confessionsInsertSchema))
	};
}

export const actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await logout(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		return redirect(302, resolve('/login'));
	},
	post: async (event) => {
		if (!event.locals?.user) {
			return fail(401);
		}
		const form = await superValidate(event, zod4(confessionsInsertSchema));
		if (!form.valid)
			return message(
				form,
				{ status: 'error', message: 'Please resolve the form errors!' },
				{ status: 400 }
			);
		const {
			confessionPost,
			success,
			message: errorMessage
		} = await newConfessionPost({
			...form.data,
			confessedFrom: event.locals.user?.id,
			userId: event.locals.user.id
		});
		if (!success) {
			return message(form, { status: 'error', message: errorMessage }, { status: 400 });
		}
		return message(form, { status: 200, newConfessionPost: confessionPost });
	}
};

import { message, superValidate } from 'sveltekit-superforms';
import { userInsertSchema } from '$lib/client/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { signup } from './date.remote.js';

export const load = async ({ locals }) => {
	if (locals.user) redirect(308, resolve('/feed'));
	return {
		form: await superValidate(zod4(userInsertSchema))
	};
};

export const actions = {
	signup: async (event) => {
		const form = await superValidate(event, zod4(userInsertSchema));
		if (!form.valid)
			return message(
				form,
				{ status: 'error', message: 'Please resolve the form errors!' },
				{ status: 400 }
			);
		const res = await signup(form.data);
		if (!res.success || !res.user) {
			return message(form, { status: 'error', message: res.message }, { status: 400 });
		}
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, res.user.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		event.locals.user = res.user;
		redirect(308, resolve('/feed'));
	}
};

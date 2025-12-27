import { message, superValidate } from 'sveltekit-superforms';
import { userSelectSchema } from '$lib/client/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { login } from './data.remote.js';

export async function load({ locals }) {
	if (locals.user) redirect(308, resolve('/feed'));
	return {
		form: await superValidate(zod4(userSelectSchema))
	};
}

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(userSelectSchema));
		if (!form.valid)
			return message(
				form,
				{ status: 'error', message: 'Please resolve the form errors!' },
				{ status: 400 }
			);
		const res = await login(form.data);
		if (!res.success || !res.user) {
			return message(form, { status: 'error', message: res.message }, { status: 400 });
		}
		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, res.user.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		event.locals.user = res.user;
		redirect(303, resolve('/feed'));
	}
};

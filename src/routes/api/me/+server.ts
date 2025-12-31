import { json } from '@sveltejs/kit';

export const GET = ({ locals }) => {
	if (!locals.user || !locals.session) {
		return json({ user: null, session: null }, { status: 401 });
	}

	return json({
		user: locals.user,
		session: locals.session
	});
};

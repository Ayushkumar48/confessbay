export async function load({ locals }) {
	if (!locals.user) {
		return { user: null };
	}

	const user = locals.user;
	return { user };
}

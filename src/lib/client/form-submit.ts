import { toast } from 'svelte-sonner';
import { login } from '../../routes/(auth)/login/data.remote';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type z from 'zod';
import type { UserSelectSchema } from './schema';

export async function loginSubmit(form: z.infer<UserSelectSchema>) {
	const res = await login(form);
	if (!res.success) {
		toast.error(res.message!);
		return;
	}
	await fetch('/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId: res.userId })
	});
	goto(resolve('/feed'), { replaceState: true });
}

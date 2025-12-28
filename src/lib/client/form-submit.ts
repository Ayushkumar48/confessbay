import { toast } from 'svelte-sonner';
import { login } from '../../routes/(auth)/login/data.remote';
import { signup } from '../../routes/(auth)/signup/date.remote';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type z from 'zod';
import type { LoginSchema, SignupSchema } from './schema';

export async function loginSubmit(form: z.infer<LoginSchema>) {
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

export async function signupSubmit(form: z.infer<SignupSchema>) {
	const res = await signup(form);
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

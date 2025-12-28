<script lang="ts">
	import { fly } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import GoogleLogo from '$lib/assets/icons/google-logo.svelte';
	import MetaLogo from '$lib/assets/icons/meta-logo.svelte';
	import { Label } from './ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { resolve } from '$app/paths';
	import CustomAnimation from './custom-animation.svelte';
	import FieldSeparator from './ui/field/field-separator.svelte';
	import { loginSchema } from '$lib/client/schema';
	import { validateForm } from '$lib/client/validate-form';
	import TextInput from './custom/form-fields/text-input.svelte';
	import { loginSubmit } from '$lib/client/form-submit';

	let form = $state({
		username: '',
		password: '',
		remember: false
	});
	let errors = $state({
		username: [] as string[],
		password: [] as string[],
		remember: [] as string[]
	});
</script>

<div
	class="w-full overflow-hidden text-foreground grid grid-cols-1 lg:grid-cols-2 items-center justify-center p-8 lg:p-16 gap-12 lg:gap-20 min-h-svh"
>
	<CustomAnimation />
	<div in:fly={{ x: 40, duration: 500 }}>
		<div class="w-full max-w-lg mx-auto">
			<Card.Root class="overflow-visible p-8">
				<Card.Header class="text-center mb-6">
					<h2 class="text-4xl font-[Pacifico] text-foreground mb-2">ConfessBay</h2>
					<p class="text-base text-muted-foreground">Welcome back — sign in to continue</p>
				</Card.Header>

				<Card.Content class="space-y-6">
					<TextInput
						bind:form
						{errors}
						schema={loginSchema}
						field="username"
						title="Username or Email"
						bind:value={form.username}
						placeholder="your_username"
					/>
					<TextInput
						bind:form
						{errors}
						schema={loginSchema}
						field="password"
						title="Password"
						bind:value={form.password}
						type="password"
						placeholder="••••••••"
					/>
					<div
						class="flex items-center justify-between"
						in:fly={{ y: 20, duration: 400, delay: 400 }}
					>
						<div class="flex items-center gap-x-2">
							<Checkbox id="remember" bind:checked={form.remember} />
							<Label for="remember">Remember me</Label>
						</div>
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a class="text-sm text-primary hover:underline" href="/forgot">Forgot password?</a>
					</div>

					<div in:fly={{ y: 20, duration: 400, delay: 500 }}>
						<Button
							onclick={async () => {
								const { valid, errors: nextErrors } = validateForm(form, loginSchema);
								errors = nextErrors;
								if (!valid) return;
								await loginSubmit(form);
							}}
							class="w-full h-12 rounded-full bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold text-base"
						>
							Sign in
						</Button>
					</div>

					<div in:fly={{ y: 20, duration: 400, delay: 600 }}>
						<FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-4">
							Or continue with
						</FieldSeparator>
					</div>

					<div class="flex gap-4" in:fly={{ y: 20, duration: 400, delay: 700 }}>
						<Button
							variant="outline"
							type="button"
							aria-label="Login with Google"
							class="flex-1 h-12"
						>
							<div class="mr-3"><GoogleLogo /></div>
							<span>Google</span>
						</Button>
						<Button
							variant="outline"
							type="button"
							aria-label="Login with Meta"
							class="flex-1 h-12"
						>
							<div class="mr-3"><MetaLogo /></div>
							<span>Meta</span>
						</Button>
					</div>

					<div
						class="text-center text-sm text-muted-foreground mt-6"
						in:fly={{ y: 20, duration: 400, delay: 800 }}
					>
						Don't have an account?
						<a class="text-primary hover:underline ml-2 font-medium" href={resolve('/signup')}>
							Sign up
						</a>
					</div>
				</Card.Content>

				<div in:fly={{ y: 20, duration: 400, delay: 900 }}>
					<Card.Footer class="text-xs text-muted-foreground text-center mt-4 px-6">
						<!-- eslint-disable svelte/no-navigation-without-resolve-->
						By continuing you agree to our
						<a class="underline mx-1" href="/legal/terms">Terms</a>
						and
						<a class="underline mx-1" href="/legal/privacy">Privacy</a>.
					</Card.Footer>
				</div>
			</Card.Root>
		</div>
	</div>
</div>

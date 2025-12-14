<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { userSelectSchema, type UserSelectSchema } from '$lib/client/schema';
	import MetaLogo from '$lib/assets/icons/meta-logo.svelte';
	import GoogleLogo from '$lib/assets/icons/google-logo.svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: { form: SuperValidated<Infer<UserSelectSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(userSelectSchema),
		onUpdated({ form }) {
			if (form.message.status === 'success') {
				toast.success(form.message.message);
			} else {
				toast.error(form.message.message);
			}
		},
		onResult({ result }) {
			if (result.type === 'redirect') {
				window.location.href = result.location;
			}
		}
	});
	const { form: formData, enhance } = form;
</script>

<div class="flex flex-col gap-6">
	<Card.Root class="overflow-hidden p-0">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form class="p-6 md:p-8" method="POST" use:enhance enctype="multipart/form-data">
				<Field.Group>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Welcome back</h1>
						<p class="text-balance text-muted-foreground">Login to your account</p>
					</div>
					<Form.Field {form} name="username">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Username or Email</Form.Label>
								<Input {...props} bind:value={$formData.username} placeholder="john_doe" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<Input
									{...props}
									bind:value={$formData.password}
									type="password"
									placeholder="********"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Field.Field>
						<Button type="submit">Sign In</Button>
					</Field.Field>
					<Field.Separator class="*:data-[slot=field-separator-content]:bg-card">
						Or continue with
					</Field.Separator>
					<Field.Field class="grid grid-cols-2 gap-4">
						<Button variant="outline" type="button">
							<GoogleLogo />
							<span class="sr-only">Login with Google</span>
						</Button>
						<Button variant="outline" type="button">
							<MetaLogo />
							<span class="sr-only">Login with Meta</span>
						</Button>
					</Field.Field>
					<Field.Description class="text-center">
						Don't have an account? <a href={resolve('/signup')}>Sign up</a>
					</Field.Description>
				</Field.Group>
			</form>
			<div class="relative hidden bg-muted md:block">
				<img
					src="https://images.pexels.com/photos/34229770/pexels-photo-34229770.jpeg"
					alt=""
					class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
				/>
			</div>
		</Card.Content>
	</Card.Root>
	<Field.Description class="px-6 text-center">
		By clicking continue, you agree to our <a href="##">Terms of Service</a> and
		<a href="##">Privacy Policy</a>.
	</Field.Description>
</div>

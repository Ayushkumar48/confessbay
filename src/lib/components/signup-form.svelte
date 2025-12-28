<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { gender } from '$lib/shared/enums';
	import { signupSchema, type SignupSchema } from '$lib/client/schema';
	import { cn } from '$lib/utils';
	import { resolve } from '$app/paths';
	import MetaLogo from '$lib/assets/icons/meta-logo.svelte';
	import GoogleLogo from '$lib/assets/icons/google-logo.svelte';
	import TextInput from './custom/form-fields/text-input.svelte';
	import SelectInput from './custom/form-fields/select-input.svelte';
	import DateInput from './custom/form-fields/date-input.svelte';
	import FileInput from './custom/form-fields/file-input.svelte';
	import { validateForm } from '$lib/client/validate-form';
	import { signupSubmit } from '$lib/client/form-submit';
	import CustomAnimation from './custom-animation.svelte';
	import FieldSeparator from './ui/field/field-separator.svelte';
	import type z from 'zod';

	let form = $state<z.infer<SignupSchema>>({
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		gender: 'Male',
		dateOfBirth: undefined,
		city: undefined,
		phoneNumber: undefined,
		avatar: undefined as File | undefined
	});
	let errors = $state({
		firstName: [] as string[],
		lastName: [] as string[],
		username: [] as string[],
		email: [] as string[],
		password: [] as string[],
		confirmPassword: [] as string[],
		gender: [] as string[],
		dateOfBirth: [] as string[],
		city: [] as string[],
		phoneNumber: [] as string[],
		avatar: [] as string[]
	});
	let currentStep = $state(1);
	let avatar = $state<File>();

	function nextStep() {
		currentStep++;
	}

	function prevStep() {
		currentStep--;
	}

	$effect(() => {
		if (avatar) {
			form.avatar = avatar;
		}
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
					<p class="text-base text-muted-foreground">Create your account to get started</p>
				</Card.Header>

				<Card.Content class="space-y-6">
					<div class={cn(currentStep !== 1 && 'hidden')} in:fly={{ y: 20, duration: 400 }}>
						<p class="text-md text-left mb-4">Step 1</p>
						<div class="grid grid-cols-2 gap-4">
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="firstName"
								title="First Name"
								bind:value={form.firstName}
								placeholder="John"
							/>
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="lastName"
								title="Last Name"
								bind:value={form.lastName}
								placeholder="Doe"
							/>
						</div>
						<TextInput
							bind:form
							bind:errors
							schema={signupSchema}
							field="username"
							title="Username"
							bind:value={form.username}
							placeholder="john_doe"
						/>
						<TextInput
							bind:form
							bind:errors
							schema={signupSchema}
							field="email"
							title="Email"
							bind:value={form.email}
							placeholder="john_doe@example.com"
						/>
						<div class="grid grid-cols-2 gap-4">
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="password"
								title="Password"
								bind:value={form.password}
								type="password"
								placeholder="********"
							/>
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="confirmPassword"
								title="Confirm Password"
								bind:value={form.confirmPassword}
								type="password"
								placeholder="********"
							/>
						</div>
						<div class="text-sm text-muted-foreground">Must be at least 8 characters long.</div>
						<Button type="button" onclick={nextStep} size="lg" class="w-full my-2 py-6">Next</Button
						>
						{@render authLogin()}
					</div>

					<div class={cn(currentStep !== 2 && 'hidden')} in:fly={{ y: 20, duration: 400 }}>
						<p class="text-md text-left mb-4">Step 2</p>
						<div class="grid grid-cols-2 gap-4">
							<SelectInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="gender"
								title="Gender"
								bind:value={form.gender}
								options={gender}
								placeholder="Select a gender"
							/>
							<DateInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="dateOfBirth"
								title="Date of Birth"
								bind:value={form.dateOfBirth}
							/>
						</div>
						<TextInput
							bind:form
							bind:errors
							schema={signupSchema}
							field="city"
							title="City"
							bind:value={form.city}
							placeholder="New York"
						/>
						<TextInput
							bind:form
							bind:errors
							schema={signupSchema}
							field="phoneNumber"
							title="Phone Number"
							bind:value={form.phoneNumber}
							placeholder="123456789"
						/>
						<div class="grid grid-cols-2 gap-4">
							<Button
								variant="outline"
								type="button"
								onclick={prevStep}
								size="lg"
								class="w-full my-2 py-6">Back</Button
							>
							<Button type="button" onclick={nextStep} size="lg" class="w-full my-2 py-6">
								Next</Button
							>
						</div>
						{@render authLogin()}
					</div>

					<div class={cn(currentStep !== 3 && 'hidden')} in:fly={{ y: 20, duration: 400 }}>
						<p class="text-md text-left mb-4">Step 3</p>
						<FileInput
							bind:form
							bind:errors
							schema={signupSchema}
							field="avatar"
							title="Select a profile picture"
							bind:value={avatar}
						/>
						<div class="grid grid-cols-2 gap-4 items-center">
							<Button
								variant="outline"
								type="button"
								onclick={prevStep}
								size="lg"
								class="w-full my-2 py-6">Back</Button
							>
							<Button
								type="button"
								onclick={async () => {
									const { valid, errors: nextErrors } = validateForm(form, signupSchema);
									errors = nextErrors;
									if (!valid) return;
									await signupSubmit(form);
								}}
								class="w-full my-2 py-6 rounded-full bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold text-base"
							>
								Create Account
							</Button>
						</div>
						{@render authLogin()}
					</div>
				</Card.Content>

				<Card.Footer class="text-xs text-muted-foreground text-center mt-4 px-6">
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					By continuing you agree to our <a class="underline" href="/legal/terms">Terms</a> and
					<a class="underline" href="/legal/privacy">Privacy</a>.
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>

{#snippet authLogin()}
	<FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-4">
		Or continue with
	</FieldSeparator>
	<div class="flex gap-4">
		<Button variant="outline" type="button" aria-label="Signup with Google" class="flex-1 h-12">
			<div class="mr-3"><GoogleLogo /></div>
			<span>Google</span>
		</Button>
		<Button variant="outline" type="button" aria-label="Signup with Meta" class="flex-1 h-12">
			<div class="mr-3"><MetaLogo /></div>
			<span>Meta</span>
		</Button>
	</div>
	<div class="text-center text-sm text-muted-foreground mt-6">
		Already have an account?
		<a class="text-primary hover:underline ml-2 font-medium" href={resolve('/login')}>Sign in</a>
	</div>
{/snippet}

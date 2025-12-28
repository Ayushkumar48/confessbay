<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { gender } from '$lib/shared/enums';
	import { signupSchema, type SignupSchema } from '$lib/client/schema';

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
	import { onMount } from 'svelte';

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

	let mounted = $state(false);
	onMount(() => (mounted = true));
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

				<div class="w-full bg-gray-200 rounded-full h-2 mb-6">
					<div
						class="bg-primary h-2 rounded-full transition-all duration-300"
						style="width: {(currentStep / 3) * 100}%"
					></div>
				</div>

				<Card.Content class="space-y-6">
					{#if mounted && currentStep === 1}
						<div transition:slide>
							<p class="text-md text-left mb-4" in:fly={{ x: 10, duration: 300 }}>Step 1</p>
							<div class="grid grid-cols-2 gap-4">
								<TextInput
									bind:form
									bind:errors
									schema={signupSchema}
									field="firstName"
									title="First Name"
									bind:value={form.firstName}
									placeholder="John"
									animationDelay={200}
								/>
								<TextInput
									bind:form
									bind:errors
									schema={signupSchema}
									field="lastName"
									title="Last Name"
									bind:value={form.lastName}
									placeholder="Doe"
									animationDelay={200}
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
								animationDelay={300}
							/>
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="email"
								title="Email"
								bind:value={form.email}
								placeholder="john_doe@example.com"
								animationDelay={400}
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
									animationDelay={500}
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
									animationDelay={500}
								/>
							</div>
							<div class="text-sm text-muted-foreground">Must be at least 8 characters long.</div>
							<div in:fly={{ y: 20, duration: 400, delay: 600 }}>
								<Button
									type="button"
									onclick={nextStep}
									size="lg"
									class="w-full my-2 py-6 transition-transform duration-200 active:scale-95"
								>
									Next
								</Button>
							</div>
							{@render authLogin()}
						</div>
					{/if}

					{#if currentStep === 2}
						<div transition:slide>
							<p class="text-md text-left mb-4" in:fly={{ x: 10, duration: 300 }}>Step 2</p>
							<div class="grid grid-cols-2 gap-4" in:fly={{ y: 20, duration: 400, delay: 100 }}>
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
								animationDelay={200}
							/>
							<TextInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="phoneNumber"
								title="Phone Number"
								bind:value={form.phoneNumber}
								placeholder="123456789"
								animationDelay={300}
							/>
							<div class="grid grid-cols-2 gap-4" in:fly={{ y: 20, duration: 400, delay: 400 }}>
								<Button
									variant="outline"
									type="button"
									onclick={prevStep}
									size="lg"
									class="w-full my-2 py-6 transition-transform duration-200 active:scale-95"
								>
									Back
								</Button>
								<Button
									type="button"
									onclick={nextStep}
									size="lg"
									class="w-full my-2 py-6 transition-transform duration-200 active:scale-95"
								>
									Next
								</Button>
							</div>
							{@render authLogin()}
						</div>
					{/if}

					{#if currentStep === 3}
						<div transition:slide>
							<p class="text-md text-left mb-4" in:fly={{ x: 10, duration: 300 }}>Step 3</p>
							<FileInput
								bind:form
								bind:errors
								schema={signupSchema}
								field="avatar"
								title="Select a profile picture"
								bind:value={avatar}
								animationDelay={100}
							/>
							<div
								class="grid grid-cols-2 gap-4 items-center"
								in:fly={{ y: 20, duration: 400, delay: 200 }}
							>
								<Button
									variant="outline"
									type="button"
									onclick={prevStep}
									size="lg"
									class="w-full my-2 py-6 transition-transform duration-200 active:scale-95"
								>
									Back
								</Button>
								<Button
									type="button"
									onclick={async () => {
										const { valid, errors: nextErrors } = validateForm(form, signupSchema);
										errors = nextErrors;
										if (!valid) return;
										await signupSubmit(form);
									}}
									class="w-full my-2 py-6 rounded-full bg-linear-to-r from-indigo-500 to-violet-600 text-white font-semibold text-base transition-transform duration-200 active:scale-95"
								>
									Create Account
								</Button>
							</div>
							{@render authLogin()}
						</div>
					{/if}
				</Card.Content>

				<Card.Footer class="text-xs text-muted-foreground text-center mt-4 px-6">
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					By continuing you agree to our
					<a class="underline mx-1" href="/legal/terms">Terms</a>
					and
					<a class="underline mx-1" href="/legal/privacy">Privacy</a>.
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>

{#snippet authLogin()}
	<FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-4">
		Or continue with
	</FieldSeparator>
	<div class="flex gap-4" in:fly={{ y: 20, duration: 400, delay: 500 }}>
		<Button variant="outline" type="button" aria-label="Signup with Google" class="flex-1 h-12">
			<div class="mr-3"><GoogleLogo /></div>
			<span>Google</span>
		</Button>
		<Button variant="outline" type="button" aria-label="Signup with Meta" class="flex-1 h-12">
			<div class="mr-3"><MetaLogo /></div>
			<span>Meta</span>
		</Button>
	</div>
	<div
		class="text-center text-sm text-muted-foreground mt-6"
		in:fly={{ y: 20, duration: 400, delay: 500 }}
	>
		Already have an account?
		<a class="text-primary hover:underline ml-2 font-medium" href={resolve('/login')}>Sign in</a>
	</div>
{/snippet}

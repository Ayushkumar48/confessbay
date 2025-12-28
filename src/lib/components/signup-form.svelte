<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { gender } from '$lib/shared/enums';
	import DatePicker from './date-picker.svelte';
	import GoogleLogo from '$lib/assets/icons/google-logo.svelte';
	import UserEmpty from './user-empty.svelte';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
	import { userInsertSchema, type UserInsertSchema } from '$lib/client/schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { resolve } from '$app/paths';
	import MetaLogo from '$lib/assets/icons/meta-logo.svelte';

	let { data }: { data: { form: SuperValidated<Infer<UserInsertSchema>> } } = $props();

	const form = $derived(
		superForm(data.form, {
			validators: zod4Client(userInsertSchema),
			taintedMessage: 'Are you sure you want to leave?',
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
		})
	);
	type FormField = keyof Infer<UserInsertSchema>;

	const { form: formData, enhance } = $derived(form);
	let currentStep = $state(1);
	let dateOfBirth = $state<CalendarDate>(today(getLocalTimeZone()));
	const selectedGender = $derived($formData.gender ?? 'Select a gender');
	let avatar = $state<File>();

	function nextStep() {
		currentStep++;
	}

	function prevStep() {
		currentStep--;
	}

	$effect(() => {
		$formData.dateOfBirth = dateOfBirth.toString();
		if (avatar) {
			$formData.avatar = avatar;
		}
	});
</script>

<div class="flex flex-col gap-6">
	<Card.Root class="overflow-hidden p-0">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form
				class="p-6 md:p-8"
				method="POST"
				use:enhance
				enctype="multipart/form-data"
				action="?/signup"
			>
				<div class="relative min-h-96 w-full">
					<!-- Step 1 -->
					<Field.Group class={cn(currentStep !== 1 && 'hidden')}>
						{@render headerHelper(1)}
						<Field.Field class="grid grid-cols-2 gap-4">
							{@render formField('firstName', 'First Name', 'John')}
							{@render formField('lastName', 'Last Name', 'Doe')}
						</Field.Field>
						{@render formField('username', 'Username', 'john_doe')}
						{@render formField('email', 'Email', 'john_doe@example.com')}
						<Field.Field>
							<Field.Field class="grid grid-cols-2 gap-4">
								{@render formField('password', 'Password', '********', 'password')}
								{@render formField('confirmPassword', 'Confirm Password', '********', 'password')}
							</Field.Field>
							<Field.Description>Must be at least 8 characters long.</Field.Description>
						</Field.Field>
						<Field.Field>
							<Button type="button" onclick={nextStep}>Next</Button>
						</Field.Field>
						{@render authLogin()}
					</Field.Group>

					<!-- Step 2 -->
					<Field.Group class={cn(currentStep !== 2 && 'hidden')}>
						{@render headerHelper(2)}
						<Form.Field {form} name="gender">
							{@render genderSelect()}
						</Form.Field>

						<Form.Field {form} name="dateOfBirth">
							<DatePicker bind:dateOfBirth />
						</Form.Field>
						{@render formField('city', 'City', 'New York')}
						{@render formField('phoneNumber', 'Phone Number', '123456789')}

						<Field.Field class="grid grid-cols-2 gap-4">
							<Button variant="outline" type="button" onclick={prevStep}>Back</Button>
							<Button type="button" onclick={nextStep}>Next</Button>
						</Field.Field>

						{@render authLogin()}
					</Field.Group>

					<!-- Step 3 -->
					<Field.Group class={cn(currentStep !== 3 && 'hidden')}>
						{@render headerHelper(3)}
						<Form.Field {form} name="avatar">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Select a profile picture</Form.Label>
									<UserEmpty bind:image={avatar} {...props} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Field.Field class="grid grid-cols-2 gap-4">
							<Button variant="outline" type="button" class="w-1/2" onclick={prevStep}>Back</Button>
							<Button type="submit">Create Account</Button>
						</Field.Field>

						{@render authLogin()}
					</Field.Group>
				</div>
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
		By clicking continue, you agree to our <a href="#/">Terms of Service</a>
		and <a href="#/">Privacy Policy</a>.
	</Field.Description>
</div>

{#snippet formField(name: FormField, label: string, placeholder: string, type = 'text')}
	<Form.Field {form} {name}>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>{label}</Form.Label>
				<Input {...props} bind:value={$formData[name]} {placeholder} {type} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
{/snippet}

{#snippet genderSelect()}
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label>Gender</Form.Label>
			<Select.Root type="single" bind:value={$formData.gender} name={props.name}>
				<Select.Trigger class="w-full" {...props}>{selectedGender}</Select.Trigger>
				<Select.Content>
					{#each gender as option (option)}
						<Select.Item value={option}>{option}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
{/snippet}

{#snippet authLogin()}
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
		Already have an account? <a href={resolve('/login')}>Sign in</a>
	</Field.Description>
{/snippet}

{#snippet headerHelper(step: number)}
	<div class="flex flex-col items-center gap-2 text-center">
		<h1 class="text-2xl font-bold">Create your account</h1>
	</div>
	<div>
		<p class="text-md text-left">Step {step}</p>
	</div>
{/snippet}

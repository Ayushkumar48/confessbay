<script lang="ts" module>
	import type { ZodObject, ZodType } from 'zod';
	export type FieldProps<
		TForm extends Record<string, unknown>,
		TShape extends { [K in keyof TForm]: ZodType<TForm[K]> },
		K extends keyof TForm
	> = {
		form: TForm;
		errors: Pick<Record<keyof TForm, string[]>, K>;
		schema: ZodObject<TShape>;
		field: K;
		value: File | undefined;
		title: string;
		class?: string;
	};
	type Props = FieldProps<Record<string, unknown>, Record<string, ZodType<unknown>>, string>;
</script>

<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { fly } from 'svelte/transition';
	import Errors from './errors.svelte';

	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import { Input } from '$lib/components/ui/input';
	import { handleFieldChange } from '$lib/client/zod-field-handler';

	let {
		form = $bindable(),
		errors = $bindable(),
		schema,
		field,
		title,
		value = $bindable(),
		class: className
	}: Props = $props();

	let avatarUrl = $state('');
	function handleFileChange(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const file = event.currentTarget.files?.item(0) as File;
		value = file;
		if (file) {
			avatarUrl = URL.createObjectURL(file);
		}
	}

	$effect(() => {
		if (value) {
			handleFieldChange(form, errors, schema, field, value);
		}
	});
</script>

<div class="space-y-2" in:fly={{ y: 20, duration: 400 }}>
	<Label class="text-base">{title}</Label>
	<div class="flex justify-center {className}">
		<div class="group inline-block cursor-pointer">
			<label for="avatar" class="block">
				<div class="relative inline-block transition-transform duration-200 group-hover:scale-105">
					<div
						class="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md"
					>
						{#if avatarUrl}
							<img src={avatarUrl} alt="Avatar" class="h-full w-full object-cover" />
						{:else}
							<UserRoundIcon class="size-12 text-gray-400" />
						{/if}

						<div
							class="absolute inset-0 flex items-center justify-center rounded-full bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
						></div>

						<div
							class="absolute right-1 bottom-1 rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:bg-gray-100"
						>
							<PencilIcon class="size-4 text-gray-700" />
						</div>
					</div>
				</div>
			</label>

			<Input
				name="avatar"
				id="avatar"
				type="file"
				accept="image/*"
				class="hidden"
				oninput={handleFileChange}
			/>
		</div>
	</div>

	<Errors bind:errors={errors[field]} />
</div>

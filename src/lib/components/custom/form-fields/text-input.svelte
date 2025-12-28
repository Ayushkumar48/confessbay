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
		value: TForm[K];
		title: string;
		type?: string;
		placeholder?: string;
		class?: string;
	};
	type Props = FieldProps<Record<string, unknown>, Record<string, ZodType<unknown>>, string>;
</script>

<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { fly } from 'svelte/transition';
	import Errors from './errors.svelte';
	import { handleFieldChange } from '$lib/client/zod-field-handler';
	import { cn } from '$lib/utils';

	let {
		form = $bindable(),
		errors = $bindable(),
		schema,
		field,
		title,
		value = $bindable(),
		type = 'text',
		placeholder = '',
		class: className
	}: Props = $props();
</script>

<div class="space-y-2" in:fly={{ y: 20, duration: 400 }}>
	<Label class="text-base">{title}</Label>
	<Input
		bind:value
		oninput={() => handleFieldChange(form, errors, schema, field, value)}
		{type}
		name={field}
		{placeholder}
		class={cn(
			'h-12 text-base transition-shadow focus-visible:shadow-[0_8px_30px_rgba(59,130,246,0.12)]',
			className
		)}
	/>

	<Errors bind:errors={errors[field]} />
</div>

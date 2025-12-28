<script lang="ts" module>
	import type { ZodObject, ZodType } from 'zod';
	type Props = {
		form: Record<string, unknown>;
		errors: Record<string, string[]>;
		schema: ZodObject<Record<string, ZodType<unknown>>>;
		field: string;
		value: string;
		title: string;
		options: readonly string[];
		placeholder?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
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
		options,
		placeholder = 'Select an option',
		class: className
	}: Props = $props();
</script>

<div class="space-y-2 w-full" in:fly={{ y: 20, duration: 400 }}>
	<Label class="text-base">{title}</Label>
	<Select.Root
		type="single"
		bind:value
		name={field}
		onValueChange={() => handleFieldChange(form, errors, schema, field, value)}
	>
		<Select.Trigger class={cn('h-12! text-base w-full', className)}>
			{value || placeholder}
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option)}
				<Select.Item value={option}>{option}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<Errors errors={errors[field]} />
</div>

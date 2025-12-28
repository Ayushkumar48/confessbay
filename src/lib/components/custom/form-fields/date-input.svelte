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
		value?: string;
		title: string;
		class?: string;
	};
	type Props = FieldProps<Record<string, unknown>, Record<string, ZodType<unknown>>, string>;
</script>

<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Label } from '$lib/components/ui/label';
	import { fly } from 'svelte/transition';
	import Errors from './errors.svelte';
	import { handleFieldChange } from '$lib/client/zod-field-handler';
	import { formatDate } from '$lib/utils';

	let open = $state(false);

	let {
		form = $bindable(),
		errors = $bindable(),
		schema,
		field,
		title,
		value = $bindable(),
		class: className
	}: Props = $props();
	let date = $state(today(getLocalTimeZone()));
</script>

<div class="space-y-2" in:fly={{ y: 20, duration: 400 }}>
	<Label class="text-base">{title}</Label>
	<Popover.Root bind:open>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" class="w-full h-12 justify-between font-normal">
					{formatDate(date.toDate(getLocalTimeZone()))}
					<ChevronDownIcon />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto overflow-hidden p-0" align="start">
			<Calendar
				type="single"
				bind:value={date}
				captionLayout="dropdown"
				class={className}
				onValueChange={(v) => {
					if (!v) return;
					value = v.toString();
					handleFieldChange(form, errors, schema, field, value);
					open = false;
				}}
				maxValue={today(getLocalTimeZone())}
			/>
		</Popover.Content>
	</Popover.Root>
	<input hidden bind:value />

	<Errors bind:errors={errors[field]} />
</div>

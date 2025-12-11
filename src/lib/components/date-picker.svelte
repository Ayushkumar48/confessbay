<script lang="ts">
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { Label, Control, FieldErrors } from '$lib/components/ui/form/index.js';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';

	let open = $state(false);
	let { dateOfBirth = $bindable() }: { dateOfBirth: CalendarDate } = $props();
</script>

<Control>
	{#snippet children({ props })}
		<Label for="dateOfBirth">Date of Birth</Label>
		<Popover.Root bind:open>
			<Popover.Trigger {...props}>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-full justify-between font-normal">
						{dateOfBirth
							.toDate(getLocalTimeZone())
							.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={dateOfBirth}
					captionLayout="dropdown"
					onValueChange={() => {
						open = false;
					}}
					maxValue={today(getLocalTimeZone())}
				/>
			</Popover.Content>
		</Popover.Root>
		<input hidden value={dateOfBirth} name={props.name} />
	{/snippet}
</Control>
<FieldErrors />

<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { confessionCategory, visibility } from '$lib/shared/enums';
	import { cn } from '$lib/utils';
	import EllipsesIcon from '@lucide/svelte/icons/ellipsis';
	import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { SuperForm } from 'sveltekit-superforms';
	import type z from 'zod';
	import type { ConfessionsInsertSchema } from '$lib/client/schema';
	import { useId } from 'bits-ui';
	import { tick } from 'svelte';

	let { form }: { form: SuperForm<z.infer<ConfessionsInsertSchema>> } = $props();
	const { form: formData } = $derived(form);
	let categoryPopoverOpen = $state(false);
	const triggerId = useId();

	type Category = (typeof confessionCategory)[number];

	function selectCategory(category: string) {
		$formData.category = category as Category;
		closeAndFocusTrigger();
	}

	function closeAndFocusTrigger() {
		categoryPopoverOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			buttonVariants({ size: 'sm', variant: 'ghost' }),
			'cursor-pointer ring-1 ring-fuchsia-300'
		)}
	>
		<EllipsesIcon class="fill-blue-300 text-fuchsia-400" />
		Options
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-80 p-4" align="start">
		<div class="space-y-6">
			<h4 class="text-center font-semibold">Options</h4>

			<div class="space-y-2">
				{@render helpTooltip(
					'Is this an anonymous post?',
					'Anonymous posts hide your identity from other users. Only you and moderators can see who posted it.'
				)}
				<Form.Field {form} class="flex items-center space-x-2" name="isAnonymous">
					<Form.Control>
						{#snippet children({ props })}
							<Switch {...props} bind:checked={$formData.isAnonymous} />
							<span class="text-sm text-muted-foreground">
								{$formData.isAnonymous ? 'Yes' : 'No'}
							</span>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>

			<div class="space-y-2">
				{@render helpTooltip(
					'Visibility',
					'Choose who can see your confession: College (students from your college), Friends (your friends only), or Public (everyone).'
				)}
				<Form.Field {form} class="flex items-center space-x-2" name="visibility">
					<Form.Control>
						{#snippet children({ props })}
							<Select.Root type="single" bind:value={$formData.visibility} name={props.name}>
								<Select.Trigger class="w-full" {...props}>
									{$formData.visibility || 'Select visibility'}
								</Select.Trigger>
								<Select.Content>
									{#each visibility as visibilityOption (visibilityOption)}
										<Select.Item value={visibilityOption} label={visibilityOption}>
											{visibilityOption}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>

			<div class="space-y-2">
				{@render helpTooltip(
					'Category',
					'Select one or more categories that best describe your confession. This helps others find relevant content.'
				)}
				{@render catrgoriesMultiselect()}
			</div>

			<div class="space-y-2">
				{@render helpTooltip(
					'Replies should be enabled?',
					'When enabled, other users can reply to your confession. Disable if you want to share without receiving responses.'
				)}
				<Form.Field {form} class="flex items-center space-x-2" name="repliesEnabled">
					<Form.Control>
						{#snippet children({ props })}
							<Switch {...props} bind:checked={$formData.repliesEnabled} />
							<span class="text-sm text-muted-foreground">
								{$formData.repliesEnabled ? 'Yes' : 'No'}
							</span>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

{#snippet helpTooltip(label: string, content: string)}
	<div class="flex items-center gap-2">
		<Label for="replies" class="text-sm font-medium">{label}</Label>
		<Tooltip.Root delayDuration={300}>
			<Tooltip.Trigger>
				<HelpCircleIcon
					class="h-4 w-4 cursor-help text-muted-foreground transition-colors hover:text-foreground"
				/>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="max-w-48 text-sm">
					{content}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
{/snippet}

{#snippet catrgoriesMultiselect()}
	<Form.Field {form} name="category" class="flex flex-col space-y-2">
		<Popover.Root bind:open={categoryPopoverOpen}>
			<Form.Control id={triggerId}>
				{#snippet children({ props })}
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-full justify-between',
							!$formData.category && 'text-muted-foreground'
						)}
						role="combobox"
						{...props}
					>
						{$formData.category ?? 'Select category'}
						<ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden name={props.name} bind:value={$formData.category} />
				{/snippet}
			</Form.Control>

			<Popover.Content class="w-80 p-0">
				<Command.Root>
					<Command.Input placeholder="Search categories..." autofocus />
					<Command.List class="max-h-60">
						<Command.Empty>No categories found.</Command.Empty>
						<Command.Group>
							{#each confessionCategory as category (category)}
								<Command.Item value={category} onSelect={() => selectCategory(category)}>
									<span>{category}</span>
									<CheckIcon
										class={cn(
											'ml-auto h-4 w-4',
											category !== $formData.category && 'text-transparent'
										)}
									/>
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</Form.Field>
{/snippet}

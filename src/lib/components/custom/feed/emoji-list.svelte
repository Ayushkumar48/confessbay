<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { emojis } from '$lib/constants';
	import { cn } from '$lib/utils';
	import { Debounced } from 'runed';

	import SmilePlusIcon from '@lucide/svelte/icons/smile-plus';

	let { postMessage = $bindable('') } = $props();

	let open = $state(false);
	let value = $state('');
	let searchQuery = $state('');

	const debouncedSearchQuery = new Debounced(() => searchQuery, 200);

	let filteredEmojis = $derived(
		emojis.filter((emoji) => {
			if (!debouncedSearchQuery.current) return true;
			const query = debouncedSearchQuery.current.toLowerCase();
			return (
				emoji.name.toLowerCase().includes(query) ||
				emoji.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		})
	);

	function selectEmoji(emoji: string) {
		postMessage += emoji;
		searchQuery = '';
		value = '';
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			searchQuery = '';
			value = '';
		}
	}
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
	<Popover.Trigger
		class={cn(
			buttonVariants({ size: 'sm', variant: 'ghost' }),
			'cursor-pointer ring-1 ring-amber-300'
		)}
	>
		<SmilePlusIcon class="fill-amber-300 text-amber-900" />
		Emojis
	</Popover.Trigger>
	<Popover.Content class="w-80 p-0" align="start">
		<Command.Root bind:value>
			<Command.Input bind:value={searchQuery} placeholder="Search emojis..." class="h-9" />
			<Command.List class="max-h-80 overflow-y-auto">
				<Command.Empty>No emojis found.</Command.Empty>
				<Command.Group>
					<div class="grid grid-cols-8 gap-1 p-2">
						{#each filteredEmojis as emojiItem (emojiItem.emoji)}
							<Command.Item
								value={emojiItem.name}
								onSelect={() => selectEmoji(emojiItem.emoji)}
								class="flex cursor-pointer items-center justify-center rounded-md p-2 text-xl transition-colors hover:bg-accent focus:bg-accent"
								title={emojiItem.name}
							>
								{emojiItem.emoji}
							</Command.Item>
						{/each}
					</div>
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

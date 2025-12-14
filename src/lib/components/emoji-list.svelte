<script lang="ts" module>
	type EmojiItem = {
		emoji: string;
		label: string;
		hexcode: string;
		tags: string[];
		group: number;
		subgroup: number;
	};

	type CategoryItem = {
		type: 'category';
		name: string;
		order: number;
		startIndex: number;
	};

	type EmojiRowItem = {
		type: 'row';
		emojis: EmojiItem[];
		categoryOrder: number;
	};

	type VirtualItem = CategoryItem | EmojiRowItem;

	type CategoryTab = {
		order: number;
		name: string;
		emoji: string;
	};
</script>

<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils';
	import { Debounced } from 'runed';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import SmilePlusIcon from '@lucide/svelte/icons/smile-plus';
	import emojiData from 'emojibase-data/en/data.json';
	import messagesData from 'emojibase-data/en/messages.json';

	let { onEmojiSelect }: { onEmojiSelect: (emoji: string) => void } = $props();

	let open = $state(false);
	let value = $state('');
	let searchQuery = $state('');
	let scrollElement = $state<HTMLElement | null>(null);
	let selectedCategory = $state<number | null>(null);
	let recentEmojis = $state<string[]>([]);

	const debouncedSearchQuery = new Debounced(() => searchQuery, 200);

	const COLUMNS = 8;
	const ROW_HEIGHT = 48;
	const CATEGORY_HEIGHT = 36;

	const groupMap = new Map(messagesData.groups.map((g) => [g.order, g.message]));

	const categoryTabs: CategoryTab[] = [
		{ order: -2, name: 'Recent', emoji: '🕐' },
		{ order: 0, name: 'Smileys & Emotion', emoji: '😀' },
		{ order: 1, name: 'People & Body', emoji: '👋' },
		{ order: 3, name: 'Animals & Nature', emoji: '🐶' },
		{ order: 4, name: 'Food & Drink', emoji: '🍕' },
		{ order: 5, name: 'Travel & Places', emoji: '✈️' },
		{ order: 6, name: 'Activities', emoji: '⚽' },
		{ order: 7, name: 'Objects', emoji: '💡' },
		{ order: 8, name: 'Symbols', emoji: '💯' },
		{ order: 9, name: 'Flags', emoji: '🏁' }
	];

	const allEmojis: EmojiItem[] = emojiData
		.filter((e) => e.emoji && e.group !== 2 && e.group !== undefined && e.subgroup !== undefined)
		.map((e) => ({
			emoji: e.emoji,
			label: e.label,
			hexcode: e.hexcode,
			tags: e.tags || [],
			group: e.group!,
			subgroup: e.subgroup!
		}));

	const emojisByCategory = $derived.by(() => {
		const filtered = allEmojis.filter((emoji) => {
			if (!debouncedSearchQuery.current) return true;
			const query = debouncedSearchQuery.current.toLowerCase();
			return (
				emoji.label.toLowerCase().includes(query) ||
				emoji.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		});

		if (debouncedSearchQuery.current) {
			return [{ group: -1, name: 'Search Results', emojis: filtered }];
		}

		if (selectedCategory === -2) {
			const recentEmojiItems = recentEmojis
				.map((emoji) => allEmojis.find((e) => e.emoji === emoji))
				.filter((e) => e !== undefined) as EmojiItem[];
			return [{ group: -2, name: 'Recent', emojis: recentEmojiItems }];
		}

		const categoryFiltered =
			selectedCategory !== null
				? filtered.filter((emoji) => emoji.group === selectedCategory)
				: filtered;

		const grouped: Record<number, EmojiItem[]> = {};
		categoryFiltered.forEach((emoji) => {
			const category = emoji.group;
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(emoji);
		});

		return Object.entries(grouped)
			.map(([groupOrder, emojis]) => ({
				group: parseInt(groupOrder),
				name: groupMap.get(parseInt(groupOrder)) || `Group ${groupOrder}`,
				emojis
			}))
			.sort((a, b) => a.group - b.group);
	});

	const virtualItemsList = $derived.by(() => {
		const items: VirtualItem[] = [];
		let currentIndex = 0;

		emojisByCategory.forEach((category) => {
			if (category.group !== -1 && selectedCategory === null && !debouncedSearchQuery.current) {
				items.push({
					type: 'category',
					name: category.name,
					order: category.group,
					startIndex: currentIndex
				});
				currentIndex++;
			}

			const rows = Math.ceil(category.emojis.length / COLUMNS);
			for (let i = 0; i < rows; i++) {
				const start = i * COLUMNS;
				const rowEmojis = category.emojis.slice(start, start + COLUMNS);
				items.push({
					type: 'row',
					emojis: rowEmojis,
					categoryOrder: category.group
				});
				currentIndex++;
			}
		});

		return items;
	});

	const virtualizerStore = $derived(
		scrollElement
			? createVirtualizer<HTMLElement, HTMLDivElement>({
					count: virtualItemsList.length,
					getScrollElement: () => scrollElement,
					estimateSize: (index) => {
						const item = virtualItemsList[index];
						return item.type === 'category' ? CATEGORY_HEIGHT : ROW_HEIGHT;
					},
					overscan: 5
				})
			: null
	);

	const virtualizer = $derived(virtualizerStore ? virtualizerStore : null);
	const virtualItems = $derived.by(() =>
		virtualizer && $virtualizer ? $virtualizer.getVirtualItems() : []
	);
	const totalSize = $derived.by(() =>
		virtualizer && $virtualizer ? $virtualizer.getTotalSize() : 0
	);

	function selectEmoji(emoji: string) {
		onEmojiSelect(emoji);
		recentEmojis = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 24);
		searchQuery = '';
		value = '';
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (!newOpen) {
			searchQuery = '';
			value = '';
			selectedCategory = null;
		}
	}

	function selectCategoryTab(categoryOrder: number) {
		selectedCategory = selectedCategory === categoryOrder ? null : categoryOrder;
		searchQuery = '';
		value = '';
		if (scrollElement) {
			scrollElement.scrollTop = 0;
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
	<Popover.Content class="w-96 p-0" align="start">
		<Command.Root bind:value>
			<Command.Input bind:value={searchQuery} placeholder="Search emojis..." class="h-9" />
			{#if !debouncedSearchQuery.current}
				<div class="border-b border-border px-2 py-2">
					<div class="flex flex-wrap items-center gap-1">
						{#each categoryTabs as tab (tab.order)}
							<button
								type="button"
								onclick={() => selectCategoryTab(tab.order)}
								class={cn(
									'flex h-10 w-10 items-center justify-center rounded-md text-2xl transition-colors hover:bg-accent',
									selectedCategory === tab.order && 'bg-accent'
								)}
								title={tab.name}
							>
								{tab.emoji}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if emojisByCategory.length === 0 || (emojisByCategory.length === 1 && emojisByCategory[0].emojis.length === 0)}
				<Command.Empty>No recent emojis.</Command.Empty>
			{:else}
				<div bind:this={scrollElement} class="max-h-80 overflow-y-auto p-2">
					<div style="height: {totalSize}px; width: 100%; position: relative;">
						{#each virtualItems as virtualItem (virtualItem.index)}
							{@const item = virtualItemsList[virtualItem.index]}
							<div
								style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px); height: {virtualItem.size}px;"
								data-index={virtualItem.index}
							>
								{#if item.type === 'category'}
									<div
										class="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
									>
										<h3 class="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
											{item.name}
										</h3>
									</div>
								{:else}
									<div class="grid grid-cols-8 gap-1">
										{#each item.emojis as emojiItem (emojiItem.hexcode)}
											<button
												type="button"
												onclick={() => selectEmoji(emojiItem.emoji)}
												class="flex cursor-pointer items-center justify-center rounded-md p-2 text-xl transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
												title={emojiItem.label}
											>
												{emojiItem.emoji}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</Command.Root>
	</Popover.Content>
</Popover.Root>

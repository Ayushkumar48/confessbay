<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import type { Conversation, User } from '$lib/shared';
	import { cn, getDisplayName, getInitials, getTimeAgo } from '$lib/utils';
	import UserIcon from '@lucide/svelte/icons/user';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import BellIcon from '@lucide/svelte/icons/bell';
	import BellOffIcon from '@lucide/svelte/icons/bell-off';
	import ArchiveIcon from '@lucide/svelte/icons/archive';
	import ArchiveRestoreIcon from '@lucide/svelte/icons/archive-restore';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import InfoIcon from '@lucide/svelte/icons/info';
	import BanIcon from '@lucide/svelte/icons/ban';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button';

	let { currentChatUser, conversation }: { currentChatUser: User; conversation: Conversation } =
		$props();

	const displayName = $derived(getDisplayName(currentChatUser));
	const initials = $derived(getInitials(displayName));
	const currentUserId = $derived(page.data.user?.id);
	const isUser1 = $derived(currentUserId === conversation.userId1);
	const unreadCount = $derived(
		isUser1 ? conversation.unreadCountForUser1 : conversation.unreadCountForUser2
	);
	const isArchived = $derived(
		isUser1 ? conversation.isArchivedByUser1 : conversation.isArchivedByUser2
	);
	const isMuted = $derived(isUser1 ? conversation.isMutedByUser1 : conversation.isMutedByUser2);

	function handleArchiveToggle() {
		console.log('Toggle archive for conversation:', conversation.id);
	}

	function handleMuteToggle() {
		console.log('Toggle mute for conversation:', conversation.id);
	}

	function handleBlockUser() {
		console.log('Block user:', currentChatUser.id);
	}

	function handleReportUser() {
		console.log('Report user:', currentChatUser.id);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="flex min-w-0 items-center gap-3 cursor-pointer hover:bg-accent/50 rounded-lg px-2 py-1 transition-colors"
	>
		<div class="relative">
			<Avatar class="h-10 w-10 ring-2 ring-primary/10">
				<AvatarImage src={currentChatUser?.avatar ?? ''} alt="{displayName}'s avatar" />
				<AvatarFallback class="bg-linear-to-br from-primary to-primary/70 text-primary-foreground">
					{initials}
				</AvatarFallback>
			</Avatar>
			<div
				class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
			></div>
		</div>
		<div class="min-w-0 flex-1">
			<p class="truncate font-semibold text-sm">{displayName}</p>
			<p class="truncate text-xs text-muted-foreground flex items-center gap-1">
				<span class="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
				Active now
			</p>
		</div>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-72" align="start">
		<div class="px-2 py-3 border-b">
			<div class="flex items-center gap-3">
				<Avatar class="h-12 w-12">
					<AvatarImage src={currentChatUser.avatar} alt="{displayName}'s avatar" />
					<AvatarFallback
						class="bg-linear-to-br from-primary to-primary/70 text-primary-foreground"
					>
						{initials}
					</AvatarFallback>
				</Avatar>
				<div class="min-w-0 flex-1">
					<p class="font-semibold text-sm truncate">{displayName}</p>
					{#if !currentChatUser.anonymous}
						<p class="text-xs text-muted-foreground truncate">{currentChatUser.email}</p>
					{/if}
					<p class="text-xs text-muted-foreground/80 truncate">@{currentChatUser.username}</p>
				</div>
			</div>
		</div>

		<DropdownMenu.Group>
			<div class="px-2 py-2 bg-muted/30">
				<div class="grid grid-cols-2 gap-2 text-center">
					<div class="py-2 rounded-md bg-background">
						<MessageSquareIcon class="h-4 w-4 mx-auto mb-1 text-primary" />
						<p class="text-xs font-semibold">{unreadCount}</p>
						<p class="text-xs text-muted-foreground">Unread</p>
					</div>
					<div class="py-2 rounded-md bg-background">
						<ClockIcon class="h-4 w-4 mx-auto mb-1 text-primary" />
						<p class="text-xs font-semibold">{getTimeAgo(conversation.updatedAt)}</p>
						<p class="text-xs text-muted-foreground">Last Active</p>
					</div>
				</div>
			</div>
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Item
				class="cursor-pointer gap-2"
				onclick={() => goto(resolve(`/u/${currentChatUser.username}`))}
			>
				<UserIcon class="h-4 w-4 text-muted-foreground" />
				<span>View Profile</span>
			</DropdownMenu.Item>

			{@render infoButton()}
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Label
				class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
			>
				Conversation Settings
			</DropdownMenu.Label>

			{@render muteDialog()}

			{@render archiveDialog()}

			<DropdownMenu.Item class="cursor-pointer gap-2">
				<SettingsIcon class="h-4 w-4 text-muted-foreground" />
				<span>Chat Settings</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Item
				class="cursor-pointer gap-2 text-amber-600 dark:text-amber-500 focus:text-amber-600 dark:focus:text-amber-500"
				onclick={handleBlockUser}
			>
				<BanIcon class="h-4 w-4" />
				<span>Block User</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item
				class="cursor-pointer gap-2 text-destructive focus:text-destructive"
				onclick={handleReportUser}
			>
				<FlagIcon class="h-4 w-4" />
				<span>Report User</span>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

{#snippet infoButton()}
	<Popover.Root>
		<Popover.Trigger class="cursor-pointer">
			{#snippet child({ props })}
				<DropdownMenu.Item class="gap-2" onSelect={(e) => e.preventDefault()} {...props}>
					<InfoIcon class="h-4 w-4 text-muted-foreground" />
					<span>Info</span>
				</DropdownMenu.Item>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			side="top"
			class="w-auto px-3 py-2.5 flex items-center gap-2.5 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border border-green-200 dark:border-green-800"
		>
			<div
				class="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50"
			>
				<ShieldCheckIcon class="h-4 w-4 text-green-600 dark:text-green-400" />
			</div>
			<div class="flex flex-col">
				<span class="text-xs font-semibold text-green-900 dark:text-green-100">
					End-to-End Encrypted
				</span>
				<span class="text-xs text-green-700 dark:text-green-300">
					Your chats are private & secure
				</span>
			</div>
		</Popover.Content>
	</Popover.Root>
{/snippet}

{#snippet muteDialog()}
	<Dialog.Root>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<DropdownMenu.Item
					{...props}
					class="cursor-pointer gap-2"
					onSelect={(e) => e.preventDefault()}
				>
					{#if isMuted}
						<BellIcon class="h-4 w-4 text-muted-foreground" />
						<span>Unmute Conversation</span>
					{:else}
						<BellOffIcon class="h-4 w-4 text-muted-foreground" />
						<span>Mute Conversation</span>
					{/if}
				</DropdownMenu.Item>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>
					{isMuted ? 'Unmute Conversation?' : 'Mute Conversation?'}
				</Dialog.Title>
				<Dialog.Description>
					{isMuted
						? 'Do you really want to unmute this conversation?'
						: 'Do you really want to mute this conversation?'}
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
					Cancel
				</Dialog.Close>
				<Dialog.Close
					class={cn(buttonVariants({ variant: 'destructive', size: 'sm' }))}
					onclick={handleMuteToggle}
				>
					{isMuted ? 'Unmute' : 'Mute'}
				</Dialog.Close>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet archiveDialog()}
	<Dialog.Root>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<DropdownMenu.Item
					{...props}
					class="cursor-pointer gap-2"
					onSelect={(e) => e.preventDefault()}
				>
					{#if isArchived}
						<ArchiveRestoreIcon class="h-4 w-4 text-muted-foreground" />
						<span>Unarchive Conversation</span>
					{:else}
						<ArchiveIcon class="h-4 w-4 text-muted-foreground" />
						<span>Archive Conversation</span>
					{/if}
				</DropdownMenu.Item>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>
					{isArchived ? 'Unarchive Conversation?' : 'Archive Conversation?'}
				</Dialog.Title>
				<Dialog.Description>
					{isArchived
						? 'Do you really want to unarchive this conversation?'
						: 'Do you really want to archive this conversation?'}
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
					Cancel
				</Dialog.Close>
				<Dialog.Close
					class={cn(buttonVariants({ variant: 'destructive', size: 'sm' }))}
					onclick={handleArchiveToggle}
				>
					{isArchived ? 'Unarchive' : 'Archive'}
				</Dialog.Close>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

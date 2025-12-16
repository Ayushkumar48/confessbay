<script lang="ts">
	import type { Chat, ChatWithReply, User } from '$lib/shared';
	import { cn, truncateText } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import { format } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import ForwardIcon from '@lucide/svelte/icons/forward';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ReplyIcon from '@lucide/svelte/icons/reply';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import BanIcon from '@lucide/svelte/icons/ban';
	import { useMessageVisibility } from '$lib/composables/use-message-visibility.svelte';
	import { socketConnection } from '$lib/ws-connection';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator';

	let {
		m,
		user,
		onReply,
		onMessageVisible,
		chatId,
		onMessageDeleted
	}: {
		m: ChatWithReply;
		user: User;
		onReply?: (message: Chat) => void;
		onMessageVisible?: (messageId: string) => void;
		chatId: string;
		onMessageDeleted?: (messageId: string) => void;
	} = $props();
	let messageOptionsOpen = $state(false);
	let messageElement = $state<HTMLDivElement | null>(null);
	let isDeleted = $derived(
		m.senderId === user.id ? m.isDeletedBySender : m.isDeletedBySender || m.isDeletedByReceiver
	);
	let shouldShowMessage = $derived(!isDeleted);
	let isSender = $derived(m.senderId === user.id);
	let isDeleting = $state(false);

	function getReplyName() {
		if (!m.reply) return '';
		if (m.reply.senderId === user.id) return 'You';
		return m.reply.sender?.firstName || 'Unknown';
	}

	async function handleDelete() {
		if (isDeleting) return;

		isDeleting = true;

		try {
			onMessageDeleted?.(m.id);
			socketConnection.emit('message:delete', {
				chatId,
				messageId: m.id,
				senderId: m.senderId,
				userId: user.id
			});

			toast.success('Message deleted');
		} catch (error) {
			console.error('Error deleting message:', error);
			toast.error('Failed to delete message');
		} finally {
			isDeleting = false;
			messageOptionsOpen = false;
		}
	}

	function handleForward() {
		console.log('Forward message:', m.id);
	}

	function handleCopy() {
		navigator.clipboard.writeText(m.message || '');
		messageOptionsOpen = false;
	}

	function handleReply() {
		messageOptionsOpen = false;
		onReply?.(m);
	}

	function handleReact() {
		console.log('React to message:', m.id);
	}

	function handleDownload() {
		console.log('Download message:', m.id);
	}

	useMessageVisibility(
		() => messageElement,
		m.id,
		m.senderId === user.id,
		!!m.readAt,
		(messageId) => {
			onMessageVisible?.(messageId);
		}
	);
</script>

{#if shouldShowMessage}
	<div
		bind:this={messageElement}
		class={cn('flex', m.senderId === user.id ? 'justify-end' : 'justify-start')}
		role="button"
		tabindex="0"
	>
		<div
			class={cn(
				'relative group max-w-[50vw] rounded-lg px-4 py-2',
				m.senderId === user.id ? 'bg-accent text-white' : 'bg-muted/10 text-foreground/90'
			)}
		>
			{#if m.reply}
				<div
					class={cn(
						'mb-2 rounded border-l-4 bg-black/10 px-2 py-1',
						m.senderId === user.id ? 'border-l-green-400' : 'border-l-cyan-400'
					)}
				>
					<p
						class={cn(
							'text-xs font-semibold',
							m.senderId === user.id ? 'text-green-400' : 'text-cyan-400'
						)}
					>
						{getReplyName()}
					</p>
					<p class="text-xs opacity-80">
						{truncateText(m.reply.message || '')}
					</p>
				</div>
			{/if}
			<p class="text-sm wrap-break-word">{m.message}</p>
			{#if m.createdAt}
				<div class="mt-1 flex items-center justify-end gap-1 text-xs text-foreground/60">
					<span>{format(m.createdAt, 'h:mm a')}</span>
					{#if m.senderId === user.id}
						<Check class={cn('size-3', m.readAt ? 'text-blue-500' : 'text-foreground/60')} />
					{/if}
				</div>
			{/if}
			{@render messageOptions()}
		</div>
	</div>
{:else if isSender && m.isDeletedBySender}
	<div
		bind:this={messageElement}
		class={cn('flex', m.senderId === user.id ? 'justify-end' : 'justify-start')}
	>
		<div class={cn('max-w-[50vw] rounded-lg px-4 py-2', 'bg-muted/5 border border-border/50')}>
			<div class="flex items-center gap-2">
				<BanIcon class="h-3.5 w-3.5 text-foreground/40" />
				<p class="text-sm italic text-foreground/50">You deleted this message</p>
			</div>
			{#if m.createdAt}
				<div class="mt-1 flex items-center justify-end gap-1 text-xs text-foreground/40">
					<span>{format(m.createdAt, 'h:mm a')}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#snippet messageOptions()}
	<Popover.Root bind:open={messageOptionsOpen}>
		<Popover.Trigger
			class={cn(
				buttonVariants({ variant: 'ghost', size: 'icon' }),
				'h-6 w-6 rounded-full bg-background shadow-md z-20',
				'absolute -top-2',
				m.senderId === user.id ? '-right-2' : '-left-2',
				'opacity-0 group-hover:opacity-100',
				'pointer-events-none group-hover:pointer-events-auto',
				'transition-opacity'
			)}
		>
			<ChevronDownIcon class="h-4 w-4" />
		</Popover.Trigger>
		<Popover.Content align={m.senderId === user.id ? 'end' : 'start'} class="w-48 p-2">
			<div class="flex flex-col gap-1">
				<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleReact}>
					<SmileIcon class="mr-2 h-4 w-4" />
					React
				</Button>
				<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleReply}>
					<ReplyIcon class="mr-2 h-4 w-4" />
					Reply
				</Button>
				<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleCopy}>
					<CopyIcon class="mr-2 h-4 w-4" />
					Copy
				</Button>
				<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleForward}>
					<ForwardIcon class="mr-2 h-4 w-4" />
					Forward
				</Button>
				{#if m.chatMessageType && m.chatMessageType !== 'text'}
					<Button variant="ghost" size="sm" class="w-full justify-start" onclick={handleDownload}>
						<DownloadIcon class="mr-2 h-4 w-4" />
						Download
					</Button>
				{/if}
				<Separator />
				{@render deleteMessageButton()}
			</div>
		</Popover.Content>
	</Popover.Root>
{/snippet}

{#snippet deleteMessageButton()}
	<Dialog.Root>
		<Dialog.Trigger
			class="flex h-9 w-full items-center justify-start rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-accent hover:text-destructive"
		>
			<TrashIcon class="mr-2 h-4 w-4" />
			{isSender ? 'Delete for everyone' : 'Delete for me'}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Delete Message?</Dialog.Title>
				<Dialog.Description>
					{#if isSender}
						Are you sure you want to delete this message? This will remove it for everyone in the
						chat.
					{:else}
						Are you sure you want to delete this message for yourself? The sender will still see it.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close
					class="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
				>
					Cancel
				</Dialog.Close>
				<Button variant="destructive" onclick={handleDelete} disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

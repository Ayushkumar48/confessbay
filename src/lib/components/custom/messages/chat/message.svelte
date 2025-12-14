<script lang="ts">
	import type { Chat, ChatWithReply, User } from '$lib/shared';
	import { cn, truncateText } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import { format } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import ForwardIcon from '@lucide/svelte/icons/forward';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ReplyIcon from '@lucide/svelte/icons/reply';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import DownloadIcon from '@lucide/svelte/icons/download';

	let {
		m,
		user,
		onReply
	}: {
		m: ChatWithReply;
		user: User;
		onReply?: (message: Chat) => void;
	} = $props();
	let messageOptionsOpen = $state(false);

	function getReplyName() {
		if (!m.reply) return '';
		if (m.reply.senderId === user.id) return 'You';
		return m.reply.sender?.firstName || 'Unknown';
	}

	function handleDelete() {
		console.log('Delete message:', m.id);
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
</script>

<div
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

{#snippet messageOptions()}
	<Popover.Root bind:open={messageOptionsOpen}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon"
					class={cn(
						'h-6 w-6 rounded-full bg-background shadow-md z-20',
						'absolute -top-2',
						m.senderId === user.id ? '-right-2' : '-left-2',
						'opacity-0 group-hover:opacity-100',
						'pointer-events-none group-hover:pointer-events-auto',
						'transition-opacity'
					)}
				>
					<ChevronDownIcon class="h-4 w-4" />
				</Button>
			{/snippet}
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
				<div class="my-1 h-px bg-border"></div>
				<Button
					variant="ghost"
					size="sm"
					class="w-full justify-start text-destructive hover:text-destructive"
					onclick={handleDelete}
				>
					<TrashIcon class="mr-2 h-4 w-4" />
					Delete
				</Button>
			</div>
		</Popover.Content>
	</Popover.Root>
{/snippet}

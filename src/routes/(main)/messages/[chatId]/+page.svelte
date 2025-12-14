<script lang="ts">
	// imports
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import Send from '@lucide/svelte/icons/send';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Camera from '@lucide/svelte/icons/camera';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import Check from '@lucide/svelte/icons/check';
	import { cn, getDisplayName } from '$lib/utils.js';
	import { socketConnection } from '../../../../lib/ws-connection';
	import type { ChatsInsertSchema } from '$lib/client/schema.js';
	import type z from 'zod';
	import { onMount } from 'svelte';
	import AvatarDropdown from '$lib/components/custom/messages/chat/avatar-dropdown.svelte';
	import type { Chat } from '$lib/shared/schema.js';
	import { format } from 'date-fns';
	import { Debounced } from 'runed';
	// types
	type Message = z.infer<ChatsInsertSchema>;
	// states
	const { data } = $props();
	let { currentChatUser, conversation, messages, chatId, isUserOnline } = $derived(data);
	let messagesContainer: HTMLDivElement | undefined = $state();
	let newMessage = $state('');
	const currentUserId = $derived(data.user.id);
	const isUser1 = $derived(currentUserId === conversation?.userId1);
	const isBlocked = $derived(
		isUser1 ? conversation?.isBlockedByUser1 : conversation?.isBlockedByUser2
	);
	const isBlockedByOther = $derived(
		isUser1 ? conversation?.isBlockedByUser2 : conversation?.isBlockedByUser1
	);
	const canSendMessages = $derived(!isBlocked && !isBlockedByOther);
	let isTyping = $state(false);
	let isUserTyping = $state(false);
	const debouncedTyping = new Debounced(() => isUserTyping, 1000);
	// other
	$effect(() => {
		if (messagesContainer && messages && messages.length > 0) {
			setTimeout(() => {
				scrollToBottom();
			}, 0);
		}
	});

	$effect(() => {
		if (debouncedTyping.current) {
			socketConnection.emit('typing:start', chatId);
		} else {
			socketConnection.emit('typing:stop', chatId);
		}
	});
	onMount(() => {
		socketConnection.joinRoom(chatId);
		const messageHandler = (message: Chat) => {
			messages = [...messages, message];
		};
		const typingStartHandler = () => {
			isTyping = true;
		};
		const typingStopHandler = () => {
			isTyping = false;
		};

		socketConnection.on('message', messageHandler);
		socketConnection.on('typing:start', typingStartHandler);
		socketConnection.on('typing:stop', typingStopHandler);

		return () => {
			socketConnection.off('message', messageHandler);
			socketConnection.off('typing:start', typingStartHandler);
			socketConnection.off('typing:stop', typingStopHandler);
			socketConnection.leaveRoom(chatId);
		};
	});
	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}
	function sendMessage() {
		if (!canSendMessages) return;
		const message = newMessage.trim();
		if (!message) return;
		socketConnection.emit('message', {
			chatId: chatId,
			message
		});
		newMessage = '';
	}
	function handleTyping() {
		isUserTyping = true;
	}
	function handleStopTyping() {
		isUserTyping = false;
	}
</script>

<main class="flex flex-1 flex-col">
	<div class="flex items-center justify-between gap-3 border-b border-border px-6 py-2">
		{#if currentChatUser && conversation}
			<AvatarDropdown
				{currentChatUser}
				bind:conversation
				bind:isUserTyping={isTyping}
				{isUserOnline}
			/>
		{/if}

		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" aria-label="Attach">
				<Paperclip class="size-5 text-foreground/80" />
			</Button>
			<Button variant="ghost" size="icon" aria-label="Camera">
				<Camera class="size-5 text-foreground/80" />
			</Button>
			<Button variant="ghost" size="icon" aria-label="More">
				<MoreVertical class="size-5 text-foreground/80" />
			</Button>
		</div>
	</div>

	<div
		bind:this={messagesContainer}
		class="flex-1 space-y-4 overflow-y-auto bg-[url('/patterns/chat-bg.svg')] bg-repeat p-6"
	>
		{#if messages && messages.length > 0}
			{#each messages as m (m.id)}
				{@render message(m)}
			{/each}
		{:else}
			<div class="text-center text-foreground/60">No messages yet — say hello 👋</div>
		{/if}
	</div>

	<div class="border-t border-border px-4 py-3">
		{#if isBlocked}
			<div class="flex items-center justify-center gap-2 py-2 text-red-600 dark:text-red-400">
				<BanIcon class="h-4 w-4" />
				<span class="text-sm font-medium">
					You blocked {currentChatUser ? getDisplayName(currentChatUser) : 'this user'}. Unblock to
					send messages.
				</span>
			</div>
		{:else if isBlockedByOther}
			<div class="flex items-center justify-center gap-2 py-2 text-amber-600 dark:text-amber-400">
				<ShieldIcon class="h-4 w-4" />
				<span class="text-sm font-medium">
					{currentChatUser ? getDisplayName(currentChatUser) : 'This user'} has blocked you. You cannot
					send messages.
				</span>
			</div>
		{:else}
			<div class="flex items-center gap-3">
				<Input
					placeholder="Type a message"
					bind:value={newMessage}
					class="flex-1"
					disabled={!canSendMessages}
					oninput={handleTyping}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleStopTyping();
							sendMessage();
						}
					}}
					onblur={handleStopTyping}
				/>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Send"
					onclick={sendMessage}
					disabled={!canSendMessages}
				>
					<Send class="size-5 text-foreground/90" />
				</Button>
			</div>
		{/if}
	</div>
</main>

{#snippet message(m: Message)}
	<div class={cn('flex', m.senderId === data.user.id ? 'justify-end' : 'justify-start')}>
		<div
			class={cn(
				'max-w-[50vw] rounded-lg px-4 py-2',
				m.senderId === data.user.id ? 'bg-accent text-white' : 'bg-muted/10 text-foreground/90'
			)}
		>
			<p class="text-sm wrap-break-word">{m.message}</p>
			{#if m.createdAt}
				<div class="mt-1 flex items-center justify-end gap-1 text-xs text-foreground/60">
					<span>{format(m.createdAt, 'h:mm a')}</span>
					{#if m.senderId === data.user.id}
						<Check class={cn('size-3', m.readAt ? 'text-blue-500' : 'text-foreground/60')} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

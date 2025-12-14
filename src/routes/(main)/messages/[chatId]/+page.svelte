<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import Send from '@lucide/svelte/icons/send';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import XIcon from '@lucide/svelte/icons/x';
	import { cn, getDisplayName, truncateText } from '$lib/utils.js';
	import { socketConnection } from '../../../../lib/ws-connection';
	import { onMount } from 'svelte';
	import AvatarDropdown from '$lib/components/custom/messages/chat/avatar-dropdown.svelte';
	import type { Chat, ChatWithReply } from '$lib/shared/schema.js';
	import { Debounced } from 'runed';
	import ChatAttachements from '$lib/components/custom/messages/chat/chat-attachements.svelte';
	import EmojiList from '$lib/components/emoji-list.svelte';
	import Message from '$lib/components/custom/messages/chat/message.svelte';

	const { data } = $props();
	let { currentChatUser, conversation, messages, chatId, isUserOnline } = $derived(data);
	let messagesContainer: HTMLDivElement | undefined = $state();
	let textareaElement: HTMLTextAreaElement | null = $state(null);
	let newMessage = $state('');
	let replyingTo = $state<Chat | null>(null);
	const currentUserId = $derived(data.user.id);
	const isUser1 = $derived(currentUserId === conversation?.userId1);
	const isBlocked = $derived(
		isUser1 ? conversation?.isBlockedByUser1 : conversation?.isBlockedByUser2
	);
	const isBlockedByOther = $derived(
		isUser1 ? conversation?.isBlockedByUser2 : conversation?.isBlockedByUser1
	);
	let canSendMessages = $derived(!isBlocked && !isBlockedByOther);
	let isTyping = $state(false);
	let isUserTyping = $state(false);
	const debouncedTyping = new Debounced(() => isUserTyping, 1000);

	let pendingReadMessageIds = $state<Set<string>>(new Set());
	let readReceiptTimer: ReturnType<typeof setTimeout> | null = null;
	let hasScrolledToUnread = $state(false);

	$effect(() => {
		if (messagesContainer && messages && messages.length > 0 && !hasScrolledToUnread) {
			setTimeout(() => {
				if (!messagesContainer) return;

				const firstUnreadIndex = messages.findIndex(
					(m) => m.senderId !== data.user.id && !m.readAt
				);

				if (firstUnreadIndex !== -1) {
					const messageElements = messagesContainer.querySelectorAll('[data-message-id]');
					const firstUnreadElement = messageElements[firstUnreadIndex];
					if (firstUnreadElement) {
						firstUnreadElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
						hasScrolledToUnread = true;
					}
				} else {
					scrollToBottom();
					hasScrolledToUnread = true;
				}
			}, 100);
		}
	});

	$effect(() => {
		if (debouncedTyping.current) {
			socketConnection.emit('typing:start', chatId);
		} else {
			socketConnection.emit('typing:stop', chatId);
		}
	});

	function messageHandler(message: ChatWithReply) {
		const wasAtBottom = isScrolledToBottom();
		messages = [...messages, message];

		if (message.senderId === data.user.id && replyingTo) {
			replyingTo = null;
		}
		if (wasAtBottom) {
			setTimeout(() => {
				scrollToBottom();
			}, 0);
		}
	}

	function messagesReadHandler({ messageIds }: { messageIds: string[] }) {
		messages = messages.map((m) => {
			if (messageIds.includes(m.id)) {
				return { ...m, readAt: new Date() };
			}
			return m;
		});
	}

	function handleMessageVisible(messageId: string) {
		pendingReadMessageIds.add(messageId);
		if (readReceiptTimer) {
			clearTimeout(readReceiptTimer);
		}
		readReceiptTimer = setTimeout(() => {
			if (pendingReadMessageIds.size > 0) {
				const messageIds = Array.from(pendingReadMessageIds);
				socketConnection.emit('messages:read', {
					chatId,
					messageIds
				});
				messages = messages.map((m) => {
					if (messageIds.includes(m.id)) {
						return { ...m, readAt: new Date() };
					}
					return m;
				});

				pendingReadMessageIds.clear();
			}
		}, 500);
	}

	function typingStartHandler() {
		isTyping = true;
	}

	function typingStopHandler() {
		isTyping = false;
	}
	onMount(() => {
		socketConnection.joinRoom(chatId);

		socketConnection.on('message', messageHandler);
		socketConnection.on('messages:read', messagesReadHandler);
		socketConnection.on('typing:start', typingStartHandler);
		socketConnection.on('typing:stop', typingStopHandler);

		return () => {
			socketConnection.off('message', messageHandler);
			socketConnection.off('messages:read', messagesReadHandler);
			socketConnection.off('typing:start', typingStartHandler);
			socketConnection.off('typing:stop', typingStopHandler);
			socketConnection.leaveRoom(chatId);

			if (readReceiptTimer) {
				clearTimeout(readReceiptTimer);
			}
		};
	});
	function isScrolledToBottom() {
		if (!messagesContainer) return true;
		const threshold = 100;
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
		return scrollHeight - scrollTop - clientHeight < threshold;
	}

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
			message,
			replyTo: replyingTo?.id || null
		});
		newMessage = '';
	}
	function handleTyping() {
		isUserTyping = true;
	}
	function handleStopTyping() {
		isUserTyping = false;
	}

	function handleAttachment(type: string) {
		console.log('Attachment type:', type);
	}

	function handleReplyTo(message: Chat) {
		replyingTo = message;
		setTimeout(() => {
			textareaElement?.focus();
		}, 0);
	}

	function cancelReply() {
		replyingTo = null;
	}

	function getReplyName(message: Chat) {
		if (message.senderId === data.user.id) return 'You';
		return currentChatUser?.firstName || 'Unknown';
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
	</div>

	<div
		bind:this={messagesContainer}
		class="flex-1 space-y-4 overflow-y-auto bg-[url('/patterns/chat-bg.svg')] bg-repeat p-6"
	>
		{#if messages && messages.length > 0}
			{#each messages as m (m.id)}
				<div data-message-id={m.id}>
					<Message
						{m}
						user={data.user}
						onReply={handleReplyTo}
						onMessageVisible={handleMessageVisible}
					/>
				</div>
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
			<div class="flex flex-col gap-2">
				{#if replyingTo}
					<div
						class="flex items-center gap-2 rounded-t-lg border-l-4 border-l-green-500 bg-muted/50 px-3 py-2"
					>
						<div class="flex-1">
							<p class="text-xs font-semibold text-green-500">{getReplyName(replyingTo)}</p>
							<p class="text-xs text-muted-foreground">
								{truncateText(replyingTo.message || '', 80)}
							</p>
						</div>
						<Button variant="ghost" size="icon" class="h-6 w-6" onclick={cancelReply}>
							<XIcon class="h-4 w-4" />
						</Button>
					</div>
				{/if}

				<div class="relative flex items-center gap-2">
					<ChatAttachements bind:canSendMessages {handleAttachment} />
					<EmojiList onEmojiSelect={(emoji) => (newMessage += emoji)}>
						{#snippet children({ props })}
							<Button {...props} variant="ghost" size="icon" aria-label="Emoji">
								<SmileIcon class="size-5 text-foreground/80" />
							</Button>
						{/snippet}
					</EmojiList>
					<Textarea
						bind:ref={textareaElement}
						placeholder="Type a message"
						bind:value={newMessage}
						class={cn('min-h-11 max-h-32 flex-1 resize-none', replyingTo && 'rounded-t-none')}
						disabled={!canSendMessages}
						oninput={handleTyping}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleStopTyping();
								sendMessage();
							}
						}}
						onblur={handleStopTyping}
						rows={1}
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
			</div>
		{/if}
	</div>
</main>

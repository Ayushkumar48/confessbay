<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Search from '@lucide/svelte/icons/search';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Check from '@lucide/svelte/icons/check';
	import { resolve } from '$app/paths';
	import { cn, getDisplayName, getInitials, getWhatsAppTime } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import { socketConnection } from '$lib/ws-connection';
	import type { Chat, Conversation } from '$lib/shared';

	type UnreadUpdateEvent = {
		conversationId: string;
		unreadCount: number;
	};

	let { children, data } = $props();
	let conversations = $derived(data.conversations);

	let q = $state('');

	let filtered = $derived(
		q.trim() && conversations
			? conversations.filter((c) =>
					c.otherUser.firstName.toLowerCase().includes(q.trim().toLowerCase())
				)
			: conversations
	);
	function chatStatHandler(c: Conversation) {
		conversations = conversations.map((item) =>
			item.conversation.id === c.id ? { ...item, conversation: c } : item
		);
	}
	function messageHandler(message: Chat) {
		conversations = conversations.map((c) => {
			if (c.conversation.id === message.conversationId) {
				return {
					...c,
					lastMessage: {
						...message,
						message: message.message ?? undefined
					}
				};
			}
			return c;
		});
	}
	function messagesReadHandler({ messageIds }: { messageIds: string[] }) {
		conversations = conversations.map((c) => {
			if (c.lastMessage?.id && messageIds.includes(c.lastMessage.id)) {
				return {
					...c,
					lastMessage: {
						...c.lastMessage,
						readAt: new Date()
					}
				};
			}
			return c;
		});
	}
	function unreadUpdateHandler({ conversationId, unreadCount }: UnreadUpdateEvent) {
		conversations = conversations.map((c) => {
			if (c.conversation.id !== conversationId) return c;

			const isUser1 = c.conversation.userId1 === data.user.id;

			return {
				...c,
				conversation: {
					...c.conversation,
					unreadCountForUser1: isUser1 ? unreadCount : c.conversation.unreadCountForUser1,
					unreadCountForUser2: !isUser1 ? unreadCount : c.conversation.unreadCountForUser2
				}
			};
		});
	}

	onMount(() => {
		socketConnection.on('chat-stats', chatStatHandler);
		socketConnection.on('message', messageHandler);
		socketConnection.on('messages:read', messagesReadHandler);
		socketConnection.on('unread:update', unreadUpdateHandler);

		return () => {
			socketConnection.off('chat-stats', chatStatHandler);
			socketConnection.off('message', messageHandler);
			socketConnection.off('messages:read', messagesReadHandler);
			socketConnection.off('unread:update', unreadUpdateHandler);
		};
	});
</script>

<div class="flex h-[calc(100vh-4rem)]">
	<aside class="flex w-1/3 max-w-[380px] min-w-[260px] flex-col border-r border-accent-foreground">
		<div class="flex items-center gap-3 border-b border-border px-4 py-1.5">
			<div class="flex-1">
				<h2 class="text-lg font-semibold">Messages</h2>
				<p class="text-xs text-foreground/60">Recent</p>
			</div>
			<div class="flex items-center gap-2">
				<Button size="icon" variant="ghost" aria-label="New chat">
					<MessageCircle class="size-5 text-foreground/80" />
				</Button>
				<Button size="icon" variant="ghost" aria-label="More options">
					<MoreVertical class="size-5 text-foreground/80" />
				</Button>
			</div>
		</div>

		<div class="border-b border-border px-4 py-3">
			<div class="relative">
				<Input placeholder="Search or start new chat" class="w-full ps-10 pe-3" bind:value={q} />
				<div class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">
					<Search class="size-4 text-foreground/50" />
				</div>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			<ul class="divide-y divide-border">
				{#each filtered as chat (chat.otherUser.id)}
					{@const displayName = getDisplayName(chat.otherUser)}
					{@const initials = getInitials(displayName)}
					{@const isUser1 = chat.conversation.userId1 === data.user.id}
					{@const unreadCount = isUser1
						? chat.conversation.unreadCountForUser1
						: chat.conversation.unreadCountForUser2}
					{@const isMuted = isUser1
						? chat.conversation.isMutedByUser1
						: chat.conversation.isMutedByUser2}
					{@const isMyMessage = chat.lastMessage.senderId === data.user.id}
					{@const isRead = !!chat.lastMessage.readAt}
					<li>
						<a
							href={resolve(`/messages/${chat.conversation.id}`)}
							class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 hover:ring-[0.1px]"
							onclick={() => {
								conversations = conversations.map((c) =>
									c.conversation.id === chat.conversation.id
										? {
												...c,
												conversation: {
													...c.conversation,
													unreadCountForUser1:
														c.conversation.userId1 === data.user.id
															? 0
															: c.conversation.unreadCountForUser1,
													unreadCountForUser2:
														c.conversation.userId2 === data.user.id
															? 0
															: c.conversation.unreadCountForUser2
												}
											}
										: c
								);
							}}
						>
							<Avatar class="flex-none">
								{#if chat.otherUser.avatar}
									<AvatarImage src={chat.otherUser.avatar} alt={displayName} />
									<AvatarFallback>{initials}</AvatarFallback>
								{:else}
									<AvatarFallback>
										{initials}
									</AvatarFallback>
								{/if}
							</Avatar>
							<div class="w-full min-w-0 flex-1">
								<div class="flex w-full items-center justify-between gap-2">
									<div class="min-w-0 w-full">
										<div class="flex items-center gap-2 justify-between">
											<p class="truncate text-sm font-medium" title={displayName}>
												{displayName}
											</p>
											<div class="flex items-center gap-1">
												<span class="text-xs text-foreground/60 text-nowrap">
													{getWhatsAppTime(chat.otherUser.lastSeenAt)}
												</span>
												{#if isMuted}
													<BellOff class="size-3.5 text-foreground/60" />
												{/if}
											</div>
										</div>
										<div class="mt-1 flex items-center gap-1">
											{#if isMyMessage}
												<Check
													class={cn(
														'size-3 shrink-0',
														isRead ? 'text-blue-500' : 'text-foreground/60'
													)}
												/>
											{/if}
											<p
												class="truncate text-xs text-foreground/60"
												title={chat.lastMessage.message}
											>
												{chat.lastMessage.message || 'No messages yet'}
											</p>
										</div>
									</div>
									<div>
										{#if unreadCount > 0}
											<span
												class="inline-flex items-center justify-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white"
											>
												{unreadCount}
											</span>
										{/if}
									</div>
								</div>
							</div>
						</a>
					</li>
				{/each}
				{#if filtered && filtered.length === 0}
					<li class="px-4 py-6 text-center text-foreground/60">No chats found</li>
				{/if}
			</ul>
		</div>
		<div class="flex items-center gap-2 border-t border-border px-4 py-3">
			<Button variant="ghost" class="w-full">New Group</Button>
		</div>
	</aside>
	{@render children()}
</div>

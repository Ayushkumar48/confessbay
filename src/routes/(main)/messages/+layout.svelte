<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Search from '@lucide/svelte/icons/search';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import { resolve } from '$app/paths';
	import { getDisplayName, getInitials, getTimeAgo } from '$lib/utils.js';

	let { children, data } = $props();
	const conversations = $derived(data.conversations);

	let q = $state('');

	let filtered = $derived(
		q.trim() && conversations
			? conversations.filter((c) =>
					c.otherUser.firstName.toLowerCase().includes(q.trim().toLowerCase())
				)
			: conversations
	);
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
					<li>
						<a
							href={resolve(`/messages/${chat.conversation.id}`)}
							class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 hover:ring-[0.1px]"
						>
							<Avatar class="flex-none">
								{#if chat.otherUser.avatar}
									<AvatarImage src={chat.otherUser.avatar} alt={getDisplayName(chat.otherUser)} />
									<AvatarFallback>{getDisplayName(chat.otherUser).slice(0, 1)}</AvatarFallback>
								{:else}
									<AvatarFallback>
										{getInitials(getDisplayName(chat.otherUser))}
									</AvatarFallback>
								{/if}
							</Avatar>

							<div class="w-full min-w-0 flex-1">
								<div class="flex w-full items-center justify-between gap-2">
									<div class="min-w-0">
										<div class="flex items-center gap-2">
											<p class="truncate text-sm font-medium">{getDisplayName(chat.otherUser)}</p>
											<span class="truncate text-xs text-foreground/60">
												{chat.lastMessage.createdAt
													? getTimeAgo(new Date(chat.lastMessage.createdAt))
													: ''}
											</span>
										</div>
										<p class="mt-1 truncate text-xs text-foreground/60">
											{chat.lastMessage.message || 'No messages yet'}
										</p>
									</div>
									<div>
										{#if (chat.conversation.userId1 === data.user?.id ? chat.conversation.unreadCountForUser1 : chat.conversation.unreadCountForUser2) > 0}
											<span
												class="inline-flex items-center justify-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white"
											>
												{chat.conversation.userId1 === data.user?.id
													? chat.conversation.unreadCountForUser1
													: chat.conversation.unreadCountForUser2}
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

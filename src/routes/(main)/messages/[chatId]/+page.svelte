<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import Send from '@lucide/svelte/icons/send';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Camera from '@lucide/svelte/icons/camera';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import { page } from '$app/state';
	import { cn, getDisplayName, getInitials, getTimeAgo } from '$lib/utils.js';
	import { getConversationForChat, getMessagesWithChatId } from './data.remote.js';
	import { createSocket } from '../../../../lib/ws-connection';
	import type { ChatsInsertSchema } from '$lib/client/schema.js';
	import type z from 'zod';
	import { onMount } from 'svelte';
	const io = createSocket(page.params.chatId!);

	type Message = z.infer<ChatsInsertSchema>;

	let messagesContainer: HTMLDivElement | undefined = $state();
	const { currentChatUser, conversation } = $derived(
		await getConversationForChat({ chatId: page.params.chatId })
	);

	let newMessage = $state('');

	const nameOfUser = $derived(getInitials(getDisplayName(currentChatUser)));
	let messages = $derived<Message[]>(await getMessagesWithChatId({ chatId: page.params.chatId! }));
	$effect(() => {
		if (messagesContainer && messages && messages.length > 0) {
			setTimeout(() => {
				scrollToBottom();
			}, 0);
		}
	});

	onMount(() => {
		const handler = (message: z.infer<ChatsInsertSchema>) => {
			messages = [...messages, message];
		};
		io.on('message', handler);
		return () => {
			io.off('message', handler);
		};
	});

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function sendMessage() {
		const message = newMessage.trim();
		if (!message) return;
		io.emit('message', {
			chatId: page.params.chatId,
			message
		});
		newMessage = '';
	}
</script>

<main class="flex flex-1 flex-col">
	<div class="flex items-center justify-between gap-3 border-b border-border px-6 py-2">
		<div class="flex min-w-0 items-center gap-3">
			<Avatar>
				<AvatarImage src={currentChatUser?.avatar ?? ''} alt="User avatar" />
				<AvatarFallback>
					{nameOfUser}
				</AvatarFallback>
			</Avatar>
			<div class="min-w-0">
				<p class="truncate font-medium">{nameOfUser}</p>
				<p class="truncate text-xs text-foreground/60">Online</p>
			</div>
		</div>

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
		<div class="flex items-center gap-3">
			<Input
				placeholder="Type a message"
				bind:value={newMessage}
				class="flex-1"
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						sendMessage();
					}
				}}
			/>
			<Button variant="ghost" size="icon" aria-label="Send" onclick={sendMessage}>
				<Send class="size-5 text-foreground/90" />
			</Button>
		</div>
	</div>
</main>

{#snippet message(m: Message)}
	<div class={cn('flex', m.senderId === page.data.user.id ? 'justify-end' : 'justify-start')}>
		<div
			class={cn(
				'max-w-[50vw] rounded-lg px-4 py-2',
				m.senderId === page.data.user.id ? 'bg-accent text-white' : 'bg-muted/10 text-foreground/90'
			)}
		>
			<p class="text-sm wrap-break-word">{m.message}</p>
			{#if m.createdAt}
				<div class="mt-1 text-right text-xs text-foreground/60">
					{getTimeAgo(m.createdAt)}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

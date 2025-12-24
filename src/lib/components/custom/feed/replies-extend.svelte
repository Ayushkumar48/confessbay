<script lang="ts">
	import type { ReplyWithUser } from '$lib/shared';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { cn, generateUserId, getDisplayName, getInitials, getTimeAgo } from '$lib/utils';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { toast } from 'svelte-sonner';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { deleteReply, newReply } from '../../../../routes/(main)/feed/data.remote';
	import { page } from '$app/state';

	let { replies: repliesNR, confessionId }: { replies: ReplyWithUser[]; confessionId: string } =
		$props();
	let replies = $derived(repliesNR);
	let replyMessage = $state('');
	let isSubmitting = $state(false);
	let deleteDialogReplyId = $state<string | null>(null);

	export function rollOpen(
		node: Element,
		{ delay = 0, duration = 250 }: { delay?: number; duration?: number } = {}
	): TransitionConfig {
		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number) => `
				transform: scaleY(${t}) rotateX(${(1 - t) * 90}deg);
				transform-origin: top;
				opacity: ${t};
			`
		};
	}

	export function rollClose(
		_node: Element,
		{ delay = 0, duration = 250 }: { delay?: number; duration?: number } = {}
	): TransitionConfig {
		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number) => `
				transform: scaleY(${t}) rotateX(${(1 - t) * 90}deg);
				transform-origin: top;
				opacity: ${t};
			`
		};
	}
	async function handleNewReply() {
		const res = await newReply({
			id: generateUserId(),
			userId: page.data.user.id,
			confessionId,
			message: replyMessage
		});
		if (res.success && res.reply) {
			replies = [res.reply, ...replies];
			replyMessage = '';
		} else {
			toast.error(res.message);
		}
	}
	async function handleDeleteReply(replyId: string) {
		const res = await deleteReply({
			replyId
		});
		if (res.success) {
			deleteDialogReplyId = null;
			replies = replies.filter((item) => item.id !== replyId);
			toast.success('Reply deleted');
		} else {
			toast.error(res.message);
		}
	}
</script>

<div in:rollOpen out:rollClose class="flex origin-top flex-col justify-center px-6">
	{@render newReplyButton()}
	<h4 class="mb-2 text-sm font-semibold text-foreground">
		Replies ({replies.length})
	</h4>

	<div class="space-y-3">
		{#each replies as reply (reply.id)}
			<Card.Root class="border-l-4 border-l-primary/20 bg-muted/30 py-3">
				<Card.Content>
					<div class="flex items-start gap-3">
						<Avatar class="h-8 w-8">
							<AvatarImage src={reply.user?.avatar} alt={reply.user?.username} />
							<AvatarFallback class="bg-primary/10 text-xs font-semibold text-primary">
								{getInitials(reply.user ? getDisplayName(reply.user) : 'X')}
							</AvatarFallback>
						</Avatar>

						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<div class="mb-2 flex items-center gap-2">
									<span class="text-sm font-medium text-foreground">
										@{reply.user?.username}
									</span>
									<span class="text-xs text-muted-foreground">
										{getTimeAgo(reply.createdAt)}
									</span>
								</div>
								{@render replySideDropdown(reply.id)}

								<!-- Will add the functionality later -->
								<!-- <div>
										<Button variant="ghost" size="icon-sm" class="hover:text-yellow-400">
											<ThumbsUp />
										</Button>
										<Button variant="ghost" size="icon-sm" class="hover:text-yellow-400">
											<ThumbsDown />
										</Button>
									</div> -->
							</div>
							<p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
								{reply.message}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="py-8 text-center text-muted-foreground">
				<p class="text-sm">No replies yet. Be the first to respond!</p>
			</div>
		{/each}
	</div>
</div>

{#snippet replySideDropdown(replyId: string)}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }))}>
			<EllipsisIcon />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={() => (deleteDialogReplyId = replyId)}>
				<Trash2Icon class="mr-2 h-4 w-4" />
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<Dialog.Root
		open={deleteDialogReplyId === replyId}
		onOpenChange={(v) => !v && (deleteDialogReplyId = null)}
	>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete this reply.
				</Dialog.Description>
			</Dialog.Header>
			<Button variant="ghost" onclick={() => (deleteDialogReplyId = null)}>Cancel</Button>
			<Button variant="destructive" onclick={() => handleDeleteReply(replyId)}>Delete</Button>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet newReplyButton()}
	<Card.Root class="mb-4 border-dashed border-muted-foreground/30 py-4">
		<Card.Content class="flex items-start gap-3">
			<Avatar class="h-8 w-8">
				<AvatarImage
					src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user"
					alt="Your avatar"
				/>
				<AvatarFallback class="bg-primary/10 text-xs font-semibold text-primary">
					YOU
				</AvatarFallback>
			</Avatar>

			<div class="min-w-0 flex-1">
				<div class="mb-2">
					<span class="text-sm font-medium text-foreground">Write a reply...</span>
					<Textarea
						bind:value={replyMessage}
						placeholder="Share your thoughts on this confession..."
						class="max-h-[50vh] min-h-20 resize-none border-muted-foreground/20 focus:border-primary/50"
						disabled={isSubmitting}
					/>

					<div class="flex justify-end pt-2">
						<Button
							size="sm"
							disabled={!replyMessage.trim() || isSubmitting}
							onclick={handleNewReply}
							class="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						>
							{#if isSubmitting}
								<Spinner />
								Sending...
							{:else}
								<SendIcon class="mr-2 h-3 w-3" />
								Reply
							{/if}
						</Button>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/snippet}

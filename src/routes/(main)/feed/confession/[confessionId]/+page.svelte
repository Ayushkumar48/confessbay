<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';

	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import UserIcon from '@lucide/svelte/icons/user';
	import SendIcon from '@lucide/svelte/icons/send';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import LockIcon from '@lucide/svelte/icons/lock';
	import {
		cn,
		formatDate,
		generateRandomAvatarUrl,
		generateRandomName,
		generateUserId,
		getDisplayName,
		getInitials,
		getTimeAgo,
		visibilityIconConfig
	} from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import ShareDialog from '$lib/components/share-dialog.svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { getConfessionWithId } from './data.remote';
	import { likePost, newReply } from '../../data.remote';

	let confession = $state(
		await getConfessionWithId({
			userId: page.data.user.id,
			confessionId: page.params.confessionId
		})
	);
	let currentUserLiked = $state(confession.currentUserLiked);
	let likeAnimationKey = $state(0);
	let replyMessage = $state('');
	const confessedFromAvatar = $derived(
		confession.confessedFromUser && !confession.confession.isAnonymous
			? confession.confessedFromUser.avatar
			: generateRandomAvatarUrl(confession.confession.id)
	);
	let isSubmitting = $state(false);
	async function handleNewReply() {
		const res = await newReply({
			id: generateUserId(),
			userId: page.data.user.id,
			confessionId: confession.confession.id,
			message: replyMessage
		});
		if (res.success && res.reply) {
			confession.replies = [res.reply, ...confession.replies];
			replyMessage = '';
		} else {
			toast.error(res.message);
		}
	}
	async function handleLikeClick() {
		const res = await likePost({
			confessionId: confession.confession.id,
			userId: page.data.user.id
		});
		const previousLiked = currentUserLiked;
		currentUserLiked = !previousLiked;
		likeAnimationKey++;
		confession.confession.likes += currentUserLiked ? 1 : -1;
		if (!res.success) {
			currentUserLiked = previousLiked;
			confession.confession.likes += currentUserLiked ? 1 : -1;
			toast.error(res.message);
		}
	}
</script>

<svelte:head>
	<title>Confession • ConfessBay</title>
	<meta name="description" content="View confession details and replies" />
</svelte:head>

<div class="w-full px-4 py-8">
	<div class="flex items-start justify-between gap-x-8">
		<div class="w-[65%] space-y-6 lg:col-span-2">
			<div
				class="relative space-y-6 overflow-hidden rounded-2xl bg-card p-8 shadow-lg ring-1 ring-gray-100 dark:ring-gray-800"
			>
				<div class="flex items-start justify-between">
					<div class="flex items-center gap-4">
						<div class="relative">
							<Avatar class="h-20 w-20 border-4 border-white shadow-lg dark:border-card">
								<AvatarImage src={confessedFromAvatar} alt="User avatar" />
								<AvatarFallback
									class="bg-linear-to-br from-primary/20 to-secondary/20 text-2xl font-bold text-primary"
								>
									{confession.confession.isAnonymous || !confession.confessedFromUser
										? 'ANON'
										: getInitials(getDisplayName(confession.confessedFromUser))}
								</AvatarFallback>
							</Avatar>
							{#if confession.confession.isAnonymous}
								<div class="absolute -right-1 -bottom-1 rounded-full bg-purple-100 p-1">
									<LockIcon class="h-4 w-4 text-purple-600" />
								</div>
							{/if}
						</div>

						<div class="space-y-2">
							<div class="flex items-center gap-3">
								<h1 class="text-2xl font-bold text-foreground">
									@{confession.confession.isAnonymous
										? generateRandomName(confession.confession.id)
										: confession.confessedFromUser?.username}
								</h1>
								{#if confession.confession.isAnonymous}
									<Badge variant="secondary" class="text-xs">🔒 Anonymous</Badge>
								{/if}
							</div>

							<div class="flex items-center gap-4 text-sm text-muted-foreground">
								<div class="flex items-center gap-1">
									<CalendarIcon class="h-4 w-4" />
									{formatDate(confession.confession.createdAt)}
								</div>
								<span>•</span>
								<div class="flex items-center gap-1">
									<EyeIcon class="h-4 w-4" />
									{confession.confession.likes + Math.floor(Math.random() * 50) + 20} views
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div class="prose prose-lg dark:prose-invert max-w-none">
						<p class="text-lg leading-relaxed whitespace-pre-wrap text-foreground/90">
							{confession.confession.message}
						</p>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Badge
						variant="outline"
						class="border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-800"
					>
						{confession.confession.category}
					</Badge>

					{#if confession.confession.visibility}
						{@const config = visibilityIconConfig[confession.confession.visibility]}
						<Badge variant="outline" class={cn('border-current', config.color, config.bg)}>
							<config.icon class="mr-1 h-3 w-3" />
							{confession.confession.visibility}
						</Badge>
					{/if}

					{#if confession.confessedToUser}
						<Badge
							variant="outline"
							class="border-pink-200 bg-linear-to-r from-pink-50 to-rose-50 text-pink-800"
						>
							<UserIcon class="mr-1 h-3 w-3" />
							To: @{confession.confessedToUser.username}
						</Badge>
					{/if}
				</div>

				<div class="flex items-center justify-between gap-x-4 border-t pt-4">
					<div class="flex items-center gap-6 text-muted-foreground">
						<div class="flex items-center gap-2">
							<HeartIcon class="h-5 w-5" />
							<span class="font-semibold">{confession.confession.likes}</span>
							<span class="text-sm">likes</span>
						</div>
						{#if confession.confession.repliesEnabled}
							<div class="flex items-center gap-2">
								<MessageCircleIcon class="h-5 w-5" />
								<span class="font-semibold">{confession.replies.length}</span>
								<span class="text-sm">replies</span>
							</div>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{@render likeButton()}
						<ShareDialog
							shareUrl={`${page.url.origin}/feed/confession/${confession.confession.id}`}
							class={buttonVariants({
								variant: 'default',
								size: 'default'
							})}
						/>
					</div>
				</div>
			</div>

			{@render repliesSection()}
		</div>

		<div class="w-auto space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">Similar Confessions</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3 py-8 text-center text-sm text-muted-foreground">
						<MessageCircleIcon class="mx-auto h-8 w-8 opacity-30" />
						<p>Related confessions will appear here based on category and content similarity.</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

{#snippet likeButton(variant = 'default')}
	<Button
		variant={variant === 'full' ? 'outline' : 'default'}
		size={variant === 'full' ? 'sm' : 'default'}
		onclick={handleLikeClick}
		class={cn('gap-2', variant === 'full' && 'w-full justify-start')}
	>
		{#key likeAnimationKey}
			<HeartIcon
				class={cn(
					'h-4 w-4 animate-pop',
					currentUserLiked ? 'fill-pink-600 text-pink-700' : 'text-muted-foreground'
				)}
			/>
		{/key}
		<span>{currentUserLiked ? 'Liked' : 'Like'}</span>
	</Button>
{/snippet}

{#snippet repliesSection()}
	{#if confession.confession.repliesEnabled}
		<div class="space-y-6">
			<Card.Root class="border-2 border-dashed bg-muted/30">
				<Card.Content class="p-6">
					<div class="space-y-4">
						<div class="flex items-center gap-3">
							<MessageCircleIcon class="h-5 w-5 text-primary" />
							<h3 class="font-semibold">Add a reply</h3>
						</div>
						<Textarea
							bind:value={replyMessage}
							placeholder="Share your thoughts on this confession..."
							class="min-h-24 resize-none"
							name="message"
							disabled={isSubmitting}
						/>
						<div class="flex items-center justify-between">
							<span class="text-xs text-muted-foreground">
								{280 - replyMessage.length} characters remaining
							</span>
							<Button
								size="sm"
								disabled={!replyMessage.trim() || isSubmitting}
								class="gap-2"
								onclick={handleNewReply}
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
				</Card.Content>
			</Card.Root>

			{#if confession.replies.length > 0}
				<div class="space-y-4">
					<h3 class="flex items-center gap-2 text-xl font-bold">
						<MessageCircleIcon class="h-5 w-5 text-primary" />
						Replies ({confession.replies.length})
					</h3>

					<div class="space-y-4">
						{#each confession.replies as reply (reply.id)}
							<Card.Root class="border-l-4 border-l-primary/20">
								<Card.Content class="p-4">
									<div class="flex gap-3">
										<Avatar class="h-10 w-10">
											<AvatarImage src={reply.user?.avatar} alt={reply.user?.username} />
											<AvatarFallback class="bg-primary/10 text-xs font-semibold text-primary">
												{getInitials(reply.user ? getDisplayName(reply.user) : 'X')}
											</AvatarFallback>
										</Avatar>
										<div class="flex-1 space-y-2">
											<div class="flex items-center gap-2 text-sm">
												<span class="font-medium">
													@{reply.user?.username || 'anonymous'}
												</span>
												<span class="text-muted-foreground">•</span>
												<span class="text-muted-foreground">
													{getTimeAgo(reply.createdAt)}
												</span>
											</div>
											<p class="text-sm leading-relaxed whitespace-pre-wrap">
												{reply.message}
											</p>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				</div>
			{:else}
				<Card.Root class="border-dashed bg-muted/10">
					<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
						<MessageCircleIcon class="mb-4 h-12 w-12 text-muted-foreground/30" />
						<h3 class="mb-2 text-lg font-semibold text-muted-foreground">No replies yet</h3>
						<p class="max-w-md text-sm text-muted-foreground">
							Be the first to share your thoughts on this confession. Your reply could start a
							meaningful conversation.
						</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	{:else}
		<Card.Root class="border-dashed bg-muted/10">
			<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
				<LockIcon class="mb-4 h-12 w-12 text-muted-foreground/30" />
				<h3 class="mb-2 text-lg font-semibold text-muted-foreground">Replies are disabled</h3>
				<p class="max-w-md text-sm text-muted-foreground">
					The author has chosen not to allow replies on this confession to maintain privacy.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
{/snippet}

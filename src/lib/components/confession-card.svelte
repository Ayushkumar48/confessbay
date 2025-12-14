<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import type { ConfessionWithToAndFrom } from '$lib/shared';
	import {
		cn,
		generateRandomAvatarUrl,
		generateRandomName,
		getDisplayName,
		getInitials,
		getTimeAgo,
		visibilityIcons
	} from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Separator from './ui/separator/separator.svelte';
	import RepliesExtend from './custom/feed/replies-extend.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ShareDialog from './share-dialog.svelte';
	import { likePost } from '../../routes/(main)/feed/data.remote';

	let {
		confession,
		currentUserLiked,
		confessedFromUser,
		confessedToUser,
		// reports,
		replies,
		isProfile = false
	}: ConfessionWithToAndFrom & { isProfile?: boolean } = $props();
	let likeAnimationKey = $state(0);
	let showReplies = $state(false);
	const confessedFromAvatar = $derived(
		confessedFromUser && !confession.isAnonymous
			? confessedFromUser.avatar
			: generateRandomAvatarUrl(confession.id)
	);
	async function handleLikeClick(confessionId: string) {
		const res = await likePost({ confessionId, userId: page.data.user.id });
		const previousLiked = currentUserLiked;
		currentUserLiked = !previousLiked;
		likeAnimationKey++;
		confession.likes += currentUserLiked ? 1 : -1;
		if (!res.success) {
			currentUserLiked = previousLiked;
			confession.likes += currentUserLiked ? 1 : -1;
			toast.error(res.message);
		}
	}
	const displayName = $derived(getDisplayName(confessedFromUser));
	const initials = $derived(getInitials(displayName));
</script>

<Card.Root class="transition-all duration-300 hover:shadow-md">
	<Card.Header>
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-3">
				{#if !isProfile}
					<Avatar class="h-12 w-12">
						<AvatarImage src={confessedFromAvatar} alt="User avatar" />
						<AvatarFallback class="bg-primary/10 font-semibold text-primary">
							{!confession.isAnonymous && confessedFromUser?.firstName ? initials : 'ANON'}
						</AvatarFallback>
					</Avatar>
				{/if}

				<div class="flex flex-col gap-1">
					{#if !isProfile}
						<div class="flex items-center gap-2">
							<span class="font-semibold text-foreground">
								@{confession.isAnonymous
									? generateRandomName(confession.id)
									: confessedFromUser?.username}
							</span>
							{#if confession.isAnonymous}
								<Badge variant="secondary" class="text-xs">🔒 Anonymous</Badge>
							{/if}
						</div>
					{/if}

					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<span>{getTimeAgo(confession.createdAt)}</span>
						<span>•</span>
						<span class="flex items-center gap-1">
							{#if confession.visibility}
								{@const Icon = visibilityIcons[confession.visibility] ?? visibilityIcons.Default}
								<Icon class="size-4" />
								{confession.visibility}
							{/if}
						</span>
						<span>•</span>
						<Badge variant="outline">
							{confession.category}
						</Badge>
						{#if !isProfile}
							<span>•</span>
							<Button
								variant="link"
								href={resolve(`/feed/confession/${confession.id}`)}
								size="sm"
								class="gap-x-0.5 text-xs"
							>
								<span class="underline-offset-2 group-hover:underline">View post</span>
								<ArrowRightIcon
									class="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
								/>
							</Button>
						{/if}
					</div>
				</div>
			</div>
			{@render moreOptions()}
		</div>
	</Card.Header>

	<Card.Content class="pt-0">
		<div
			class="prose prose-sm -m-2 max-w-none cursor-pointer rounded-md p-2 transition-colors duration-200 hover:bg-muted/30"
			onclick={() => goto(resolve(`/feed/confession/${confession.id}`))}
			role="button"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					goto(resolve(`/feed/confession/${confession.id}`));
				}
			}}
		>
			<p class="leading-relaxed whitespace-pre-wrap text-foreground">
				{confession.message}
			</p>
		</div>
	</Card.Content>

	{#if confessedToUser}
		<Separator />
		<div class="px-4 pb-2">
			<div class="mb-2 text-sm text-muted-foreground">Confessed to</div>
			<div class="flex items-center gap-3">
				<Avatar class="h-10 w-10">
					<AvatarImage
						src={confessedToUser.avatar ?? generateRandomAvatarUrl(`${confession.id}-to`)}
						alt="Confessed to avatar"
					/>
					<AvatarFallback class="bg-primary/10 font-semibold text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>
				<div class="flex flex-col">
					<span class="font-medium text-foreground">@{confessedToUser.username}</span>
					<span class="text-xs text-muted-foreground">{displayName}</span>
				</div>
			</div>
		</div>
	{/if}

	{#if !isProfile}
		<Card.Footer>
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span>{confession.likes} likes</span>
					{#if confession.repliesEnabled}
						<span>{replies.length} replies</span>
					{/if}
				</div>

				<div class="flex items-center gap-1">
					{@render likeButton()}

					{#if confession.repliesEnabled}
						<Button variant="vertical" size="sm" onclick={() => (showReplies = !showReplies)}>
							<MessageCircleIcon />
							<span class="text-xs">Reply</span>
						</Button>
					{/if}

					<ShareDialog
						shareUrl={`${page.url.origin}/feed/confession/${confession.id}`}
						class={buttonVariants({ variant: 'vertical', size: 'sm' })}
					/>
				</div>
			</div>
		</Card.Footer>
		{#if confession.repliesEnabled && showReplies}
			<Separator />
			<RepliesExtend {replies} confessionId={confession.id} />
		{/if}
	{/if}
</Card.Root>

{#snippet moreOptions()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}>
			<MoreHorizontalIcon class="h-4 w-4" />
			<span class="sr-only">Open menu</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2"
				onclick={() => goto(resolve(`/feed/confession/${confession.id}`))}
			>
				<EyeIcon class="h-4 w-4" />
				View Full Post
			</DropdownMenu.Item>
			<DropdownMenu.Item class="flex items-center gap-2 text-destructive">
				<FlagIcon class="h-4 w-4" />
				Report
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet likeButton()}
	<Button variant="vertical" size="sm" type="button" onclick={() => handleLikeClick(confession.id)}>
		{#key likeAnimationKey}
			<HeartIcon
				class={cn(
					'animate-pop',
					currentUserLiked ? 'fill-pink-700 text-pink-900' : 'text-muted-foreground'
				)}
			/>
		{/key}
		<span class="text-xs">Like</span>
	</Button>
{/snippet}

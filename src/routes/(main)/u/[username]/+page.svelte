<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { cn, getDisplayName, getInitials } from '$lib/utils.js';
	import Users from '@lucide/svelte/icons/users';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import {
		acceptFriendRequest,
		createConversation,
		getConversation,
		getFriendship,
		getUserProfile,
		makeFollow,
		makeFriendRquest,
		makeUnfollow,
		removeFriend
	} from './data.remote.js';
	const user = $state(
		(
			await getUserProfile({
				username: page.params.username || '',
				currentUserId: page.data.user.id
			})
		).user
	);
	const friendship = $derived(
		(await getFriendship({ userId1: page.data.user.id, userId2: user.id })).friendship
	);
	let conversation = $derived(
		(await getConversation({ userId1: page.data.user.id, userId2: user.id })).conversation
	);
	let { college, friendshipRequestedBy } = $derived(user);
	const nameOfUser = $derived(getDisplayName(user));
	let isFriendRequestFromMe = $derived(
		user.friendStatus === 'pending' && friendshipRequestedBy === page.data.user.id
	);
	let isFriendRequestForMe = $derived(
		user.friendStatus === 'pending' && friendshipRequestedBy !== page.data.user.id
	);
	async function handleMakeFriendRequest() {
		const res = await makeFriendRquest({
			friendUsername: user.username,
			currentUserId: page.data.user.id
		});
		if (res.success) {
			user.friendStatus = 'pending';
			isFriendRequestFromMe = true;
			toast.success('Request sent!');
		} else {
			toast.error('Something went wrong!');
		}
	}
	async function handleRemoveFriend() {
		const res = await removeFriend({
			friendUsername: user.username,
			currentUserId: page.data.user.id
		});
		if (res.success) {
			toast.success(
				user.friendStatus === 'pending' ? 'Friend request cancelled' : 'Friend removed'
			);
			user.friendStatus = null;
			isFriendRequestFromMe = false;
		} else {
			toast.error('Something went wrong!');
		}
	}
	async function handleMakeFollow() {
		const res = await makeFollow({
			friendUsername: user.username,
			currentUserId: page.data.user.id
		});
		if (res.success) {
			user.isFollowing = true;
			user.followersCount += 1;
			toast.success(`Started following @${user.username}`);
		} else {
			toast.error('Something went wrong!');
		}
	}
	async function handleMakeUnfollow() {
		const res = await makeUnfollow({
			friendUsername: user.username,
			currentUserId: page.data.user.id
		});
		if (res.success) {
			user.isFollowing = false;
			user.followersCount -= 1;
			toast.success(`Unfollowed @${user.username}`);
		} else {
			toast.error('Something went wrong!');
		}
	}
	async function handleAcceptFriendRequest() {
		const res = await acceptFriendRequest({ friendRequestId: friendship?.id || '' });
		if (res.success) {
			const response = await createConversation({ userId1: page.data.user.id, userId2: user.id });
			if (response.success) {
				user.friendStatus = 'accepted';
				isFriendRequestFromMe = false;
				conversation = response.conversation;
				toast.success('Friend request accepted!');
			} else {
				toast.error('Something went wrong!');
			}
		} else {
			toast.error('Something went wrong!');
		}
	}
</script>

<Card.Root class="mx-auto my-8 max-w-3xl overflow-hidden p-0">
	<Card.Header class="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
		<div class="flex items-center gap-4">
			<Avatar.Root class="h-28 w-28 shrink-0">
				<Avatar.Image src={user.avatar} alt={user.username + ' avatar'} />
				<Avatar.Fallback>{getInitials(nameOfUser)}</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col space-y-2">
				<div class="flex items-center gap-2">
					<Card.Title class="text-2xl leading-none">{nameOfUser}</Card.Title>
					{#if user.openToRelationships}
						<Badge variant="secondary">Open to relationships</Badge>
					{/if}
				</div>
				<Card.Description class="text-sm text-muted-foreground">
					@{user.username}
				</Card.Description>
				<div class="flex gap-2">
					{#if user.isFollowing}
						{@render removeFollowingButton()}
					{:else}
						<Button size="sm" onclick={handleMakeFollow}>Follow</Button>
					{/if}

					{#if user.friendStatus === 'accepted'}
						<Button variant="secondary" size="sm" href={`/messages/${conversation?.id}`}>
							Message
						</Button>
						{@render removeFriendButton()}
					{:else if user.friendStatus === 'pending'}
						{#if isFriendRequestFromMe}
							<Button
								size="sm"
								variant="secondary"
								onclick={handleRemoveFriend}
								class="bg-green-700/40">Requested</Button
							>
						{:else if isFriendRequestForMe}
							<Button size="sm" variant="secondary" onclick={handleAcceptFriendRequest}>
								Accept Request
							</Button>
						{/if}
					{:else}
						<Button
							size="sm"
							class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-600"
							onclick={handleMakeFriendRequest}
						>
							Add Friend
						</Button>
					{/if}
				</div>
			</div>
		</div>
		<div class="ml-auto grid grid-cols-3 gap-6 text-center">
			<div>
				<div class="text-lg font-medium">{user.totalConfessions}</div>
				<div class="text-xs text-muted-foreground">Confessions</div>
			</div>
			<div>
				<div class="text-lg font-medium">{user.followersCount}</div>
				<div class="text-xs text-muted-foreground">Followers</div>
			</div>
			<div>
				<div class="text-lg font-medium">{user.followingsCount}</div>
				<div class="text-xs text-muted-foreground">Following</div>
			</div>
		</div>
	</Card.Header>
	<Separator />
	<Card.Content class="space-y-6 p-6">
		{#if user.bio}
			<section>
				<h3 class="mb-2 text-sm font-medium">About</h3>
				<p class="text-sm leading-relaxed">{user.bio}</p>
			</section>

			<Separator class="my-2" />
		{/if}
		<section class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<h4 class="mb-1 text-xs font-medium text-muted-foreground">Username</h4>
				<div class="text-sm">@{user.username}</div>
			</div>
			{#if user.city}
				<div>
					<h4 class="mb-1 text-xs font-medium text-muted-foreground">Location</h4>
					<div class="text-sm">{user.city}</div>
				</div>
			{/if}
			{#if college}
				<div class="col-span-1 sm:col-span-2">
					<h4 class="mb-1 text-xs font-medium text-muted-foreground">College</h4>
					<div class="text-sm font-medium">{college.name}</div>

					{#if college.city || college.state}
						<div class="mt-1 text-xs text-muted-foreground">
							{college.city}{college.city && college.state ? ', ' : ''}{college.state}
						</div>
					{/if}
				</div>
			{/if}
			<div>
				<h4 class="mb-1 text-xs font-medium text-muted-foreground">Friends</h4>
				<div class="flex items-center gap-2 text-sm">
					<Users class="size-4" />
					{user.friendsCount}
				</div>
			</div>
			<div>
				<h4 class="mb-1 text-xs font-medium text-muted-foreground">Public Confessions</h4>
				<div class="text-sm">{user.totalConfessions}</div>
			</div>
		</section>
	</Card.Content>
</Card.Root>

{#snippet removeFriendButton()}
	<Dialog.Root>
		<Dialog.Trigger class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
			Remove Friend
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will remove
					<span class="text-base font-bold text-primary">
						{getDisplayName(user)}
					</span>
					from your friend list.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
					Cancel
				</Dialog.Close>
				<Button onclick={handleRemoveFriend} variant="destructive" size="sm">Remove Friend</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet removeFollowingButton()}
	<Dialog.Root>
		<Dialog.Trigger
			class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'bg-secondary/30')}
		>
			Following
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will remove
					<span class="text-base font-bold text-primary">
						{getDisplayName(user)}
					</span>
					from your follow list.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close class={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
					Cancel
				</Dialog.Close>
				<Button onclick={handleMakeUnfollow} variant="destructive" size="sm">Unfollow</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

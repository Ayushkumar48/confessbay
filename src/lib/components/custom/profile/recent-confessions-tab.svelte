<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { formatMonthYear, getDisplayName } from '$lib/utils';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ConfessionCard from '$lib/components/confession-card.svelte';
	import {
		getMyConfessionPosts,
		getUserFollowers,
		getUserFollowings,
		getUserFriends
	} from '../../../../routes/(main)/profile/data.remote';

	const allConfessions = $derived(await getMyConfessionPosts({ userId: page.data.user.id }));
	const allFriends = $derived(
		(await getUserFriends({ username: page.data.user.username })).friends
	);
	const friends = $derived(allFriends?.filter((friend) => friend.friends.status === 'accepted'));
	let pendingFriendRequests = $derived(
		allFriends?.filter((friend) => friend.friends.status === 'pending')
	);
	const followers = $derived(
		(await getUserFollowers({ username: page.data.user.username })).followers
	);
	const following = $derived(
		(await getUserFollowings({ username: page.data.user.username })).followings
	);

	let currentRoute = $derived(page.url.pathname);
	let currentParams = $derived(page.url.searchParams.get('tab'));
</script>

<form
	hidden
	method="POST"
	id="friendForm"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success' && result.data) {
				if (result.data.success) {
					if (result.data.reqType === 'acceptFriendRequest') {
						pendingFriendRequests = pendingFriendRequests?.filter(
							(friend) => friend.user.id !== result.data?.friendId
						);
						toast.success('Request Accepted!');
					}
				} else {
					toast.error(
						(result.data?.message as string) || 'Error occurred. Please try again later.'
					);
				}
			} else if (result.type === 'failure' || result.type === 'error') {
				toast.error('Failed to request!');
			} else {
				toast.error('Internal Server Error');
			}
		};
	}}
></form>

<Tabs.Root value={currentParams || 'recent-confessions'} class="w-full">
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<Tabs.List class="mb-4 flex flex-wrap gap-2">
		<Tabs.Trigger
			value="recent-confessions"
			class="rounded-md bg-muted px-4 py-2 text-sm font-medium"
			onclick={() => goto(`${currentRoute}?tab=recent-confessions`)}
		>
			Recent Confessions
		</Tabs.Trigger>
		<Tabs.Trigger
			value="followers"
			class="rounded-md bg-muted px-4 py-2 text-sm font-medium"
			onclick={() => goto(`${currentRoute}?tab=followers`)}
		>
			Followers
		</Tabs.Trigger>
		<Tabs.Trigger
			value="followings"
			class="rounded-md bg-muted px-4 py-2 text-sm font-medium"
			onclick={() => goto(`${currentRoute}?tab=followings`)}
		>
			Following
		</Tabs.Trigger>
		<Tabs.Trigger
			value="friends"
			class="rounded-md bg-muted px-4 py-2 text-sm font-medium"
			onclick={() => goto(`${currentRoute}?tab=friends`)}
		>
			Friends
		</Tabs.Trigger>
		<Tabs.Trigger
			value="pending-friend-requests"
			class="rounded-md bg-muted px-4 py-2 text-sm font-medium"
			onclick={() => goto(`${currentRoute}?tab=pending-friend-requests`)}
		>
			Pending Requests
		</Tabs.Trigger>
	</Tabs.List>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->

	<Card class="rounded-xl border bg-card p-6">
		<Tabs.Content value="recent-confessions">
			<h3 class="mb-4 text-lg font-semibold">My Recent Confessions</h3>
			{#if allConfessions && allConfessions.length > 0}
				<div class="space-y-4">
					{#each allConfessions as confession, i (confession.confession.id)}
						<ConfessionCard
							{...confession}
							currentUserLiked={allConfessions[i].currentUserLiked}
							isProfile={true}
						/>
					{/each}
					<div class="flex justify-center pt-2">
						<Button href={resolve('/feed')} size="sm" variant="outline">New Confession</Button>
					</div>
				</div>
			{:else}
				<p class="text-sm text-foreground/60">No confessions yet. Start sharing!</p>
			{/if}
		</Tabs.Content>

		<Separator class="my-4" />

		<Tabs.Content value="followers">
			<h3 class="mb-4 text-lg font-semibold">Followers</h3>
			{#if followers && followers.length > 0}
				<ScrollArea class="max-h-96">
					<ul class="space-y-3">
						{#each followers as f (f.user.id)}
							<li>
								<div class="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/50">
									<div class="min-w-0 flex-1">
										<a
											href={resolve(`/u/${f.user.username}`)}
											class="block truncate text-sm font-medium hover:underline"
											>{getDisplayName(f.user)}</a
										>
										<div class="text-xs text-foreground/70">@{f.user.username}</div>
									</div>
									<div class="flex items-center gap-2">
										<Button size="sm" href={resolve(`/u/${f.user.username}`)}>View</Button>
										<Button size="sm" variant="secondary">Follow</Button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{:else}
				<p class="text-sm text-foreground/60">You have no followers yet.</p>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="followings">
			<h3 class="mb-4 text-lg font-semibold">Following</h3>
			{#if following && following.length > 0}
				<ScrollArea class="max-h-96">
					<ul class="space-y-3">
						{#each following as f (f.user.id)}
							<li>
								<div class="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/50">
									<div class="min-w-0 flex-1">
										<a
											href={resolve(`/u/${f.user.username}`)}
											class="block truncate text-sm font-medium hover:underline"
											>{getDisplayName(f.user)}</a
										>
										<div class="text-xs text-foreground/70">@{f.user.username}</div>
									</div>
									<div class="flex items-center gap-2">
										<Button size="sm">Message</Button>
										<Button size="sm" variant="destructive">Unfollow</Button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{:else}
				<p class="text-sm text-foreground/60">You are not following anyone yet.</p>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="friends">
			<h3 class="mb-4 text-lg font-semibold">Friends</h3>
			{#if friends && friends.length > 0}
				<ScrollArea class="max-h-96">
					<ul class="space-y-3">
						{#each friends as f (f.user.id)}
							<li>
								<div class="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/50">
									<div class="min-w-0 flex-1">
										<a
											href={resolve(`/u/${f.user.username}`)}
											class="block truncate text-sm font-medium hover:underline"
											>{getDisplayName(f.user)}</a
										>
										<div class="text-xs text-foreground/70">@{f.user.username}</div>
									</div>
									Friends since: {formatMonthYear(f.friends.acceptedAt)}
								</div>
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{:else}
				<p class="text-sm text-foreground/60">No friends yet. Connect with people!</p>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="pending-friend-requests">
			<h3 class="mb-4 text-lg font-semibold">Pending Friend Requests</h3>
			{#if pendingFriendRequests && pendingFriendRequests.length > 0}
				<ScrollArea class="max-h-96">
					<ul class="space-y-3">
						{#each pendingFriendRequests as f (f.user.id)}
							<li>
								<div class="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/50">
									<div class="min-w-0 flex-1">
										<a
											href={resolve(`/u/${f.user.username}`)}
											class="block truncate text-sm font-medium hover:underline"
										>
											{getDisplayName(f.user)}
										</a>
										<div class="text-xs text-foreground/70">@{f.user.username}</div>
									</div>
									<div class="flex items-center gap-2">
										<input
											type="text"
											form="friendForm"
											name="friendRequestId"
											value={f.user.id}
											hidden
										/>

										<Button
											size="sm"
											formaction="/u/[username]?/acceptFriendRequest"
											form="friendForm"
											type="submit"
										>
											Accept
										</Button>

										<Button size="sm" variant="destructive">Reject</Button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{:else}
				<p class="text-sm text-foreground/60">No pending requests.</p>
			{/if}
		</Tabs.Content>
	</Card>
</Tabs.Root>

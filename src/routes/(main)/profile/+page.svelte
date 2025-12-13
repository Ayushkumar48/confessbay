<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import { formatDate, formatMonthYear } from '$lib/utils.js';
	import RecentConfessionsTab from '$lib/components/custom/profile/recent-confessions-tab.svelte';
	const { data } = $props();
	const { user, allFriends, followers, following, allConfessions } = $derived(data);
</script>

<div class="mx-auto max-w-5xl p-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<aside class="space-y-6 md:col-span-1">
			<div
				class="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center"
			>
				<img
					src={user.avatar}
					alt="User avatar"
					class="h-32 w-32 rounded-full object-cover shadow-sm ring-2 ring-primary"
				/>
				<h2 class="mt-4 text-2xl font-semibold">
					{user.firstName}
					{user.lastName}
				</h2>
				<p class="mt-1 text-sm text-foreground/60">@{user.username}</p>

				{#if user.bio}
					<p class="mt-3 text-sm text-foreground/70">{user.bio}</p>
				{/if}

				<div class="mt-4 flex w-full gap-3">
					<Button class="flex-1">Edit Profile</Button>
				</div>

				<div class="mt-6 grid w-full grid-cols-3 gap-4">
					<div>
						<p class="text-center text-lg font-bold text-primary">{user.totalConfessions ?? 0}</p>
						<p class="text-center text-xs text-foreground/60">Confessions</p>
					</div>
					<div>
						<p class="text-center text-lg font-bold text-primary">—</p>
						<p class="text-center text-xs text-foreground/60">Received</p>
					</div>
					<div>
						<p class="text-center text-lg font-bold text-primary">—</p>
						<p class="text-center text-xs text-foreground/60">Friends</p>
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-border bg-card p-4">
				<h3 class="mb-3 text-sm font-semibold">Account</h3>
				<div class="space-y-2 text-sm text-foreground/60">
					<div><span class="font-medium">Joined:</span> {formatMonthYear(user.createdAt)}</div>
					<div class="flex items-center gap-x-1">
						<span class="font-medium">Email:</span>
						{user.email}
						{#if user.emailVerified}
							<BadgeCheckIcon class="h-5 w-5 fill-primary text-primary-foreground" />
						{/if}
					</div>
					{#if user.collegeEmail}
						<div><span class="font-medium">College:</span> {user.collegeEmail}</div>
					{/if}
					{#if user.city}
						<div><span class="font-medium">Location:</span> {user.city}</div>
					{/if}
				</div>
			</div>
		</aside>

		<main class="space-y-6 md:col-span-2">
			<div class="rounded-xl border border-border bg-card p-6">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-lg font-semibold">About</h3>
						<p class="mt-2 text-sm text-foreground/80">
							{user.bio ?? 'You have not added a bio yet.'}
						</p>
					</div>
					<div class="text-right text-sm text-foreground/60">
						{#if user.dateOfBirth}
							<p><span class="font-medium">DOB:</span> {formatDate(user.dateOfBirth)}</p>
						{/if}
					</div>
				</div>

				<div class="mt-6 grid grid-cols-2 gap-4">
					<div class="rounded-md bg-muted p-3">
						<p class="text-xs text-foreground/60">Gender</p>
						<p class="mt-1 font-medium">{user.gender}</p>
					</div>
					<div class="rounded-md bg-muted p-3">
						<p class="text-xs text-foreground/60">Zodiac</p>
						<p class="mt-1 font-medium">{user.zodiacSign ?? '—'}</p>
					</div>
					<div class="rounded-md bg-muted p-3">
						<p class="text-xs text-foreground/60">Open to relationships</p>
						<p class="mt-1 font-medium">{user.openToRelationships ? 'Yes' : 'No'}</p>
					</div>
					<div class="rounded-md bg-muted p-3">
						<p class="text-xs text-foreground/60">Phone</p>
						<p class="mt-1 font-medium">{user.phoneNumber ?? '—'}</p>
					</div>
				</div>
			</div>

			<RecentConfessionsTab {allConfessions} {allFriends} {followers} {following} />
		</main>
	</div>
</div>

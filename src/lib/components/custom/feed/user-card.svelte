<script lang="ts">
	import type { User } from '$lib/shared';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { getDisplayName, getInitials } from '$lib/utils';
	import HatGlassesIcon from '@lucide/svelte/icons/hat-glasses';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import UsernamText from '$lib/components/usernam-text.svelte';

	let { user }: { user: User } = $props();
</script>

<div>
	<Card.Root>
		<Card.Content>
			<div class="mb-4 flex items-center justify-between">
				<Avatar class="size-16 ring-1 ring-gray-300 dark:ring-gray-600">
					<AvatarImage src={user.avatar} alt={getDisplayName(user)} />
					<AvatarFallback
						class="bg-linear-to-br from-primary to-indigo-500 font-semibold text-white"
					>
						{getInitials(getDisplayName(user))}
					</AvatarFallback>
				</Avatar>
				{#if user.anonymous}
					<div
						class="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground"
					>
						<div
							class="flex items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 p-2.5 shadow-sm"
						>
							<HatGlassesIcon class="size-4 text-primary-foreground" />
						</div>
						<span>Anonymous</span>
					</div>
				{/if}
			</div>

			<div class="space-y-3">
				<div>
					<h3 class="text-xl">{getDisplayName(user)}</h3>
					<UsernamText username={user.username} size="md" />
				</div>

				<div class="space-y-2">
					<p class="text-sm leading-relaxed">
						{user.bio || 'Student sharing thoughts anonymously'}
					</p>

					{#if user.city}
						<div class="flex items-center gap-1 text-sm text-gray-300">
							<MapPinIcon class="h-3 w-3" />
							<span>{user.city}</span>
						</div>
					{/if}
				</div>

				<div class="flex justify-center gap-4">
					<div class="text-center">
						<div class="text-lg font-semibold">{user.totalConfessions || 0}</div>
						<div class="text-xs">Confessions</div>
					</div>
					{#if user.collegeId}
						<div class="flex flex-col items-center justify-between pt-0.5 text-center">
							<div class="text-lg font-semibold">
								<GraduationCapIcon class="mx-auto h-5 w-5 text-blue-600" />
							</div>
							<div class="text-xs text-muted-foreground">Student</div>
						</div>
					{/if}
				</div>

				<div class="flex flex-wrap justify-center gap-2 pt-2">
					{#if !user.emailVerified}
						<Badge variant="outline" class="text-xs" href="/profile">Verify your Email</Badge>
					{/if}
					{#if user.collegeEmail}
						<Badge variant="outline" class="text-xs">College Email</Badge>
					{/if}
					{#if user.zodiacSign}
						<Badge variant="outline" class="text-xs">
							{user.zodiacSign}
						</Badge>
					{/if}
				</div>
			</div>
		</Card.Content>

		<Card.Footer class="pt-0">
			<Button variant="outline" class="w-full" size="sm" href="/profile">
				<MessageSquareIcon class="mr-2 h-4 w-4" />
				View Profile
			</Button>
		</Card.Footer>
	</Card.Root>
</div>

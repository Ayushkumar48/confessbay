<script lang="ts">
	import ConfessionCard from '$lib/components/confession-card.svelte';
	import NewPostCard from '$lib/components/custom/feed/new-post-card.svelte';
	import UserCard from '$lib/components/custom/feed/user-card.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte';
	import { cn } from '$lib/utils.js';
	import { getConfessionPosts } from './data.remote.js';

	let { data } = $props();
	let confessionPosts = $derived(
		await getConfessionPosts({
			userId: data.user?.id
		})
	);
	const sidebar = useSidebar();
</script>

<div
	class={cn(
		'grid h-[calc(100vh-7rem)] gap-6 overflow-hidden',
		sidebar.state === 'collapsed' ? 'justify-center' : 'justify-start'
	)}
	style="grid-template-columns: 320px 1fr;"
>
	<UserCard user={data.user} />
	<div class="min-h-0">
		{#if confessionPosts.length > 0}
			<ScrollArea class="h-full">
				<div class="space-y-6 pr-4">
					<NewPostCard form={data.form} bind:confessionPosts />
					{#each confessionPosts as confession, i (confession.confession.id)}
						<ConfessionCard
							{...confession}
							currentUserLiked={confessionPosts[i].currentUserLiked}
						/>
					{/each}
					<p class="py-8 text-center">Cool! You have read all the confessions.</p>
				</div>
			</ScrollArea>
		{:else}
			<div class="flex h-full flex-col space-y-6">
				<NewPostCard form={data.form} bind:confessionPosts />
				<div class="flex flex-1 items-center justify-center">
					<p>Currently, no confession to show.</p>
				</div>
			</div>
		{/if}
	</div>
</div>

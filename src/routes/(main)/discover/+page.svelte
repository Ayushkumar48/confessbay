<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { confessionCategories, visibility } from '$lib/shared/frontend-enums';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { cn } from '$lib/utils';
	import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
	import { goto } from '$app/navigation';
	import ConfessionCard from '$lib/components/confession-card.svelte';
	import { page } from '$app/state';

	let activeCategory = $derived(page.url.searchParams.get('category') || 'All');
	let activeVisibility = $derived(page.url.searchParams.get('visibility'));

	let { data } = $props();
</script>

{#if activeCategory === 'All'}
	<div class="mx-auto max-w-4xl p-8" transition:slide>
		<h1 class="mb-2 text-3xl font-bold">Discover</h1>
		<p class="mb-8 text-foreground/60">Find confessions by college, major, or interests</p>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-xl border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold">🏫 Browse by College</h3>
				<Button variant="outline" class="mb-2 w-full justify-start">State University</Button>
				<Button variant="outline" class="mb-2 w-full justify-start">Tech Institute</Button>
				<Button variant="outline" class="w-full justify-start">Community College</Button>
			</div>

			<div class="rounded-xl border border-border bg-card p-6">
				<h3 class="mb-4 font-semibold">📚 Browse by Major</h3>
				<Button variant="outline" class="mb-2 w-full justify-start">Computer Science</Button>
				<Button variant="outline" class="mb-2 w-full justify-start">Business</Button>
				<Button variant="outline" class="w-full justify-start">Engineering</Button>
			</div>
		</div>
	</div>
{/if}

<div class="mx-auto max-w-4xl p-8">
	<div class="mb-6 flex flex-wrap items-center gap-3">
		<Carousel.Root class="w-full" opts={{ align: 'start' }} plugins={[WheelGesturesPlugin()]}>
			<Carousel.Previous />
			<Carousel.Content>
				{#each confessionCategories as c (c.label)}
					<Carousel.Item class="basis-1/6">
						<Button
							class={cn('h-full w-full')}
							variant={activeCategory === c.label ? 'default' : 'outline'}
							onclick={() => {
								// eslint-disable-next-line svelte/no-navigation-without-resolve
								goto(`/discover?category=${c.label}`);
							}}
							aria-label={c.label}
						>
							{c.icon}
							<span class="text-wrap">
								{c.label}
							</span>
						</Button>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Next />
		</Carousel.Root>

		<div class="ml-auto flex items-center gap-2">
			<span class="text-sm text-foreground/60">Visible To:</span>
			<Button
				variant={!activeVisibility ? 'default' : 'outline'}
				aria-label="Any"
				size="sm"
				onclick={() => {
					const url = new URL(page.url);
					url.searchParams.delete('visibility');
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					if (url.href !== page.url.href) goto(url.toString());
				}}
			>
				Any
			</Button>
			{#each visibility as v (v)}
				<Button
					variant={activeVisibility === v ? 'default' : 'outline'}
					size="sm"
					aria-label={v}
					onclick={() => {
						const url = new URL(page.url);
						url.searchParams.set('visibility', v);
						// eslint-disable-next-line svelte/no-navigation-without-resolve
						if (url.href !== page.url.href) goto(url.toString());
					}}
				>
					{v}
				</Button>
			{/each}
		</div>
	</div>

	<div>
		<div class="space-y-4">
			{#if data?.confessions}
				{#each data.confessions as confession, i (confession.confession.id)}
					<ConfessionCard {...confession} currentUserLiked={data.confessions[i].currentUserLiked} />
				{/each}
			{/if}

			{#if (data?.confessions?.length ?? 0) === 0}
				<div class="rounded-xl border border-border bg-card p-6 text-center text-foreground/60">
					No posts matching your filters. Try selecting another category or college.
				</div>
			{/if}
		</div>
	</div>
</div>

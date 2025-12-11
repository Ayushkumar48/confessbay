<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { confessionCategories, visibility } from '$lib/shared/frontend-enums';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { cn } from '$lib/utils';
	import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
	import { resolve } from '$app/paths';
	type Confession = {
		id: string;
		title: string;
		body: string;
		category: 'Confession' | 'Love' | 'Advice' | 'Humor';
		college?: string;
		major?: string;
		likes: number;
		timeAgo: string;
	};

	const sample: Confession[] = [
		{
			id: 'c1',
			title: 'I texted my crush by mistake',
			body: 'Thought I was sending a meme to my roommate, ended up sending it to my crush. Now I awkwardly reacted with a heart.',
			category: 'Humor',
			college: 'State University',
			major: 'Computer Science',
			likes: 32,
			timeAgo: '2h'
		},
		{
			id: 'c2',
			title: 'Should I confess?',
			body: 'We always study together and share notes. I think they might like me back — how do I tell them without ruining the friendship?',
			category: 'Love',
			college: 'Tech Institute',
			major: 'Design',
			likes: 128,
			timeAgo: '5h'
		},
		{
			id: 'c3',
			title: 'Group project truth',
			body: 'I ended up doing 90% of a group assignment. I left passive-aggressive comments in the git history.',
			category: 'Confession',
			college: 'State University',
			major: 'Engineering',
			likes: 11,
			timeAgo: '1d'
		},
		{
			id: 'c4',
			title: 'Internship panic',
			body: 'Applied to 40 internships, heard from none. Is my resume that bad or should I pivot to research?',
			category: 'Advice',
			college: 'Community College',
			major: 'Business',
			likes: 56,
			timeAgo: '3d'
		}
	];

	let activeCategory: string = $state('all');
	let activeVisibility: string | null = $state(null);
	let activeMajor: string | null = $state(null);

	const majors = ['Computer Science', 'Business', 'Engineering', 'Design'];
</script>

<div class="mx-auto max-w-4xl p-8">
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
							onclick={() => (activeCategory = c.label)}
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
			<Button variant="outline" size="sm" onclick={() => (activeVisibility = null)}>Any</Button>
			{#each visibility as v (v)}
				<Button variant="outline" size="sm" onclick={() => (activeVisibility = v)}>
					{v}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Main grid: posts + right sidebar -->
	<div class="grid gap-6 md:grid-cols-3">
		<!-- posts -->
		<div class="space-y-4 md:col-span-2">
			{#each sample as post (post.id)}
				<div
					class="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
				>
					<div class="flex gap-4">
						<div
							class="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white"
						>
							<!-- SVG initials -->
							<svg
								width="40"
								height="40"
								viewBox="0 0 40 40"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden={true}
							>
								<rect width="40" height="40" rx="8" fill="rgba(255,255,255,0.06)" />
								<text
									x="50%"
									y="55%"
									dominant-baseline="middle"
									text-anchor="middle"
									font-size="12"
									fill="white">A</text
								>
							</svg>
						</div>

						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-4">
								<div>
									<div class="flex items-center gap-2">
										<h3 class="text-sm leading-tight font-semibold">{post.title}</h3>
										<span class="text-xs text-foreground/60">• {post.timeAgo}</span>
									</div>
									<p class="mt-1 line-clamp-2 text-sm text-foreground/70">{post.body}</p>
								</div>

								<div class="flex flex-col items-end gap-2">
									<span class="rounded-md bg-muted px-2 py-1 text-xs">{post.category}</span>
									<div class="flex items-center gap-3 text-sm text-foreground/60">
										<span>♥ {post.likes}</span>
										<Button variant="ghost" onclick={() => alert('Open replies demo')}>Reply</Button
										>
									</div>
								</div>
							</div>

							<div class="mt-3 flex items-center gap-2 text-xs text-foreground/60">
								{#if post.college}
									<span class="rounded-full bg-accent/10 px-2 py-0.5">{post.college}</span>
								{/if}
								{#if post.major}
									<span class="rounded-full bg-accent/10 px-2 py-0.5">{post.major}</span>
								{/if}
								<a
									class="ml-auto text-xs text-accent"
									href={resolve(`/feed/confession/${post.id}`)}
								>
									Read more →
								</a>
							</div>
						</div>
					</div>
				</div>
			{/each}

			{#if sample.length === 0}
				<div class="rounded-xl border border-border bg-card p-6 text-center text-foreground/60">
					No posts matching your filters. Try selecting another category or college.
				</div>
			{/if}
		</div>

		<!-- sidebar -->
		<aside class="space-y-4">
			<div class="rounded-xl border border-border bg-card p-4">
				<h4 class="mb-2 font-semibold">Quick Links</h4>
				<div class="flex flex-col gap-2">
					<a
						href="/discover/college/state-university"
						class="rounded-md border border-border px-3 py-2 hover:bg-accent/5">State University</a
					>
					<a
						href="/discover/college/tech-institute"
						class="rounded-md border border-border px-3 py-2 hover:bg-accent/5">Tech Institute</a
					>
					<a
						href="/discover/college/community-college"
						class="rounded-md border border-border px-3 py-2 hover:bg-accent/5">Community College</a
					>
				</div>
			</div>

			<div class="rounded-xl border border-border bg-card p-4">
				<h4 class="mb-2 font-semibold">Browse Majors</h4>
				<div class="grid grid-cols-2 gap-2">
					{#each majors as m}
						<a
							href={`/discover/major/${m.toLowerCase().replace(/ /g, '-')}`}
							class="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent/5">{m}</a
						>
					{/each}
				</div>
			</div>

			<div class="rounded-xl border border-border bg-card p-4">
				<h4 class="mb-2 font-semibold">Trending</h4>
				<div class="flex flex-wrap gap-2">
					<button class="rounded-full bg-muted/10 px-3 py-1 text-sm">#exams</button>
					<button class="rounded-full bg-muted/10 px-3 py-1 text-sm">#roommates</button>
					<button class="rounded-full bg-muted/10 px-3 py-1 text-sm">#crushes</button>
					<button class="rounded-full bg-muted/10 px-3 py-1 text-sm">#internship</button>
				</div>
			</div>

			<div class="rounded-xl border border-border bg-card p-4">
				<h4 class="mb-2 font-semibold">Create</h4>
				<p class="mb-3 text-sm text-foreground/60">
					Share an anonymous confession or tip with your community.
				</p>
				<div class="flex gap-2">
					<Button as="a" href="/post/new" class="w-full">New Confession</Button>
					<Button variant="outline" as="a" href="/post/new?type=tip" class="w-full"
						>Share Tip</Button
					>
				</div>
			</div>
		</aside>
	</div>
</div>

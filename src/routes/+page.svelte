<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
</script>

<!-- Landing Page -->
<div class="min-h-screen bg-background text-foreground">
	<!-- Navigation -->
	<nav class="border-b border-border">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<div class="flex items-center gap-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
					<span class="font-bold text-primary-foreground">C</span>
				</div>
				<span class="text-xl font-bold">Coveat</span>
			</div>
			<div class="flex items-center gap-4">
				<a href={resolve('/feed')} class="text-sm transition-colors hover:text-primary">Dashboard</a
				>
				<Button class="bg-primary hover:bg-primary/90">Get Started</Button>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="mx-auto max-w-7xl px-6 py-24">
		<div class="grid items-center gap-12 md:grid-cols-2">
			<!-- Left Content -->
			<div class="space-y-8">
				<div class="space-y-4">
					<h1 class="text-5xl leading-tight font-bold md:text-6xl">
						Express your <span class="text-primary">crush</span> with freedom
					</h1>
					<p class="text-xl leading-relaxed text-foreground/70">
						Share your college confessions anonymously or openly. Find out who's crushing on you.
						Build genuine connections through honest expressions.
					</p>
				</div>

				<div class="flex flex-col gap-4 sm:flex-row">
					<Button class="bg-primary px-8 py-6 text-lg hover:bg-primary/90">
						Create Your First Confession
					</Button>
					<Button
						variant="outline"
						class="border-primary px-8 py-6 text-lg text-primary hover:bg-primary/10"
					>
						Explore Feed
					</Button>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-6 pt-8">
					<div>
						<p class="text-3xl font-bold text-primary">2.5K+</p>
						<p class="text-sm text-foreground/60">Confessions Daily</p>
					</div>
					<div>
						<p class="text-3xl font-bold text-primary">10K+</p>
						<p class="text-sm text-foreground/60">Active Users</p>
					</div>
					<div>
						<p class="text-3xl font-bold text-primary">100%</p>
						<p class="text-sm text-foreground/60">Anonymous Option</p>
					</div>
				</div>
			</div>

			<!-- Right Visual -->
			<div class="relative h-96 md:h-full">
				<div
					class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
				></div>
				<div class="relative flex h-full flex-col items-center justify-center p-8">
					<div class="space-y-4 text-center">
						<div class="text-6xl">💌</div>
						<p class="text-lg font-semibold">Confessions are flowing</p>
						<p class="text-sm text-foreground/60">Join the community</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="border-t border-border bg-secondary/20 py-24">
		<div class="mx-auto max-w-7xl px-6">
			<h2 class="mb-16 text-center text-4xl font-bold">Why Coveat?</h2>
			<div class="grid gap-8 md:grid-cols-3">
				<div
					class="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary"
				>
					<div class="mb-4 text-4xl">🔒</div>
					<h3 class="mb-3 text-xl font-bold">Privacy Guaranteed</h3>
					<p class="text-foreground/70">
						Confess anonymously without anyone knowing your identity. Your secrets are safe.
					</p>
				</div>
				<div
					class="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary"
				>
					<div class="mb-4 text-4xl">🌟</div>
					<h3 class="mb-3 text-xl font-bold">Real Connections</h3>
					<p class="text-foreground/70">
						Discover who's crushing on you and maybe find that special someone in your college.
					</p>
				</div>
				<div
					class="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary"
				>
					<div class="mb-4 text-4xl">💬</div>
					<h3 class="mb-3 text-xl font-bold">Community Vibes</h3>
					<p class="text-foreground/70">
						Connect with peers, share experiences, and be part of something real and authentic.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-24">
		<div class="mx-auto max-w-4xl space-y-8 px-6 text-center">
			<h2 class="text-4xl font-bold">Ready to express yourself?</h2>
			<p class="text-xl text-foreground/70">
				Join thousands of college students sharing their authentic feelings
			</p>
			<Button class="bg-primary px-12 py-6 text-lg hover:bg-primary/90">
				Start Confessing Now
			</Button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border bg-secondary/10 py-8">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-12 grid gap-8 md:grid-cols-4">
				<div>
					<h4 class="mb-4 font-bold">Coveat</h4>
					<p class="text-sm text-foreground/60">Express freely, connect genuinely.</p>
				</div>
				<div>
					<h4 class="mb-4 font-bold">Product</h4>
					<ul class="space-y-2 text-sm text-foreground/60">
						<li>
							<a href="/product/features" class="transition-colors hover:text-primary">Features</a>
						</li>
						<li>
							<a href="/product/pricing" class="transition-colors hover:text-primary">Pricing</a>
						</li>
						<li>
							<a href="/product/safety" class="transition-colors hover:text-primary">Safety</a>
						</li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 font-bold">Company</h4>
					<ul class="space-y-2 text-sm text-foreground/60">
						<li><a href="/company/about" class="transition-colors hover:text-primary">About</a></li>
						<li><a href="/company/blog" class="transition-colors hover:text-primary">Blog</a></li>
						<li>
							<a href="/company/contact" class="transition-colors hover:text-primary">Contact</a>
						</li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 font-bold">Legal</h4>
					<ul class="space-y-2 text-sm text-foreground/60">
						<li>
							<a href="/legal/privacy" class="transition-colors hover:text-primary">Privacy</a>
						</li>
						<li><a href="/legal/terms" class="transition-colors hover:text-primary">Terms</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-border pt-8 text-center text-sm text-foreground/60">
				<p>&copy; 2025 Coveat. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

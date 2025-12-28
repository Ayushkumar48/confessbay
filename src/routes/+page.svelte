<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { resolve } from '$app/paths';

	type Card = {
		id: number;
		emoji: string;
		colorA: string;
		colorB: string;
		size: string;
		top: string;
		left: string;
		rotate: number;
		delay: number;
		z: number;
	};

	const cards: Card[] = [
		{
			id: 1,
			emoji: '📸',
			colorA: '#FF7A18',
			colorB: '#AF002D',
			size: '220px',
			top: '18%',
			left: '12%',
			rotate: -12,
			delay: 120,
			z: 30
		},
		{
			id: 2,
			emoji: '🕶️',
			colorA: '#833AB4',
			colorB: '#FD1D1D',
			size: '180px',
			top: '38%',
			left: '24%',
			rotate: 8,
			delay: 240,
			z: 40
		},
		{
			id: 3,
			emoji: '🌿',
			colorA: '#4CAF50',
			colorB: '#8BC34A',
			size: '260px',
			top: '8%',
			left: '36%',
			rotate: -6,
			delay: 60,
			z: 20
		},
		{
			id: 4,
			emoji: '🎧',
			colorA: '#00d2ff',
			colorB: '#3a7bd5',
			size: '200px',
			top: '40%',
			left: '52%',
			rotate: 14,
			delay: 300,
			z: 50
		},
		{
			id: 5,
			emoji: '💜',
			colorA: '#ff9966',
			colorB: '#ff5e62',
			size: '150px',
			top: '22%',
			left: '62%',
			rotate: -20,
			delay: 420,
			z: 10
		}
	];

	let floatVals = $state(new Array(cards.length).fill(0));

	onMount(() => {
		let t = 0;
		const iv = setInterval(() => {
			t += 0.02;
			floatVals.forEach((_, i) => {
				const offset = Math.sin(t * (0.7 + i * 0.15)) * (6 + i);
				floatVals[i] = offset;
			});
		}, 40);

		return () => clearInterval(iv);
	});
</script>

<svelte:head>
	<title>ConfessBay — Explore</title>
	<meta
		name="description"
		content="A fresh instagram-style landing for ConfessBay. Login or Sign up to join."
	/>
</svelte:head>

<div
	class="h-screen w-screen overflow-hidden bg-background text-foreground grid md:grid-cols-[1fr_420px] items-center justify-center p-12 gap-12"
>
	<section
		class="relative h-full flex items-center justify-center"
		in:fly={{ x: -40, duration: 650 }}
		out:fade
	>
		<div
			class="relative w-11/12 h-5/6 max-w-300 rounded-2xl overflow-visible drop-shadow-[0_20px_40px_rgba(2,6,23,0.6)]"
		>
			{#each cards as card, i (card.id)}
				{#key card.id}
					<div
						class="absolute rounded-[20px] shadow-[0_10px_30px_rgba(2,6,23,0.6)] overflow-hidden backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(.2,.9,.2,1)] cursor-default"
						style="width: {card.size}; height: calc({card.size} * 1.35); top: {card.top}; left: {card.left}; z-index: {card.z}; transform: translateY({floatVals[
							i
						]}px) rotate({card.rotate}deg); background: linear-gradient(135deg, {card.colorA}, {card.colorB});"
						in:scale={{ duration: 520, delay: card.delay }}
						out:fade={{ duration: 400, delay: card.delay + 50 }}
					>
						<div class="flex flex-col justify-between h-full p-3 text-foreground">
							<div class="text-3xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]">{card.emoji}</div>
							<div
								class="flex-1 mt-3 rounded-lg bg-linear-to-b from-white/10 to-white/5 shadow-inner"
							></div>
							<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start mt-3">● story</div>
						</div>
					</div>
				{/key}
			{/each}

			<div
				class="absolute right-10 bottom-8 w-60 h-120 rounded-2xl bg-card shadow-2xl overflow-hidden -rotate-6 flex items-center justify-center"
				in:fly={{ y: 30, duration: 600, delay: 180 }}
			>
				<div
					class="w-11/12 h-11/12 bg-linear-to-b from-slate-900 to-slate-800 rounded-lg p-2 flex flex-col"
				>
					<div class="flex gap-2 p-1 items-center">
						<span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
						<span class="w-2.5 h-2.5 rounded-full bg-yellow-300"></span>
						<span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
					</div>
					<div class="grid gap-2 p-2 flex-1">
						<div
							class="rounded-lg p-3 text-black/60 font-bold h-27.5 bg-linear-to-b from-[#ff9a9e] to-[#fad0c4] shadow-inner"
						>
							Selfie
						</div>
						<div
							class="rounded-lg p-3 text-black/60 font-bold h-27.5 bg-linear-to-b from-[#a18cd1] to-[#fbc2eb] shadow-inner"
						>
							Friends
						</div>
						<div
							class="rounded-lg p-3 text-black/60 font-bold h-27.5 bg-linear-to-b from-[#f6d365] to-[#fda085] shadow-inner"
						>
							Vibes
						</div>
					</div>
					<div class="flex gap-3 p-2">
						<div class="bg-white/5 px-3 py-2 rounded-lg">♡</div>
						<div class="bg-white/5 px-3 py-2 rounded-lg">💬</div>
						<div class="bg-white/5 px-3 py-2 rounded-lg">✈️</div>
					</div>
				</div>
			</div>

			<div
				class="absolute rounded-full pointer-events-none opacity-6"
				style="width:520px;height:520px;right:-200px;top:-80px;transform:rotate(14deg);background:radial-gradient(circle at 30% 30%, #ff6a88, transparent 30%),radial-gradient(circle at 70% 70%, #5ee7df, transparent 30%);"
			></div>
			<div
				class="absolute rounded-full pointer-events-none opacity-6"
				style="width:420px;height:420px;left:-180px;bottom:-140px;transform:rotate(-24deg);background:radial-gradient(circle at 40% 40%, #a18cd1, transparent 30%),radial-gradient(circle at 70% 70%, #fbc2eb, transparent 30%);"
			></div>
		</div>
	</section>

	<section
		class="flex items-center justify-center h-full"
		in:fly={{ x: 40, duration: 650 }}
		out:fade
	>
		<div
			class="w-90 rounded-xl p-9 shadow-[0_30px_60px_rgba(2,6,23,0.6)] text-center bg-card text-card-foreground"
			in:fade={{ duration: 600 }}
		>
			<div class="mb-2" in:fade={{ delay: 120 }}>
				<span
					class="block text-4xl font-[Pacifico] text-foreground drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
				>
					ConfessBay
				</span>
				<span class="block text-sm text-muted-foreground mt-1">Share. Discover. Connect.</span>
			</div>

			<div class="mt-7 flex flex-col gap-3 items-center">
				<a
					class="w-full py-3 rounded-full font-bold text-base bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-[0_10px_30px_rgba(102,126,234,0.18)]"
					href={resolve('/login')}
					aria-label="Log in">Log in</a
				>
				<a
					class="w-full py-3 rounded-full font-bold text-base bg-linear-to-r from-orange-500 to-red-600 text-white shadow-[0_10px_30px_rgba(255,122,24,0.12)]"
					href={resolve('/signup')}
					aria-label="Sign up">Sign up</a
				>

				<div class="text-muted-foreground text-sm mt-1">OR</div>

				<a
					class="mt-1 text-primary text-sm rounded-md px-2 py-1 hover:bg-accent"
					href={resolve('/feed')}>Continue as Guest</a
				>
			</div>

			<div class="mt-4 text-xs text-muted-foreground">
				<p>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					By continuing you agree to our <a class="underline" href="/legal/terms">Terms</a> and
					<a class="underline" href="/legal/privacy">Privacy</a>.
				</p>
			</div>
		</div>
	</section>
</div>

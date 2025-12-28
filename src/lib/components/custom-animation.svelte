<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	let floatVals = $state([0, 0, 0, 0, 0]);

	onMount(() => {
		let t = 0;
		const iv = setInterval(() => {
			t += 0.02;
			floatVals.forEach((_, i) => {
				floatVals[i] = Math.sin(t * (0.7 + i * 0.15)) * (6 + i);
			});
		}, 40);
		return () => clearInterval(iv);
	});
</script>

<div class="relative items-center justify-center h-full hidden lg:flex -z-50">
	<div class="relative w-full max-w-250 h-125 lg:h-150 rounded-3xl overflow-visible">
		<div
			class="absolute inset-0 bg-linear-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl"
		></div>
		<div
			class="absolute top-10 left-10 w-80 h-80 bg-linear-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"
		></div>
		<div
			class="absolute bottom-20 right-20 w-96 h-96 bg-linear-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
		></div>

		<div
			class="absolute left-8 top-12 w-52 h-72 rounded-2xl shadow-2xl transform transition-transform duration-500"
			style="background: linear-gradient(135deg,#ff7a18,#af002d); transform: translateY({floatVals[0]}px) rotate(-12deg);"
			in:fly={{ x: -80, duration: 700 }}
		>
			<div class="h-full p-4 flex flex-col justify-between text-card-foreground">
				<div class="text-3xl">📸</div>
				<div class="rounded-lg bg-black/10 h-36"></div>
				<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start">● story</div>
			</div>
		</div>

		<div
			class="absolute left-32 top-4 w-60 h-80 rounded-2xl shadow-2xl transform transition-transform duration-500"
			style="background: linear-gradient(135deg,#4caf50,#8bc34a); transform: translateY({floatVals[1]}px) rotate(8deg);"
			in:fly={{ x: -60, duration: 750, delay: 100 }}
		>
			<div class="h-full p-4 flex flex-col justify-between text-card-foreground">
				<div class="text-3xl">🌿</div>
				<div class="rounded-lg bg-black/10 h-40"></div>
				<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start">● story</div>
			</div>
		</div>

		<div
			class="absolute left-56 top-24 w-48 h-64 rounded-2xl shadow-2xl transform transition-transform duration-500"
			style="background: linear-gradient(135deg,#00d2ff,#3a7bd5); transform: translateY({floatVals[2]}px) rotate(-6deg);"
			in:fly={{ x: -40, duration: 800, delay: 200 }}
		>
			<div class="h-full p-4 flex flex-col justify-between text-card-foreground">
				<div class="text-3xl">🎧</div>
				<div class="rounded-lg bg-black/10 h-32"></div>
				<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start">● story</div>
			</div>
		</div>

		<div
			class="absolute left-80 top-8 w-56 h-76 rounded-2xl shadow-2xl transform transition-transform duration-500"
			style="background: linear-gradient(135deg,#ff9966,#ff5e62); transform: translateY({floatVals[3]}px) rotate(14deg);"
			in:fly={{ x: -20, duration: 850, delay: 300 }}
		>
			<div class="h-full p-4 flex flex-col justify-between text-card-foreground">
				<div class="text-3xl">💜</div>
				<div class="rounded-lg bg-black/10 h-38"></div>
				<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start">● story</div>
			</div>
		</div>

		<div
			class="absolute left-96 top-32 w-44 h-60 rounded-2xl shadow-2xl transform transition-transform duration-500"
			style="background: linear-gradient(135deg,#833ab4,#fd1d1d); transform: translateY({floatVals[4]}px) rotate(-20deg);"
			in:fly={{ x: 0, duration: 900, delay: 400 }}
		>
			<div class="h-full p-4 flex flex-col justify-between text-card-foreground">
				<div class="text-3xl">🕶️</div>
				<div class="rounded-lg bg-black/10 h-28"></div>
				<div class="text-xs bg-black/25 px-3 py-1 rounded-full self-start">● story</div>
			</div>
		</div>

		<div
			class="absolute right-8 bottom-8 w-48 h-100 rounded-3xl shadow-2xl overflow-hidden -rotate-6"
			in:fly={{ x: 60, duration: 700, delay: 500 }}
			style="background: linear-gradient(180deg,#0f1724,#0b1220)"
		>
			<div class="p-4 flex flex-col h-full">
				<div class="flex gap-2 mb-3">
					<span class="w-3 h-3 rounded-full bg-red-400"></span>
					<span class="w-3 h-3 rounded-full bg-yellow-300"></span>
					<span class="w-3 h-3 rounded-full bg-green-400"></span>
				</div>
				<div class="flex-1 grid gap-3">
					<div class="rounded-lg bg-linear-to-b from-pink-300 to-pink-200 h-24"></div>
					<div class="rounded-lg bg-linear-to-b from-violet-300 to-violet-200 h-24"></div>
					<div class="rounded-lg bg-linear-to-b from-yellow-300 to-yellow-200 h-24"></div>
				</div>
				<div class="mt-4 flex gap-4 justify-between">
					<div class="bg-white/5 px-3 py-2 rounded-md">♡</div>
					<div class="bg-white/5 px-3 py-2 rounded-md">💬</div>
					<div class="bg-white/5 px-3 py-2 rounded-md">✈️</div>
				</div>
			</div>
		</div>
	</div>
</div>

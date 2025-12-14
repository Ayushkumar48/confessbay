<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { socketConnection } from '$lib/ws-connection';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		if (data.user) {
			const connectHandler = () => {
				// console.log('Connected to socket server - user is now online');
			};

			const disconnectHandler = () => {
				// console.log('Disconnected from socket server - user is now offline');
			};

			socketConnection.on('connect', connectHandler);
			socketConnection.on('disconnect', disconnectHandler);

			return () => {
				socketConnection.off('connect', connectHandler);
				socketConnection.off('disconnect', disconnectHandler);
			};
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />
<Toaster richColors />
<TooltipProvider>
	{@render children()}
</TooltipProvider>

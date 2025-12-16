<script>
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { accountLinks, generalLinks } from '$lib/constants';
	import { cn } from '$lib/utils';
	let { children } = $props();
	let currentPathContent = $derived(
		[...generalLinks, ...accountLinks].find((item) => page.url.pathname.startsWith(item.url))
	);
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header
			class="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex h-full items-center">
				<Sidebar.Trigger class="mr-2 ml-4" />
				<h1 class="border-l border-gray-300 pl-4 text-lg font-semibold">
					{currentPathContent?.headerText || ''}
				</h1>
			</div>
			<p class="py-4 pr-10 text-center text-foreground/60">
				{currentPathContent?.headerDescription || ''}
			</p>
		</header>

		<main class={cn('mx-auto w-full', !page.url.pathname.includes('messages') && 'p-6')}>
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

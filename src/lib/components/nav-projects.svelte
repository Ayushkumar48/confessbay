<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { accountLinks, generalLinks, type NavLink } from '$lib/constants';

	let currentPath = $derived(page.url.pathname);
</script>

{@render sidebarMenu('General', generalLinks)}
{@render sidebarMenu('Account', accountLinks)}

{#snippet sidebarMenu(heading: string, data: NavLink[])}
	<Sidebar.Group>
		<Sidebar.GroupLabel>{heading}</Sidebar.GroupLabel>
		<Sidebar.Menu>
			{#each data as item (item.name)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						class={cn(
							'hover:bg-accent hover:ring-1 hover:ring-ring',
							currentPath.startsWith(item.url) &&
								'cursor-default bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:ring-0'
						)}
					>
						{#snippet child({ props })}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={item.url} {...props} data-sveltekit-preload-code>
								<item.icon class={cn(item.colorClass)} />
								<span>{item.name}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.Group>
{/snippet}

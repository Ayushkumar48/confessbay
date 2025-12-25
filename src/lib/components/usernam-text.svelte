<script lang="ts">
	import { cn } from '$lib/utils';

	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	let {
		username,
		size = 'sm',
		class: className
	}: { username: string; size?: Size; class?: string } = $props();
</script>

<p class={cn('text-blue-500', `text-${size}`, className)}>@{username}</p>

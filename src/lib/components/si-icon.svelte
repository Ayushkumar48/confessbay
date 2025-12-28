<script lang="ts">
	let { svg, hex }: { svg: string; hex?: string } = $props();
	let safeSvg = $derived(
		svg
			.replace(/fill="[^"]*"/g, 'fill="currentColor"')
			.replace(/<path(?![^>]*fill)/g, '<path fill="currentColor"')
	);

	let style = $derived(`color: #${hex ?? '000000'}; width: 1.25rem; height: 1.25rem;`);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span class="flex items-center" {style}>{@html safeSvg}</span>

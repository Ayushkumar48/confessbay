<script lang="ts">
	let { errors = $bindable() }: { errors: string[] } = $props();
</script>

<ul class="list-disc pl-4 space-y-1">
	{#each errors as error (error)}
		<li class="text-red-500 text-sm">{error}</li>
	{/each}
</ul>

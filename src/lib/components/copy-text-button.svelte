<script lang="ts">
	import { CopyIcon, CheckIcon } from '@lucide/svelte';
	import { Button } from './ui/button';
	let copied = $state(false);

	let { copyText }: { copyText: string } = $props();

	async function copyToClipboard(url: string) {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<Button
	size="icon-sm"
	onclick={() => copyToClipboard(copyText)}
	class="relative transition duration-200"
>
	<CopyIcon
		class={`h-4 w-4 transition-all ${copied ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}
	/>
	<CheckIcon
		class={`absolute inset-0 m-auto h-4 w-4 transition-all ${
			copied ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
		}`}
	/>
</Button>

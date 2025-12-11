<script lang="ts">
	import CopyTextButton from './copy-text-button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from './ui/button';
	import { cn, shareToFacebook, shareToTwitter, shareToWhatsapp } from '$lib/utils';
	import { ShareIcon } from '@lucide/svelte';
	import SiIcon from './si-icon.svelte';
	import { siX, siFacebook, siWhatsapp } from 'simple-icons';
	import { toast } from 'svelte-sonner';

	let {
		shareUrl,
		class: className
	}: { shareUrl: string; class?: string | ReturnType<typeof buttonVariants> } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class={cn(className)}>
		<ShareIcon />Share
	</Dialog.Trigger>

	<Dialog.Content class="space-y-4">
		<Dialog.Header>
			<Dialog.Title>Share this confession</Dialog.Title>
			<Dialog.Description>
				Share this confession with your friends and community.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2">
			<div class="text-sm font-medium">Share link</div>
			<div class="flex items-center gap-2">
				<div class="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm">
					{shareUrl}
				</div>
				<CopyTextButton copyText={shareUrl} />
			</div>
		</div>

		<div class="space-y-2">
			<div class="text-sm font-medium">Share on social media</div>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Button variant="outline" onclick={() => shareToWhatsapp(shareUrl)} class="flex-1">
					<SiIcon svg={siWhatsapp.svg} hex={siWhatsapp.hex} />
					Whatsapp
				</Button>
				<Button variant="outline" onclick={() => shareToTwitter(shareUrl)} class="flex-1">
					<SiIcon svg={siX.svg} hex={siX.hex} />
					X (Twitter)
				</Button>

				<Button variant="outline" onclick={() => shareToFacebook(shareUrl)} class="flex-1">
					<SiIcon svg={siFacebook.svg} hex={siFacebook.hex} />
					Facebook
				</Button>
			</div>
		</div>
		{#if typeof navigator !== 'undefined' && navigator.share}
			<Button
				variant="outline"
				onclick={() => {
					navigator
						.share({
							title: 'Confession on Coveat',
							text: 'Check out this confession',
							url: shareUrl
						})
						.catch(() => {
							toast.error('Failed to share');
						});
				}}
				class="flex w-full items-center gap-2"
			>
				<ShareIcon class="h-4 w-4" />
				Share via device
			</Button>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import FileText from '@lucide/svelte/icons/file-text';
	import Image from '@lucide/svelte/icons/image';
	import Mic from '@lucide/svelte/icons/mic';
	import Plus from '@lucide/svelte/icons/plus';
	import Camera from '@lucide/svelte/icons/camera';
	import Video from '@lucide/svelte/icons/video';
	import { Button } from '$lib/components/ui/button';
	import { chatMessageType } from '$lib/shared/enums';
	import { cn } from '$lib/utils';

	let { canSendMessages = $bindable() }: { canSendMessages: boolean } = $props();

	type ChatMessageType = (typeof chatMessageType)[number];

	function handleAttachment(type: ChatMessageType) {
		console.log('Attachment type:', type);
	}

	const attachments: Array<{
		type: ChatMessageType;
		label: string;
		icon: typeof FileText;
		color: string;
	}> = [
		{ type: 'file', label: 'Document', icon: FileText, color: 'bg-purple-500' },
		{ type: 'image', label: 'Photos', icon: Image, color: 'bg-blue-500' },
		{ type: 'image', label: 'Camera', icon: Camera, color: 'bg-pink-500' },
		{ type: 'audio', label: 'Audio', icon: Mic, color: 'bg-orange-500' },
		{ type: 'video', label: 'Video', icon: Video, color: 'bg-emerald-500' }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				aria-label="Attachments"
				disabled={!canSendMessages}
			>
				<Plus
					class="size-5 text-foreground/80 transition-transform group-data-[state=open]:rotate-45"
				/>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content side="top" align="center" class="w-64 p-3">
		<div class="grid grid-cols-3">
			{#each attachments as { type, label, icon: Icon, color }, i (i)}
				<DropdownMenu.Item
					class="flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-muted focus:bg-muted"
					onclick={() => handleAttachment(type)}
				>
					<div class={cn('rounded-full p-3', color)}>
						<Icon class="size-5 text-white" />
					</div>
					<span class="text-xs text-foreground/80">{label}</span>
				</DropdownMenu.Item>
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import { Input } from './ui/input';

	let { image = $bindable() }: { image: File | undefined } = $props();
	let avatarUrl = $state('');
	function handleFileChange(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const file = event.currentTarget.files?.item(0) as File;
		image = file;
		if (file) {
			avatarUrl = URL.createObjectURL(file);
		}
	}
</script>

<div class="flex justify-center">
	<div class="group inline-block cursor-pointer">
		<label for="avatar" class="block">
			<div class="relative inline-block transition-transform duration-200 group-hover:scale-105">
				<div
					class="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md"
				>
					{#if avatarUrl}
						<img src={avatarUrl} alt="Avatar" class="h-full w-full object-cover" />
					{:else}
						<UserRoundIcon class="size-12 text-gray-400" />
					{/if}

					<div
						class="absolute inset-0 flex items-center justify-center rounded-full bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
					></div>

					<div
						class="absolute right-1 bottom-1 rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all duration-200 group-hover:scale-110 group-hover:bg-gray-100"
					>
						<PencilIcon class="size-4 text-gray-700" />
					</div>
				</div>
			</div>
		</label>

		<Input
			name="avatar"
			id="avatar"
			type="file"
			accept="image/*"
			class="hidden"
			oninput={handleFileChange}
		/>
	</div>
</div>

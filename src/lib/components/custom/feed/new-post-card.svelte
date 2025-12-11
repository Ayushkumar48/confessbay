<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Button } from '$lib/components/ui/button';
	import SendIcon from '@lucide/svelte/icons/send';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import VideoIcon from '@lucide/svelte/icons/video';
	import ImageIcon from '@lucide/svelte/icons/image';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import EmojiList from './emoji-list.svelte';
	import NewPostSettings from './new-post-settings.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { confessionsInsertSchema, type ConfessionsInsertSchema } from '$lib/client/schema';
	import type z from 'zod';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import type { ConfessionWithToAndFrom } from '$lib/shared';

	let {
		form: newPostForm,
		confessionPosts = $bindable()
	}: {
		form: SuperValidated<z.infer<ConfessionsInsertSchema>>;
		confessionPosts: ConfessionWithToAndFrom[];
	} = $props();
	const form = superForm(newPostForm, {
		validators: zod4Client(confessionsInsertSchema),
		dataType: 'json',
		onUpdated: ({ form }) => {
			if (form.valid) {
				confessionPosts.unshift(form.message.newConfessionPost);
				toast.success('Successfully posted the confession!');
			} else {
				Object.values(form.errors).forEach((errors) => {
					if (Array.isArray(errors) && errors.length > 0) {
						toast.error(errors[0]);
					} else if (typeof errors === 'string') {
						toast.error(errors);
					}
				});
			}
		}
	});
	const { form: formData, enhance } = form;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Share Your Confession</Card.Title>
		<Card.Description class="flex items-center gap-x-1">
			Express your innermost thoughts <HeartIcon class="size-4.5 fill-pink-500 text-pink-700" />
		</Card.Description>
	</Card.Header>
	<form
		class="flex flex-col justify-center gap-2"
		method="POST"
		action="?/post"
		use:enhance
		enctype="multipart/form-data"
	>
		<Card.Content>
			<Form.Field {form} name="message">
				<Form.Control>
					{#snippet children({ props })}
						<Textarea
							{...props}
							placeholder="What's on your mind? Share your thoughts anonymously..."
							class="max-h-[80vh] min-h-24"
							bind:value={$formData.message}
						/>
					{/snippet}
				</Form.Control>
			</Form.Field>
			<div class="flex items-center justify-between py-4">
				<EmojiList bind:postMessage={$formData.message} />
				<Form.Field {form} name="images">
					<Form.Control>
						{#snippet children({ props })}
							<Button size="sm" variant="ghost" class="cursor-pointer p-0 ring-1 ring-emerald-300">
								<label
									class="flex h-full w-full cursor-pointer items-center justify-center gap-x-2 px-2"
								>
									<ImageIcon class="fill-emerald-300 text-emerald-700" />
									<input
										{...props}
										type="file"
										accept="image/png, image/jpg, image/webp, image/jpeg"
										hidden
										multiple
										oninput={(e) => ($formData.images = Array.from(e.currentTarget.files ?? []))}
									/>
									Images
								</label>
							</Button>
						{/snippet}
					</Form.Control>
				</Form.Field>

				<Form.Field {form} name="video">
					<Form.Control>
						{#snippet children({ props })}
							<Button size="sm" variant="ghost" class="cursor-pointer p-0 ring-1 ring-cyan-300">
								<label
									class="flex h-full w-full cursor-pointer items-center justify-center gap-x-2 px-2"
								>
									<VideoIcon class="fill-cyan-300 text-cyan-700" />
									<input
										{...props}
										type="file"
										accept="video/*"
										hidden
										multiple
										name="videos"
										oninput={(e) => ($formData.video = e.currentTarget.files?.item(0) as File)}
									/>
									Video
								</label>
							</Button>
						{/snippet}
					</Form.Control>
				</Form.Field>
				<NewPostSettings {form} />
			</div>
		</Card.Content>
		<Card.Footer class="flex justify-end">
			<Form.Button size="sm" type="submit" class="group">
				<SendIcon
					class="transition-all duration-2000 ease-in-out group-focus:-translate-y-40 group-focus:-rotate-45"
				/>
				Confess it
			</Form.Button>
		</Card.Footer>
	</form>
</Card.Root>

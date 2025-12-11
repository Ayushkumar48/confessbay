<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="mx-auto max-w-4xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Settings</h1>

	<div class="space-y-6">
		<div class="rounded-xl border border-border bg-card p-6">
			<h3 class="mb-4 font-semibold">Privacy</h3>
			<div class="space-y-3">
				<label class="flex cursor-pointer items-center gap-3">
					<input type="checkbox" checked class="h-4 w-4" />
					<span>Allow anonymous confessions about me</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<input type="checkbox" checked class="h-4 w-4" />
					<span>Show my profile publicly</span>
				</label>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-card p-6">
			<h3 class="mb-4 font-semibold">Notifications</h3>
			<div class="space-y-3">
				<label class="flex cursor-pointer items-center gap-3">
					<input type="checkbox" checked class="h-4 w-4" />
					<span>Get notified when someone confesses to you</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<input type="checkbox" checked class="h-4 w-4" />
					<span>Get notified on new messages</span>
				</label>
			</div>
		</div>

		<div class="rounded-xl border border-border bg-card p-6">
			<h3 class="mb-4 font-semibold">Account</h3>
			<Button variant="destructive" class="w-full">Delete Account</Button>
		</div>
	</div>
</div>

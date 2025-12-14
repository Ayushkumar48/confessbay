import { onMount, onDestroy } from 'svelte';
import { browser } from '$app/environment';

type VisibilityCallback = (messageId: string) => void;

export function useMessageVisibility(
	getElement: () => HTMLElement | null,
	messageId: string,
	isOwnMessage: boolean,
	isRead: boolean,
	onVisible: VisibilityCallback
) {
	let observer: IntersectionObserver | null = null;
	let visibilityTimer: ReturnType<typeof setTimeout> | null = null;
	let isPageVisible = true;

	// Track page visibility
	function handleVisibilityChange() {
		if (!browser) return;
		isPageVisible = !document.hidden;

		// If page becomes hidden, clear any pending timers
		if (!isPageVisible && visibilityTimer) {
			clearTimeout(visibilityTimer);
			visibilityTimer = null;
		}
	}

	function cleanup() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		if (visibilityTimer) {
			clearTimeout(visibilityTimer);
			visibilityTimer = null;
		}
		if (browser) {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		}
	}

	onMount(() => {
		if (!browser) return;

		// Don't track own messages or already read messages
		if (isOwnMessage || isRead) {
			return;
		}

		const element = getElement();
		if (!element) {
			return;
		}

		// Listen to page visibility changes
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Create Intersection Observer
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && isPageVisible && !isRead) {
						// Message is visible and page is focused
						// Wait 1 second before marking as read
						if (visibilityTimer) {
							clearTimeout(visibilityTimer);
						}

						visibilityTimer = setTimeout(() => {
							// Double-check page is still visible and not already read
							if (browser && !document.hidden && !isRead) {
								onVisible(messageId);
							}
						}, 1000);
					} else {
						// Message is no longer visible, cancel timer
						if (visibilityTimer) {
							clearTimeout(visibilityTimer);
							visibilityTimer = null;
						}
					}
				});
			},
			{
				threshold: 0.5, // At least 50% of message must be visible
				rootMargin: '0px'
			}
		);

		observer.observe(element);
	});

	onDestroy(() => {
		cleanup();
	});
}

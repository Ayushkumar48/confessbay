import { resolve } from '$app/paths';
import type { Component } from 'svelte';
import FlameIcon from '@lucide/svelte/icons/flame';
import MessageSquareIcon from '@lucide/svelte/icons/message-square';
import UserIcon from '@lucide/svelte/icons/user';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import SettingsIcon from '@lucide/svelte/icons/settings';
import BookmarkIcon from '@lucide/svelte/icons/bookmark';

export type NavLink = {
	name: string;
	url: ResolvedUrl;
	icon: Component;
	colorClass?: string;
	headerText: string;
	headerDescription: string;
};

export const generalLinks: NavLink[] = [
	{
		name: 'Feed',
		url: resolve('/feed'),
		icon: FlameIcon,
		colorClass: 'text-orange-500 fill-orange-400',
		headerText: 'Your Feed',
		headerDescription: 'See what people are sharing and confessing.'
	},
	{
		name: 'Discover',
		url: resolve('/discover'),
		icon: SparklesIcon,
		colorClass: 'text-yellow-400',
		headerText: 'Discover',
		headerDescription: 'Explore new confessions and stories from people nearby.'
	},
	{
		name: 'Messages',
		url: resolve('/messages'),
		icon: MessageSquareIcon,
		colorClass: 'text-sky-500',
		headerText: 'Messages',
		headerDescription: 'Chat privately and connect with people you resonate with.'
	},
	{
		name: 'Profile',
		url: resolve('/profile'),
		icon: UserIcon,
		colorClass: 'text-emerald-500',
		headerText: 'Profile',
		headerDescription: 'View and personalize your profile, photos, and bio.'
	}
];

export const accountLinks: NavLink[] = [
	{
		name: 'Saved',
		url: resolve('/saved'),
		icon: BookmarkIcon,
		colorClass: 'text-yellow-500',
		headerText: 'Saved',
		headerDescription: 'Access the posts and confessions you’ve bookmarked.'
	},
	{
		name: 'Settings',
		url: resolve('/settings'),
		icon: SettingsIcon,
		colorClass: 'text-indigo-500',
		headerText: 'Settings',
		headerDescription: 'Adjust your preferences, privacy, and notifications.'
	}
];

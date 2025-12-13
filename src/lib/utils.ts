import { encodeBase32LowerCase } from '@oslojs/encoding';
import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import {
	adjectives,
	animals,
	colors,
	starWars,
	uniqueNamesGenerator
} from 'unique-names-generator';
import Globe2Icon from '@lucide/svelte/icons/globe-2';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import UsersIcon from '@lucide/svelte/icons/users';
import MessageSquareIcon from '@lucide/svelte/icons/message-square';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

export const visibilityIconConfig = {
	Public: { icon: Globe2Icon, color: 'text-green-600', bg: 'bg-green-50' },
	Friends: { icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
	College: { icon: GraduationCapIcon, color: 'text-purple-600', bg: 'bg-purple-50' }
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

/**
 * getInitials
 * Returns the initials of a given name.
 * Example: "John Doe" -> "JD"
 */
export function getInitials(name: string) {
	const words = name.split(' ');
	if (words.length === 1) return words[0].charAt(0).toUpperCase();
	return words.map((word) => word.charAt(0).toUpperCase()).join('');
}

/**
 * getTimeAgo
 * Returns a string representing the time difference between the given date and the current time.
 * Example: "2 minutes ago"
 */
export function getTimeAgo(date: Date): string {
	return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * getWhatsAppTime
 * Returns a WhatsApp-style time format for chat messages.
 * - Shows time (e.g., "10:07 am") if today
 * - Shows "Yesterday" if yesterday
 * - Shows day name (e.g., "Tuesday") if within this week
 * - Shows date (e.g., "12/25/2024") if older
 */
export function getWhatsAppTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;

	if (isToday(d)) {
		return format(d, 'h:mm a');
	}

	if (isYesterday(d)) {
		return 'Yesterday';
	}

	if (isThisWeek(d, { weekStartsOn: 0 })) {
		return format(d, 'EEEE');
	}

	return format(d, 'M/d/yyyy');
}

/**
 * formatDate
 * Returns the date, short month name and year for a given Date or ISO string.
 * Example: 4th Jul 2025
 */
export function formatDate(date?: string | Date | null): string {
	if (!date) return 'Unknown';
	const d = typeof date === 'string' ? parseISO(date) : date;
	return format(d as Date, 'do LLL yyyy');
}

/**
 * formatMonthYear
 * Returns the short month name and year for a given Date or ISO string.
 * Example: "Jul 2025"
 */
export function formatMonthYear(date?: string | Date | null): string {
	if (!date) return 'Unknown';
	const d = typeof date === 'string' ? parseISO(date) : date;
	return format(d as Date, 'MMM yyyy');
}

export const visibilityIcons = {
	Public: Globe2Icon,
	College: GraduationCapIcon,
	Friends: UsersIcon,
	Default: MessageSquareIcon
};

/**
 * generateRandomName
 * Generates a random name for a given seed.
 * Example: "ABC123" -> "orange_bunny"
 */
export function generateRandomName(seed: string) {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals, starWars],
		separator: '_',
		length: 2,
		style: 'lowerCase',
		seed
	});
}

/**
 * generateRandomAvatar
 * Generates a random avatar image as svg for a given seed.
 */
export function generateRandomAvatar(seed: string) {
	return createAvatar(adventurer, {
		size: 128,
		seed
	}).toJson().svg;
}

/**
 * generateRandomAvatarUrl
 * Generates a random avatar image as data url for a given seed.
 */
export function generateRandomAvatarUrl(seed: string) {
	return createAvatar(adventurer, {
		size: 128,
		seed
	}).toDataUri();
}

/**
 * createConversationId
 * Generates a conversation id for two users.
 */
export function createConversationId(userA: string, userB: string) {
	return [userA, userB].sort().join('_');
}

export function shareToTwitter(shareUrl: string) {
	const text = `Check out this confession on Coveat:\n${shareUrl}`;
	const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
	window.open(url, '_blank');
}

export function shareToFacebook(shareUrl: string) {
	const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
	window.open(url, '_blank');
}

export function shareToWhatsapp(shareUrl: string) {
	const text = `Check out this confession on Coveat:\n${shareUrl}`;
	const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
	window.open(url, '_blank');
}

export function getDisplayName(user?: { firstName: string; lastName: string | null } | null) {
	if (!user || !user.firstName) return '';
	return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

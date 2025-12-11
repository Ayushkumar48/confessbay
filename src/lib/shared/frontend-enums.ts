import { visibility } from '$lib/shared/enums';

const confessionCategories = [
	{ label: 'All', icon: '' },
	{ label: 'Crush', icon: '💘' },
	{ label: 'Love Story', icon: '❤️' },
	{ label: 'Heartbreak', icon: '💔' },
	{ label: 'Situationship', icon: '💞' },
	{ label: 'Funny Incident', icon: '😂' },
	{ label: 'Embarrassing Moment', icon: '😳' },
	{ label: 'College Gossip', icon: '🗣️' },
	{ label: 'Classroom Drama', icon: '🎭' },
	{ label: 'Hostel Life', icon: '🏠' },
	{ label: 'Events and Fests', icon: '🎉' },
	{ label: 'Canteen Chronicles', icon: '🍔' },
	{ label: 'Campus Crush', icon: '😍' },
	{ label: 'Friendship Issues', icon: '🤝' },
	{ label: 'Mental Health', icon: '🧠' },
	{ label: 'Loneliness', icon: '😔' },
	{ label: 'Academic Stress', icon: '📚' },
	{ label: 'College Issues', icon: '🏫' },
	{ label: 'Opinion', icon: '💬' },
	{ label: 'Advice', icon: '🧭' },
	{ label: 'Secret', icon: '🤫' },
	{ label: 'Apology', icon: '🙏' },
	{ label: 'Personal Growth', icon: '🌱' },
	{ label: 'Spicy Confession', icon: '🌶️' },
	{ label: 'Other', icon: '✨' }
] as const;

export { confessionCategories, visibility };

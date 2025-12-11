import type { Confession, Reply, Report, User } from './schema';

export * from './schema';

export type ReplyWithUser = Reply & {
	user: {
		id: string;
		firstName: string;
		lastName: string | null;
		username: string;
		avatar: string;
		anonymous: boolean;
	} | null;
};

export type ConfessionWithToAndFrom = {
	confession: Confession;
	confessedFromUser: User | null;
	confessedToUser: User | null;
	currentUserLiked: boolean;
	replies: ReplyWithUser[];
	reports: Report[];
};

export type UserLite = {
	id?: string;
	avatar?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	username?: string | null;
	anonymous?: boolean | null;
	[k: string]: unknown;
};

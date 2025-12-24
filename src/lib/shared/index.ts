import type { Confession, User } from './schema';

export * from './schema';

export type ReplyWithUser = {
	id: string;
	confessionId: string;
	message: string;
	createdAt: Date;
	user: User | UserLite | null;
};

export type ConfessionWithToAndFrom = {
	confession: Confession;
	confessedFromUser: User | UserLite | null;
	confessedToUser: User | UserLite | null;
	replies: ReplyWithUser[];
	reportsCount: number;
	currentUserLiked: boolean;
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

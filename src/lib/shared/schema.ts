import * as enums from './enums';
import { sql } from 'drizzle-orm';
import {
	pgTable,
	text,
	timestamp,
	date,
	boolean,
	pgEnum,
	uniqueIndex,
	integer,
	check,
	index,
	primaryKey,
	foreignKey
} from 'drizzle-orm/pg-core';

export const genderEnum = pgEnum('gender_enum', enums.gender);
export const friendshipStatusEnum = pgEnum('friendship_status_enum', enums.friendshipStatus);
export const authProviderTypeEnum = pgEnum('auth_provider_type_enum', enums.authProvider);
export const zodiacSignEnum = pgEnum('zodiac_sign_enum', enums.zodiacSign);
export const confessionCategoryEnum = pgEnum('confession_category_enum', enums.confessionCategory);
export const visibilityEnum = pgEnum('visibility_enum', enums.visibility);
export const reportStatusEnum = pgEnum('report_status_enum', enums.reportStatus);
export const notificationTypeEnum = pgEnum('notification_type_enum', enums.notificationType);
export const chatMessageTypeEnum = pgEnum('chat_message_type_enum', enums.chatMessageType);

export const colleges = pgTable('colleges', {
	id: text('id').primaryKey(),
	name: text('name').unique().notNull(),
	domain: text('domain').unique(), // e.g., '@iitd.ac.in'
	city: text('city'),
	state: text('state')
});

export const user = pgTable(
	'user',
	{
		id: text('id').primaryKey().notNull(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name'),
		username: text('username').notNull().unique(),
		email: text('email').unique().notNull(),
		phoneNumber: text('phone_number').unique(),
		gender: genderEnum().notNull(),
		authProvider: authProviderTypeEnum('auth_provider'),
		authProviderId: text('auth_provider_id').unique(),
		dateOfBirth: date('date_of_birth'),
		avatar: text('avatar').notNull(),
		collegeId: text('college_id').references(() => colleges.id, { onDelete: 'set null' }),
		collegeEmail: text('college_email').unique(),
		emailVerified: boolean('email_verified').default(false).notNull(),
		phoneVerified: boolean('phone_verified').default(false).notNull(),
		zodiacSign: zodiacSignEnum('zodiac_sign'),
		openToRelationships: boolean('open_to_relationships').default(false),
		totalConfessions: integer('total_confessions').default(0).notNull(),
		city: text('city'),
		bio: text('bio'),
		anonymous: boolean('anonymous').default(false).notNull(),
		password: text('password'),
		lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
			.defaultNow()
			.notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	() => [check('password_or_auth_provider', sql`auth_provider IS NOT NULL OR password IS NOT NULL`)]
);

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const friends = pgTable(
	'friends',
	{
		id: text('id').primaryKey().notNull(),
		userId1: text('user_id1')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		userId2: text('user_id2')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		requestedBy: text('requested_by').references(() => user.id),
		status: friendshipStatusEnum('status').default('pending').notNull(),
		acceptedAt: timestamp('accepted_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('unique_friendship').on(table.userId1, table.userId2),
		check('user_id_order', sql`user_id1 < user_id2`)
	]
);

export const confessions = pgTable('confessions', {
	id: text('id').primaryKey().notNull(),
	confessedFrom: text('confessed_from')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	confessedTo: text('confessed_to').references(() => user.id, { onDelete: 'cascade' }),
	message: text('message').notNull(),
	likes: integer('likes').default(0).notNull(),
	isAnonymous: boolean('is_anonymous').default(false),
	category: confessionCategoryEnum('category').default('Other').notNull(),
	reportCount: integer('report_count').default(0).notNull(),
	visibility: visibilityEnum('visibility').default('Public').notNull(),
	repliesEnabled: boolean('replies_enabled').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true, mode: 'date' })
		.defaultNow()
		.notNull()
});

export const replies = pgTable('replies', {
	id: text('id').primaryKey().notNull(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	confessionId: text('confession_id')
		.references(() => confessions.id, { onDelete: 'cascade' })
		.notNull(),
	message: text('message').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const likes = pgTable(
	'likes',
	{
		id: text('id').primaryKey().notNull(),
		userId: text('user_id')
			.references(() => user.id, { onDelete: 'cascade' })
			.notNull(),
		confessionId: text('confession_id')
			.references(() => confessions.id, { onDelete: 'cascade' })
			.notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	(table) => [uniqueIndex('unique_like').on(table.userId, table.confessionId)]
);

export const confessionPictures = pgTable('confession_pictures', {
	id: text('id').primaryKey().notNull(),
	confessionId: text('confession_id')
		.references(() => confessions.id, { onDelete: 'cascade' })
		.notNull(),
	imageUrl: text('image_url').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const chats = pgTable(
	'chats',
	{
		id: text('id').primaryKey().notNull(),
		senderId: text('sender_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		conversationId: text('conversation_id').notNull(),
		message: text('message'),
		iv: text('iv'),
		authTag: text('auth_tag'),
		chatMessageType: chatMessageTypeEnum('chat_message_type').default('text').notNull(),
		mediaUrl: text('media_url'),
		deliveredAt: timestamp('delivered_at', {
			withTimezone: true,
			mode: 'date'
		}),
		readAt: timestamp('read_at', {
			withTimezone: true,
			mode: 'date'
		}),
		repliedTo: text('replied_to'),
		isDeleted: boolean('is_deleted').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	(table) => [
		foreignKey({
			columns: [table.repliedTo],
			foreignColumns: [table.id]
		}).onDelete('set null'),
		index('idx_chats_conversation').on(table.conversationId),
		index('idx_chats_sender').on(table.senderId),
		index('idx_chats_created_at').on(table.createdAt),
		index('idx_chats_readat').on(table.readAt),
		sql`
				CHECK (
					${table.chatMessageType} <> 'text'
					OR (
						${table.message} IS NOT NULL
						AND ${table.iv} IS NOT NULL
						AND ${table.authTag} IS NOT NULL
					)
				)
			`
	]
);

export const conversations = pgTable(
	'conversations',
	{
		id: text('id').primaryKey(),
		userId1: text('user_id1')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		userId2: text('user_id2')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		lastMessageId: text('last_message_id').references(() => chats.id, { onDelete: 'cascade' }),
		unreadCountForUser1: integer('unread_count_user1').default(0).notNull(),
		unreadCountForUser2: integer('unread_count_user2').default(0).notNull(),
		isArchivedByUser1: boolean('is_archived_user1').default(false).notNull(),
		isArchivedByUser2: boolean('is_archived_user2').default(false).notNull(),
		isMutedByUser1: boolean('is_muted_user1').default(false).notNull(),
		isMutedByUser2: boolean('is_muted_user2').default(false).notNull(),
		isBlockedByUser1: boolean('is_blocked_user1').default(false).notNull(),
		isBlockedByUser2: boolean('is_blocked_user2').default(false).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'date'
		})
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'date'
		})
			.defaultNow()
			.notNull()
	},
	(table) => [
		uniqueIndex('unique_conversation_pair').on(table.userId1, table.userId2),
		check('conversation_id_order', sql`user_id1 < user_id2`)
	]
);

export const reports = pgTable(
	'reports',
	{
		id: text('id').primaryKey().notNull(),
		reportedBy: text('reported_by')
			.references(() => user.id, { onDelete: 'cascade' })
			.notNull(),
		confessionId: text('confession_id')
			.references(() => confessions.id, { onDelete: 'cascade' })
			.notNull(),
		reason: text('reason').notNull(),
		status: reportStatusEnum('status').default('Pending'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => [uniqueIndex('unique_report').on(table.reportedBy, table.confessionId)]
);

export const blockedUsers = pgTable('blocked_users', {
	id: text('id').primaryKey().notNull(),
	blockedBy: text('blocked_by')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	blockedUser: text('blocked_user')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

export const collegeVerification = pgTable('college_verification', {
	id: text('id').primaryKey().notNull(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	verificationCode: text('verification_code'),
	verified: boolean('verified').default(false),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' })
});

export const notifications = pgTable('notifications', {
	id: text('id').primaryKey().notNull(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	type: notificationTypeEnum('type').notNull(),
	entityId: text('entity_id'),
	message: text('message'),
	isRead: boolean('is_read').default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const followers = pgTable(
	'followers',
	{
		followerId: text('follower_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		followingId: text('following_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [primaryKey({ columns: [table.followerId, table.followingId] })]
);

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Confession = typeof confessions.$inferSelect;
export type Reply = typeof replies.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Friends = typeof friends.$inferSelect;
export type Followers = typeof followers.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;

export type ChatWithReply = Chat & {
	reply:
		| (Chat & { sender: { id: string; firstName: string; lastName: string | null } | null })
		| null;
};

import { gender } from '$lib/shared/enums';
import * as table from '$lib/shared/index';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const userSelectSchema = z.object({
	username: z.string().min(2, { message: 'Username must be at least 2 characters long' }).max(100),
	password: z.string().min(1, { message: 'Password must not be empty!' }).max(100)
});

const friendsSelectSchema = createSelectSchema(table.friends);
const baseUserInsertSchema = createInsertSchema(table.user);

const userInsertSchema = baseUserInsertSchema
	.extend({
		firstName: z
			.string()
			.min(2, { message: 'First name must be at least 2 characters long' })
			.max(100, { message: 'First name must be at most 100 characters long' }),
		lastName: z
			.string()
			.min(2, { message: 'Last name must be at least 2 characters long' })
			.max(100, { message: 'Last name must be at most 100 characters long' }),
		username: z
			.string()
			.min(2, { message: 'Username must be at least 2 characters long' })
			.max(100, { message: 'Username must be at most 100 characters long' }),
		email: z.email({ message: 'Invalid email address' }),
		avatar: z
			.instanceof(File, { message: 'Please upload a file.' })
			.refine((f) => f.size <= 10_000_000, 'Max 10 MB upload size.')
			.optional(),
		gender: z.enum(gender),
		dateOfBirth: z.string().optional(),
		city: z.string().optional(),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long' })
			.refine((val) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(val), {
				message: 'Password must contain at least one letter, one number, and one special character'
			}),
		confirmPassword: z.string().min(8).max(100)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

const confessionsInsertSchema = createInsertSchema(table.confessions, {
	repliesEnabled: z.boolean().default(true),
	isAnonymous: z.boolean().default(false),
	message: z.string().min(1, { message: "Confession message can't be empty" })
}).extend({
	images: z
		.instanceof(File, { message: 'Please upload an image file.' })
		.refine((f) => f.size < 10 * 1024 * 1024, 'Max 10 MB upload size.')
		.refine(
			(f) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type),
			'Only JPEG, PNG, or WEBP files are allowed.'
		)
		.array()
		.optional(),

	video: z
		.instanceof(File, { message: 'Please upload a video file.' })
		.refine((f) => f.size < 50 * 1024 * 1024, 'Max 50 MB upload size.')
		.refine(
			(f) => ['video/mp4', 'video/quicktime', 'video/webm'].includes(f.type),
			'Only MP4, MOV, or WEBM videos are allowed.'
		)
		.optional()
});

const chatsInsertSchema = createInsertSchema(table.chats, {
	deliveredAt: z.coerce.date(),
	readAt: z.coerce.date().nullable().optional(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

const conversationsInsertSchema = createInsertSchema(table.conversations, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date()
});

const repliesInsertSchema = createInsertSchema(table.replies);

type UserSelectSchema = typeof userSelectSchema;
type UserInsertSchema = typeof userInsertSchema;
type ConfessionsInsertSchema = typeof confessionsInsertSchema;
type RepliesInsertSchema = typeof repliesInsertSchema;
type ChatsInsertSchema = typeof chatsInsertSchema;

export {
	userSelectSchema,
	userInsertSchema,
	friendsSelectSchema,
	confessionsInsertSchema,
	repliesInsertSchema,
	chatsInsertSchema,
	conversationsInsertSchema
};
export type {
	UserSelectSchema,
	UserInsertSchema,
	ConfessionsInsertSchema,
	RepliesInsertSchema,
	ChatsInsertSchema
};

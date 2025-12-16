import { query } from '$app/server';
import { chatsInsertSchema } from '$lib/client/schema';
import z from 'zod';
import {
	deleteMessageFn,
	getConversationFn,
	getConversationForChatFn,
	getMessagesWithChatIdFn,
	storeChatFn
} from './functions';

export const getConversation = query(
	z.object({
		userId1: z.string().optional(),
		userId2: z.string().optional(),
		chatId: z.string().optional()
	}),
	getConversationFn
);

export const getConversationForChat = query(
	z.object({
		userId1: z.string().optional(),
		userId2: z.string().optional(),
		chatId: z.string().optional()
	}),
	getConversationForChatFn
);

export const storeChat = query(chatsInsertSchema, storeChatFn);

export const getMessagesWithChatId = query(
	z.object({ chatId: z.string() }),
	getMessagesWithChatIdFn
);

export const deleteMessage = query(
	z.object({ messageId: z.string(), deleterId: z.string(), senderId: z.string() }),
	deleteMessageFn
);

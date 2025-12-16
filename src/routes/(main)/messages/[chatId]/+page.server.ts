import { getConversationForChatFn, getMessagesWithChatIdFn } from './functions.js';

export async function load({ params }) {
	const chatId = params.chatId;
	const [{ currentChatUser, conversation, isUserOnline }, messages] = await Promise.all([
		getConversationForChatFn({ chatId }),
		getMessagesWithChatIdFn({ chatId })
	]);
	return { currentChatUser, conversation, messages, chatId, isUserOnline };
}

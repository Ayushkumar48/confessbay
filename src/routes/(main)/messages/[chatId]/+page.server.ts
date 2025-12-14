import { getConversationForChat, getMessagesWithChatId } from './data.remote';

export async function load({ params }) {
	const chatId = params.chatId;
	const [{ currentChatUser, conversation, isUserOnline }, messages] = await Promise.all([
		getConversationForChat({ chatId }),
		getMessagesWithChatId({ chatId })
	]);
	return { currentChatUser, conversation, messages, chatId, isUserOnline };
}

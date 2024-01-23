import Message from "../Models/Message";

export default class UnreadMessagesService {
    public async getUnreadMessagesCount(userId: string, conversationId: string): Promise<number> {
        const count = await Message.query()
        .where((q) => {
            q.where({ receiver_id: userId, conversation_id: conversationId, is_read: false })
        }).count("* as total");

        return Number(count[0].$extras.total)
    }
}

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Message from "../../Models/Message";
import Conversation from "../../Models/Conversation";
import SocketService from "../../Services/SocketService";

export default class MessagesController {
  private getReceiverId = (conversation: Conversation, id: string | undefined) => {
    return conversation.first_user_id === id ? conversation.second_user_id : conversation.first_user_id;
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!id) return response.badRequest({ message: "Conversation ID is required" });

    const conversation: Conversation | null = await Conversation.find(id);
    if (!conversation) return response.notFound({ message: "Conversation not found" });

    return response.ok(await Message.query()
    .where((q) => q.where({ conversation_id: id }))
    .preload("sender"));
  }

  public async create({ request, response, user }: HttpContextContract) {
    const { conversationId, content } = request.body();
    if (!conversationId || !content) return response.badRequest({message: "Missing conversation ID or content"});

    const conversation: Conversation | null = await Conversation.findOrFail(conversationId);
    if (!conversation) return response.notFound({ message: "Conversation not found" });

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: user?.id,
      receiver_id: this.getReceiverId(conversation, user?.id),
      content,
    });

    SocketService.io.emit("newMessage", message);
    
    return response.created({
      message,
      conversation,
    });
  }
}

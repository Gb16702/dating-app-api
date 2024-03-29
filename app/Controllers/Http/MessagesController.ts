import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Message from "../../Models/Message";
import Conversation from "../../Models/Conversation";
import SocketService from "../../Services/SocketService";
import Notification from "../../Models/Notification";
import UserFavoritesConversations from "App/Models/UserFavoritesConversations";

export default class MessagesController {
  private getReceiverId = (
    conversation: Conversation,
    id: string | undefined
  ) => {
    return conversation.first_user_id === id
      ? conversation.second_user_id
      : conversation.first_user_id;
  };

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!id)
      return response.badRequest({ message: "Conversation ID is required" });

    const conversation: Conversation | null = await Conversation.find(id);

    const isFavorite = await UserFavoritesConversations.query().where({
      userId: conversation?.first_user_id,
      conversationId: id,
    }).first();

    if (!conversation)
      return response.notFound({ message: "Conversation not found" });

    return response.ok({
      messages: await Message.query().where((q) => q.where({ conversation_id: id })),
      isFavorite: !!isFavorite,
    });
  }

  public async create({ request, response, user }: HttpContextContract) {
    const { conversationId, content } = request.body();
    if (!conversationId || !content)
      return response.badRequest({
        message: "Missing conversation ID or content",
      });

    const conversation: Conversation | null = await Conversation.findOrFail(
      conversationId
    );
    if (!conversation)
      return response.notFound({ message: "Conversation not found" });

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: user?.id,
      receiver_id: this.getReceiverId(conversation, user?.id),
      is_read: false,
      content,
    });

    SocketService.emitToUser(message.receiver_id, "new_message", message);

    const notification = await Notification.create({
      user_id: this.getReceiverId(conversation, user?.id),
      title: "Nouveau message",
      content: message.content,
    });

    const notificationWithProfile = await Notification.query()
      .where("id", notification.id)
      .preload("user", (q) => {
        q.preload("profile", (q) => {
          q.select("profile_picture", "first_name", "last_name");
        });
      })
      .first();

    SocketService.emitToUser(message.receiver_id, "notification", {
      id: notification.id,
      title: notification.title,
      content: message.content,
      user_id: notification.user_id,
      created_at: notification.createdAt,
      is_read: notification.is_read,
      user: notificationWithProfile?.user.toJSON(),
    });

    return response.created({
      message,
    });
  }
}

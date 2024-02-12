import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Conversation from "../../Models/Conversation";
import UserFavoritesConversations from "../../Models/UserFavoritesConversations";

export default class UserFavoritesConversationsController {
    public async checksIfPinned(userId: string | undefined, conversationId: string) {
        return await UserFavoritesConversations.query().where({
            userId,
            conversationId,
        }).first();
    }

    public async pin({ params, response, user }: HttpContextContract) {
    const { id } = params;
    if (!id) {
      return response.badRequest({ message: "Missing conversation id" });
    }

    const conversation = await Conversation.findOrFail(id);

    const isPinned: UserFavoritesConversations | null = await this.checksIfPinned(user?.id, conversation.id);
    if (isPinned) {
        await UserFavoritesConversations.query().where({
            userId: user?.id,
            conversationId: conversation.id,
        }).delete();

        return response.ok({ message: "Conversation désépinglée"})
    }

    await UserFavoritesConversations.create({
      userId: user?.id,
      conversationId: conversation.id,
    });

    return response.created({ message: "Conversation épinglée" });
  }
}

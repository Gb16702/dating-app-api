import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Conversation from "../../Models/Conversation";
import Message from "../../Models/Message";
import UserProfile from "../../Models/UserProfile";
import UserFavoritesConversations from "../../Models/UserFavoritesConversations";

export default class ConversationController {
  public async getAll({ response, user }: HttpContextContract) {
    if (!user) {
      return response.unauthorized({
        message: "Tu dois être connecté pour accéder à cette ressource",
      });
    }

    const conversations: Conversation[] = await Conversation.query()
      .where("first_user_id", user.id)
      .orWhere("second_user_id", user.id);

    const favoriteConversationsIds = (await UserFavoritesConversations.query()
      .where("userId", user.id)
      .select("conversationId")).map(fav => fav.conversationId);

    for (const conversation of conversations) {
      const lastMessage = await Message.query()
        .where("conversation_id", conversation.id)
        .orderBy("created_at", "desc")
        .first();

      conversation.$extras.lastMessage = lastMessage;
    }

    conversations.sort((a, b) => {
      const lastActivityA = a.$extras.lastMessage ? new Date(a.$extras.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
      const lastActivityB = b.$extras.lastMessage ? new Date(b.$extras.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();

      return lastActivityB - lastActivityA;
    });

    const profiles = await UserProfile.query()
      .select("first_name", "userId", "profile_picture")
      .whereIn(
        "userId",
        conversations.map((conversation) =>
          conversation.first_user_id === user.id ? conversation.second_user_id : conversation.first_user_id
        )
      );

    const conversationsWithProfilesAndMessages = conversations.map((conversation) => {
      const profile = profiles.find((p) => p.userId === (conversation.first_user_id === user.id ? conversation.second_user_id : conversation.first_user_id));
      return {
        ...conversation.toJSON(),
        profile: profile ? profile.toJSON() : null,
        lastMessage: conversation.$extras.lastMessage ? conversation.$extras.lastMessage.toJSON() : null,
        isFavorite: favoriteConversationsIds.includes(conversation.id),
      };
    });

    console.log(conversationsWithProfilesAndMessages);


    return response.ok({
      message: "Conversations",
      conversations: conversationsWithProfilesAndMessages,
    });
  }
}

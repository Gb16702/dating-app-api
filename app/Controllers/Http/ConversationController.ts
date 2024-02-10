import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Conversation from "../../Models/Conversation";

export default class ConversationController {
  public async getAll({ response, user }: HttpContextContract) {
    if (!user) {
      return response.unauthorized({
        message: "Tu dois être connecté pour accéder à cette ressource",
      });
    }

    const conversations: Conversation[] = await Conversation.query()
      .where("first_user_id", user?.id)
      .orWhere("second_user_id", user?.id);

    return response.ok({
      message: "Conversations",
      conversations,
    });
  }
}

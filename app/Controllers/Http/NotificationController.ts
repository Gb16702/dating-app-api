import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Notification from "../../Models/Notification";

export default class NotificationController {
  public async markAllAsRead({ response, user }: HttpContextContract) {
    if (!user) {
      return response.unauthorized({ message: "Vous n'êtes pas autorisé" });
    }

    await Notification.query()
      .where({ user_id: user?.id })
      .update({ is_read: true });
    return response.ok({ message: "Opération effectuée avec succès" });
  }

  public async getAll({ response, user }: HttpContextContract) {
    return response.ok(
      await Notification.query()
        .orderBy("created_at", "desc")
        .where({ user_id: user?.id })
        .andWhere("is_read", false)
        .preload("user", (q) => {
          q.preload("profile", (q) => {
            q.select("profile_picture", "first_name", "last_name");
          });
        })
        .limit(10)
    );
  }
}

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Notification from "../../Models/Notification";

export default class NotificationController {
  public async markAsRead({ params, response, user }: HttpContextContract) {
    const { id } = params;
    if (!id) return response.badRequest({ message: "Notification ID is required" });

    const notification: Notification | null = await Notification.findOrFail(id);
    if (!notification) return response.notFound({ message: "Notification not found" });

    if (notification.user_id !== user?.id) return response.forbidden({ message: "You are not allowed to mark this notification as read" });

    notification.is_read = true;
    await notification.save();

    return response.ok({ message: "Notification marked as read" });
  }

  public async getAll({ response, user }: HttpContextContract) {
    return response.ok(await Notification.query().where({ user_id: user?.id }).orderBy("created_at", "desc"));
  }
}
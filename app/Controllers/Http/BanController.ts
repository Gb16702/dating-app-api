import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import Ban from "../../Models/Ban";
import BanValidator from "../../Validators/BanValidator";

export default class BanController {
  public async create({ request, response, user }: HttpContextContract) {
    const { user_id, reason } = await request.validate(BanValidator);

    try {
      const userToBan: User | null = await User.findOrFail(user_id);

      if (userToBan.id === user?.id) {
        return response.unprocessableEntity({
          message: "You cannot ban yourself",
        });
      }

      if (userToBan.is_admin) {
        if (user?.email !== process.env.ADMIN_EMAIL) {
          return response.unprocessableEntity({
            message: "You cannot ban an admin",
          });
        }
      }

      await Ban.create({
        user_id: userToBan.id,
        reason,
        banned_by: user?.id,
      });

      await userToBan
        .merge({
          is_banned: true,
        })
        .save();

      return response.created({
        message: "User has been banned",
      });
    } catch (e) {
      return response.internalServerError({
        message: "Une erreur est survenue",
      });
    }
  }

  public async all({ response }: HttpContextContract) {
    try {
      const bans: Ban[] = await Ban.query().preload("user");
      return response.ok({
        bans,
      });
    } catch (e) {
      return response.internalServerError({
        message: "Une erreur est survenue",
      });
    }
  }

  public async delete({ response, params }: HttpContextContract) {
    const { id } = params;
    if(!id) return response.badRequest({message: "Missing id"})

    try {
      const ban: Ban | null = await Ban.findOrFail(id);
      await ban.delete();
      return response.ok({
        message: "Ban has been deleted",
      });
    } catch (e) {
      return response.internalServerError({
        message: "Une erreur est survenue",
      });
    }
  }
}

import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import UserBlocked from "App/Models/UserBlocked";
import UserMatch from "App/Models/UserMatch";

export default class BlockedUsersController {
  public  async create({ request, response, user }: HttpContextContract ) {
    if(!user) {
      return response.unauthorized({
        message: "Tu dois être connecté pour accéder à cette ressource",
      });
    }

    const { blockedUserId } = request.body();
    if(!blockedUserId) {
      return response.badRequest({ message: "ID de l'utilisateur manquant" });
    }

    const isAlreadyBlocked = await UserBlocked.query()
      .where({
        blocker_id: user.id,
        blocked_id: blockedUserId,
      })
      .first();

    if(isAlreadyBlocked) {
      return response.badRequest({ message: "L'utilisateur est déjà bloqué" });
    }

    await UserBlocked.create({
      blocker_id: user.id,
      blocked_id: blockedUserId,
    })

    const isExistingMatch = await UserMatch.query()
      .where({
        matcher_user_id: user.id,
        matched_user_id: blockedUserId,
      })
      .orWhere({
        matcher_user_id: blockedUserId,
        matched_user_id: user.id,
      })
      .first();

    if(isExistingMatch) {
      await isExistingMatch.delete();
    }

    return response.created({ message: "Utilisateur bloqué avec succès" });
  }

  public async delete({ params, response, user }) {
    const { id } = params;
    if (!id) {
      return response.badRequest({ message: "ID de l'utilisateur manquant" });
    }

    const verifyIfUserIsBlocked = await UserBlocked.query().where({
      blocker_id: user.id,
      blocked_id: id,
    }).first();

    if (!verifyIfUserIsBlocked) {
      return response.badRequest({ message: "L'utilisateur n'est pas bloqué" });
    }

    await verifyIfUserIsBlocked.delete();

    return response.ok({ message: "Utilisateur débloqué avec succès" });
  }
}

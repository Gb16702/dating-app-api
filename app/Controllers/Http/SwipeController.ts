import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Swipe from "../../Models/Swipe";
import User from "../../Models/User";
import Database, {
  TransactionClientContract,
} from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";

export default class SwipeController {
  public async create({ request, response, user }: HttpContextContract) {
    if (!user) return response.unauthorized({ message: "Invalid user" });

    const { swiped_id }: { swiped_id: User["id"] } = await request.validate({
      schema: schema.create({
        swiped_id: schema.string({}, [
          rules.exists({ table: "users", column: "id" }),
          rules.notIn([user.id]),
        ]),
      }),
    });

    const trx: TransactionClientContract = await Database.transaction();

    try {
      if (user.dailySwipesCount <= 0) {
        await trx.rollback();
        return response.badRequest({
          message: "Tu as dépassé le nombre de swipes journaliers",
        });
      }

      if(user.dailyLikesCount <= 0) {
        await trx.rollback();
        return response.badRequest({
          message: "Tu as dépassé le nombre de likes journaliers",
        });
      }

      const isExistingSwipe: Swipe | null = await Swipe.query({ client: trx })
        .where("swiper_user_id", user.id)
        .where("swiped_user_id", swiped_id)
        .first();

      if (isExistingSwipe) {
        await trx.rollback();
        return response.badRequest({
          message: "Tu as déjà swipé cet utilisateur",
        });
      }

      const swipe: Swipe = new Swipe();
      swipe.fill({ swiped_user_id: swiped_id, swiper_user_id: user.id });

      await swipe.useTransaction(trx).save();

      user.merge({
        dailySwipesCount: user.dailySwipesCount - 1,
        lastSwipeAt: DateTime.now(),
      });

      await user.useTransaction(trx).save();
      await trx.commit();

      return response.created({ message: "Swipe créé avec succès" });
    } catch (e) {
      await trx.rollback();
      process.env.NODE_ENV !== "production" && console.error(e);
      return response.internalServerError({
        message: "Erreur lors de la création du swipe",
      });
    }
  }
}

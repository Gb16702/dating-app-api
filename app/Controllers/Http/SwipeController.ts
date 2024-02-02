import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Swipe from "../../Models/Swipe";
import User from "../../Models/User";
import Database, {
  TransactionClientContract,
} from "@ioc:Adonis/Lucid/Database";

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
      const isExistingSwipe: Swipe | null = await Swipe.query({ client: trx })
      .where("swiper_id", user.id)
      .where("swiped_id", swiped_id)
      .first();

      if (isExistingSwipe) {
        await trx.rollback();
        return response.badRequest({ message: "Tu as déjà swipé cet utilisateur" });
      }

      const swipe: Swipe = new Swipe();
      swipe.fill({ swiperUserId: user.id, swipedUserId: swiped_id });

      await swipe.useTransaction(trx).save();

      user.merge({ dailySwipesCount: (user.dailySwipesCount - 1), lastSwipeAt: new Date() });

      await user.useTransaction(trx).save();
      await trx.commit();

      return response.created({ message: "Swipe créé avec succès" });
    } catch (e) {
      await trx.rollback();
      process.env.NODE_ENV !== "production" && console.error(e);
      return response.internalServerError({message: "Erreur lors de la création du swipe"});
    }
  }
}

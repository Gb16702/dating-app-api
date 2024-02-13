import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import User from "../../Models/User";
import UserMatch from "../../Models/UserMatch";
import Conversation from "../../Models/Conversation";
import SocketService from "App/Services/SocketService";
import Notification from "App/Models/Notification";

export default class MatchController {
  private async validateUser(userId: string) {
    return await User.query().where({ id: userId }).firstOrFail();
  }

  private async findExistingMatch(
    a: string,
    b: string
  ): Promise<UserMatch | null> {
    return await UserMatch.query()
      .where((q) => {
        q.where({ matcher_user_id: a, matched_user_id: b });
      })
      .orWhere((q) => {
        q.where({ matcher_user_id: b, matched_user_id: a });
      })
      .first();
  }

  public async create({ request, response, user }: HttpContextContract) {
    if (!user) return response.unauthorized({ message: "Invalid user" });

    const matcherId: string | undefined = user?.id;
    const { liked_id }: { liked_id: User["id"] } = await request.validate({
      schema: schema.create({
        liked_id: schema.string({}, [
          rules.exists({ table: "users", column: "id" }),
          rules.notIn([user.id]),
        ]),
      }),
    });

    if (!matcherId || !liked_id) {
      return response.badRequest({ message: "Utilisateur manquant" });
    }

    if (matcherId === liked_id) {
      return response.badRequest({
        message: "Tu ne peux pas te liker toi-même",
      });
    }

    if (user.dailySwipesCount <= 0) {
      return response.badRequest({
        message: "Tu as dépassé le nombre de swipes journaliers",
      });
    }

    if (user.dailyLikesCount <= 0) {
      return response.badRequest({
        message: "Tu as dépassé le nombre de likes journaliers",
      });
    }


    const getMatchInfos = await UserMatch.query()
      .where({
        matcher_user_id: matcherId,
        matched_user_id: liked_id,
      })
      .orWhere({
        matcher_user_id: liked_id,
        matched_user_id: matcherId,
      })
      .first();


    if (getMatchInfos) {
      if (getMatchInfos.is_match) {
        return response.badRequest({
          message: "Vous avez déjà matché ensemble",
        });
      }

      if (user?.id === getMatchInfos.matcher_user_id) {
        return response.badRequest({
          message: "Tu as déjà liké cet utilisateur",
        });
      }

      await user.save();

      if (getMatchInfos.is_match === false) {
        getMatchInfos.is_match = true;
        await getMatchInfos.save();
        user.merge({
          dailyLikesCount: user.dailyLikesCount - 1,
        });

        await user.save();
        const isExistingConversation = await Conversation.query()
          .where({
            first_user_id: matcherId,
            second_user_id: liked_id,
          })
          .orWhere({
            first_user_id: liked_id,
            second_user_id: matcherId,
          })
          .first();
        if (!isExistingConversation) {
          await Conversation.create({
            first_user_id: matcherId,
            second_user_id: liked_id,
          });
        }

        for(const id of [matcherId, liked_id])  {
          const notification = await Notification.create({
            title: "Nouveau match",
            content: "Vous avez matché avec un autre utilisateur",
            user_id: id,
          });

          const notificationWithProfile = await Notification.query()
            .where("id", notification.id)
            .where("user_id", notification.user_id)
            .preload("user", (q) => {
              q.preload("profile", (q) => {
                q.select("profile_picture", "first_name", "last_name");
              });
            }).first();

          SocketService.emitToUser(
            id, "notification", {
              id: notification.id,
              title: notification.title,
              content: notification.content,
              user_id: notification.user_id,
              created_at: notification.createdAt,
              is_read: notification.is_read,
              user: notificationWithProfile?.user.toJSON(),
            })
        }
      }
    } else {
      await UserMatch.create({
        matcher_user_id: matcherId,
        matched_user_id: liked_id,
      });

      user.merge({
        dailyLikesCount: user.dailyLikesCount - 1,
      });

      await user.save();
    }

    return response.ok({ message: "Status mis à jour" });
  }

  public async delete({ params, response, user }: HttpContextContract) {
    const from: string | undefined = user?.id;
    const { id: to } = params;

    if (!from || !to) {
      return response.badRequest({ message: "Utilisateur manquant" });
    }

    if (from === to) {
      return response.badRequest();
    }

    const { id: validatedFrom } = await this.validateUser(from);
    const { id: validatedTo } = await this.validateUser(to);

    const existingLike: UserMatch | null = await this.findExistingMatch(
      validatedFrom,
      validatedTo
    );

    if (!existingLike) {
      return response.badRequest({
        message: "Tu n'as pas liké cet utilisateur",
      });
    }

    await existingLike.delete();

    return response.ok({ message: "Status de match mis à jour" });
  }
}

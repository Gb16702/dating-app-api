import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import UserMatch from "../../Models/UserMatch";
import Conversation from "../../Models/Conversation";

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
    const matcherId: string | undefined = user?.id;
    const { receiverUserId } = request.body();

    if (!matcherId || !receiverUserId) {
      return response.badRequest({ message: "Missing user" });
    }

    if (matcherId === receiverUserId) {
      return response.badRequest({ message: "You cannot like yourself" });
    }

    const { id: validatedId } = await this.validateUser(receiverUserId);

    const existingLike: UserMatch | null = await this.findExistingMatch(
      matcherId,
      validatedId
    );

    if (existingLike) {
      if (!existingLike.is_match) {
        existingLike.is_match = true;
        await existingLike.save();

        await Conversation.create({
          first_user_id: matcherId,
          second_user_id: receiverUserId,
        });

        return response.ok({ message: "It's a match!" });
      }

      return response.badRequest({
        message: "You have already liked this user",
      });
    }

    await UserMatch.create({
      matcher_user_id: matcherId,
      matched_user_id: receiverUserId,
      is_match: false,
    });

    return response.ok({ message: "Match status updated" });
  }

  public async delete({ params, response, user }: HttpContextContract) {
    const from: string | undefined = user?.id;
    const { id: to } = params;

    if (!from || !to) {
      return response.badRequest({ message: "Missing user" });
    }

    if (from === to) {
      return response.badRequest({ message: "You cannot unlike yourself" });
    }

    const { id: validatedFrom } = await this.validateUser(from);
    const { id: validatedTo } = await this.validateUser(to);

    const existingLike: UserMatch | null = await this.findExistingMatch(
      validatedFrom,
      validatedTo
    );

    if (!existingLike) {
      return response.badRequest({
        message: "You have not liked this user",
      });
    }

    await existingLike.delete();

    return response.ok({ message: "Match status updated" });
  }
}

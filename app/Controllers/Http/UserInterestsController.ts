import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import UserInterest from "../../Models/UserInterest";
import Redis from "@ioc:Adonis/Addons/Redis";
import Interest from "../../Models/Interest";

export default class UserInterestsController {
  public async all({ request, response }: HttpContextContract) {
    const token: string | undefined = request
      .header("Authorization")
      ?.replace("Bearer ", "");

    const user_id: string | null = await Redis.get(`token:${token}`);
    if (!user_id) {
      return response.unauthorized({ message: "Token invalide ou expiré" });
    }

    const userInterests = await UserInterest.query()
      .where("user_id", user_id)
      .preload("interest");

    return response.ok({
      userInterests,
    });
  }

  public async addUserInterests({ request, response }: HttpContextContract) {
    const { interests } = request.body();

    if (!interests || !interests.length) {
      return response.badRequest({ message: "Bad request" });
    }

    const token: string | undefined = request
      ?.header("Authorization")
      ?.replace("Bearer ", "");
    const user_id: string | null = await Redis.get(`token:${token}`);

    if (!user_id) {
      return response.unauthorized({ message: "Token invalide ou expiré" });
    }

    for (const interest of interests) {
      const areInterestsExisting = await Interest.findBy("id", interest.id);
      if (!areInterestsExisting) {
        return response.badRequest({ message: "Interest not found" });
      }

      const isUserInterestExisting = await UserInterest.query()
        .where("user_id", user_id)
        .where("interest_id", interest.id)
        .first();

      if (isUserInterestExisting) {
        return response.badRequest({ message: "Interest already exists" });
      }

      await UserInterest.create({
        user_id,
        interest_id: interest.id,
      });
    }

    return response.ok({
      message: "Les intérêts ont été ajoutés avec succès",
    });
  }

  public async removeUserInterests({ request, response }: HttpContextContract) {
    const { interests } = request.body();

    console.log(interests);

    if (!interests || !interests.length) {
      return response.badRequest({ message: "Bad request" });
    }

    const token: string | undefined = request
      ?.header("Authorization")
      ?.replace("Bearer ", "");

    const user_id = await Redis.get(`token:${token}`);
    if (!user_id) {
      return response.unauthorized({ message: "Token invalide ou expiré" });
    }

    for (const interest of interests) {
      const isUserInterestExisting = await UserInterest.query()
        .where("user_id", user_id)
        .where("interest_id", interest.id)
        .first();

      if (!isUserInterestExisting) {
        return response.badRequest({ message: "Interest not found" });
      }

      await isUserInterestExisting.delete();
    }

    return response.ok({
      message: "La suppression a été effectuée avec succès",
    });
  }
}

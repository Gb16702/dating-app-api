import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import { isPasswordValid } from "../../../utils/passwordActions";
import NewPasswordValidator from "../../Validators/NewPasswordValidator";
import UserFavoriteTrack from "../../Models/UserFavoriteTrack";
import Env from "@ioc:Adonis/Core/Env";
import type { NormalizedData } from "./SpotifyDataController";
import City from "../../Models/City";
import UserMatch from "../../Models/UserMatch";

type LatLng = {
  currentUserLat: number;
  currentUserLng: number;
  userLat: number;
  userLng: number;
};

export default class UsersController {
  public async me({ user, response }: HttpContextContract) {
    if (!user) {
      return response.badRequest({ message: "Invalid user" });
    }

    const data: User | null = await User.query()
      .select(
        "id",
        "email",
        "is_admin",
        "is_verified",
        "is_banned",
        "is_profile_complete"
      )
      .preload("profile", (q) => {
        q.select(
          "gender_id",
          "city_id",
          "first_name",
          "last_name",
          "date_of_birth",
          "bio",
          "profile_picture",
          "is_profile_displayed"
        );
      })
      .preload("favorite_tracks")
      .preload("user_secondary_profile_pictures", (q) => {
        q.select("picture_url");
        q.select("public_id");
      })
      .where("id", user?.id)
      .firstOrFail();

    return response.ok({ data });
  }

  public async editPassword({ request, response, user }: HttpContextContract) {
    if (!user) {
      return response.badRequest({ message: "Invalid user" });
    }

    const { password, newPassword } = await request.validate(
      NewPasswordValidator
    );

    const isVerified: boolean = await isPasswordValid({
      hashedPassword: user.password,
      plainTextPassword: password,
    });

    if (!isVerified) {
      return response.badRequest({ message: "Invalid password" });
    }

    const isSamePassword: boolean = await isPasswordValid({
      hashedPassword: user.password,
      plainTextPassword: newPassword,
    });

    if (isSamePassword) {
      return response.badRequest({
        message: "New password must be different from old password",
      });
    }

    user.password = newPassword;

    await user.save();

    return response.ok({
      message: "Password updated",
    });
  }

  private transformDateOfBirthToAge(dateOfBirth: Date): number {
    const date = new Date(dateOfBirth);
    return Math.abs(
      new Date(Date.now() - date.getTime()).getUTCFullYear() - 1970
    );
  }

  private calculateDistance({
    currentUserLat,
    currentUserLng,
    userLat,
    userLng,
  }: LatLng): number {
    const Δλ = ((userLng - currentUserLng) * Math.PI) / 180,
      distanceFactor =
        Math.pow(((userLat - currentUserLat) * Math.PI) / 180 / 2, 2) +
        Math.pow(Math.cos((userLat * Math.PI) / 180), 2) *
          Math.pow(Math.sin(Δλ / 2), 2);

    return Math.round(
      (6371e3 *
        (2 *
          Math.atan2(
            Math.sqrt(distanceFactor),
            Math.sqrt(1 - distanceFactor)
          ))) /
        1000
    );
  }

  public async meetUsers({ request, user, response }: HttpContextContract) {
    const token: string | undefined = request
      .header("Authorization")
      ?.replace("Bearer ", "");
    if (!user) return response.badRequest({ message: "Invalid user" });

    if (user?.dailySwipesCount <= 0) {
      return response.badRequest({
        message: "Tu as atteint ta limite de swipes journalière",
      });
    }

    if (user?.dailyLikesCount <= 0) {
      return response.badRequest({
        message: "Tu as atteint ta limite de likes journalière",
      });
    }

    const page = request.input("page", 1);
    const limit = Math.min(user.dailySwipesCount, 10);

    const preferredGenderIds: number[] = (
      await user.related("preferredGenders").query()
    ).map((g) => g.gender_id);
    const myGender = await user.related("profile").query().firstOrFail();

    const { cityId } = await user.related("profile").query().firstOrFail();
    const { latitude: currentUserLat, longitude: currentUserLng } =
      await City.query()
        .select("latitude", "longitude")
        .where("id", cityId)
        .firstOrFail();

    const matchedUsers = await UserMatch.query()
      .where({
        matcher_user_id: user.id,
      })
      .orWhere({
        matched_user_id: user.id,
      })
      .where("is_match", true)
      .exec();

    const matchedUsersSet = new Set<string>();
    matchedUsers
      .map((match) => {
        return {
          matched_user_id: match.matched_user_id,
          matcher_user_id: match.matcher_user_id,
        };
      })
      .forEach((match) => {
        if (match.matched_user_id !== user.id)
          matchedUsersSet.add(match.matched_user_id);
        if (match.matcher_user_id !== user.id)
          matchedUsersSet.add(match.matcher_user_id);
      });

    const matchArray = Array.from(matchedUsersSet);

    const users: User[] | any = await User.query()
      .where((q) => q.whereNot({ id: user.id }))
      .where({
        is_banned: false,
        is_profile_complete: true,
      })
      .whereHas("preferredGenders", (q) => {
        q.where("gender_id", myGender.genderId).orWhere("gender_id", 2);
      })
      .whereHas("profile", (q) => {
        q.where({ is_profile_displayed: true });
        if (!preferredGenderIds.includes(2))
          q.whereIn("gender_id", preferredGenderIds);
      })
      .whereDoesntHave("bans", (q) => {
        q.where({
          banned_by: user.id,
          is_active: true,
        });
      })
      .whereNotIn(
        "id",
        (
          await user.related("swiper").query()
        ).map((swipe) => swipe.swiped_user_id)
      )
      .whereNotIn(
        "id",
        (
          await UserMatch.query().where("matcher_user_id", user.id)
        ).map((match) => match.matched_user_id)
      )
      .whereNotIn("id", matchArray)
      .select("id", "is_verified")
      .preload("profile", (q) =>
        q.select(
          "bio",
          "profile_picture",
          "first_name",
          "date_of_birth",
          "city_id"
        )
      )
      .paginate(page, limit);

    let enrichedUsers: Record<string, any>[] = [];

    for (const user of users) {
      const tracks: UserFavoriteTrack[] = await user
        .related("favorite_tracks")
        .query();

      const array: string[] = tracks.map((t) => t.track_id);
      console.log(array)

      const { latitude: userLat, longitude: userLng } = await City.query()
        .select("latitude", "longitude")
        .where("id", user.profile.cityId)
        .firstOrFail();

      const latLngObject: LatLng = {
        currentUserLat: Number(currentUserLat),
        currentUserLng: Number(currentUserLng),
        userLat: Number(userLat),
        userLng: Number(userLng),
      };

      let tracksData: any = [];
      console.log(tracksData, array.length)
      if (array.length) {
        const fetchResponse = await fetch(
          `${Env.get("SERVER_URL")}/api/users/spotify/getTrack`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ array }),
          }
        );


        console.log("OKOKOK")

        if (fetchResponse.ok) {
          console.log("OK")
          const { tracksData: tracks } = (await fetchResponse.json()) as {
            tracksData: NormalizedData;
          };
          tracksData = tracks;
        }
      }

      const enrichedUser = {
        ...user.toJSON(),
        ...user.profile.toJSON(),
        age: this.transformDateOfBirthToAge(user.profile.date_of_birth),
        distance: this.calculateDistance(latLngObject),
        tracksData,
      } as Record<string, any>;

      delete enrichedUser.profile;
      delete enrichedUser.date_of_birth;
      delete enrichedUser.city_id;

      enrichedUsers.push(enrichedUser);
    }

    return response.ok({ users: enrichedUsers, total: users.total });
  }

  public async getUserMatches({ user, response }: HttpContextContract) {
    if (!user) return response.badRequest({ message: "Invalid User"})

    const getCurrentUserMatches = await UserMatch.query()
      .where({
        matcher_user_id: user.id,
        is_match: true,
      })
      .orWhere({
        matched_user_id: user.id,
        is_match: true,
      }).orderBy("created_at", "desc")
      .limit(10).exec();

    let matches: any[] = [];
    for (const match of getCurrentUserMatches) {
      const otherUser = await User.query()
        .where({
          id: match.matched_user_id === user.id ? match.matcher_user_id : match.matched_user_id
        }).preload("profile", q => {
          q.select("first_name", "last_name", "profile_picture");
        }).first();

      matches.push(otherUser);
    }

    return response.ok({ matches });
  }

  public async deleteAccount({ user, response }: HttpContextContract) {
    if (!user) {
      return response.badRequest({ message: "Invalid user" });
    }

    await user.delete();

    return response.ok({ message: "Account deleted" });
  }

  public async getMatchesProfile({ params, response }: HttpContextContract) {
    const userId = params.id;

    if (!userId) {
      return response.badRequest({ message: "User ID is required" });
    }

    try {
      const user = await User.query()
        .preload("favorite_tracks")
        .preload("user_secondary_profile_pictures")
        .preload("profile")
        .first();

        console.log(user);

      return response.ok({ profile: user.profile });
    } catch (error) {
      return response.notFound({ message: "User not found" });
    }
  }
}

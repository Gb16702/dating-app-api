import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ProfileSetupPayload } from "../../../types/ProfilePayloadTypes";
import Redis from "@ioc:Adonis/Addons/Redis";
import User from "../../Models/User";
import Gender from "../../Models/Gender";
import UserProfile from "../../Models/UserProfile";
import UserPreferredGender from "../../Models/UserPreferredGender";
import UserFavoriteTrack from "../../Models/UserFavoriteTrack";
import City from "../../Models/City";
import UploadImage from "../../Services/UploadImage";
import UserSecondaryProfilePicture from "../../Models/UserSecondaryProfilePicture";
import type { MultipartFileContract } from "@ioc:Adonis/Core/BodyParser";

export default class ProfilesController {
  private userProfile = new UserProfile();
  private userPreferredGender = new UserPreferredGender();

  public async setup({ request, response }: HttpContextContract) {
    const data: ProfileSetupPayload = JSON.parse(request.input("json_data"));
    const token: string | undefined = request
      .header("Authorization")
      ?.replace("Bearer ", "");
    const user_id: string | null = await Redis.get(`token:${token}`);

    if (!user_id)
      return response.unauthorized({ message: "Token invalide ou expiré" });

    const preferred_gender: Gender | null = await Gender.find(
      data.gender_preference
    );
    if (!preferred_gender)
      return response.badRequest({ message: preferred_gender });

    const city = await City.findOrFail(data.city_id);
    const user = await User.findOrFail(user_id);

    this.userPreferredGender.fill({ user_id, gender_id: preferred_gender.id });

    const favoriteTracksPromises: Promise<UserFavoriteTrack>[] =
      data.favorite_tracks_ids.map((track_id) => {
        const userFavoriteTrack = new UserFavoriteTrack();
        userFavoriteTrack.fill({ user_id, track_id });
        return userFavoriteTrack.save();
      });

    const userPictures: MultipartFileContract[] = request.files(
      "user_pictures",
      {
        size: "5mb",
        extnames: ["jpg", "png", "jpeg", "webp"],
      }
    );

    let errorMessages: string[] = [];

    const invalidFiles: MultipartFileContract[] = userPictures.filter((file) => !file.isValid);
    invalidFiles.forEach((file) => errorMessages = errorMessages.concat(file.errors.map((error) => error.message)));

    if (invalidFiles.length)
      return response.badRequest({ message: errorMessages });

    const uploadPromises: Promise<string>[] = userPictures.map(
      ({ tmpPath }) => {
        if (!tmpPath)
          return Promise.reject(
            "Le fichier n'a pas de chemin temporaire défini"
          );
        return UploadImage.upload(tmpPath);
      }
    );

    const [main_picture, ...secondary_pictures] = await Promise.all(uploadPromises);

    const secondaryPicturesPromises: Promise<UserSecondaryProfilePicture>[] =
      secondary_pictures.map((picture_url) => {
        const userSecondaryProfilePicture = new UserSecondaryProfilePicture();
        userSecondaryProfilePicture.fill({ user_id, picture_url });
        return userSecondaryProfilePicture.save();
      });

    this.userProfile.fill({
      userId: user.id,
      first_name: data.first_name,
      last_name: data.last_name,
      cityId: city.id,
      date_of_birth: data.date_of_birth,
      bio: data.bio,
      genderId: data.gender,
      profile_picture: main_picture,
    });

    await Promise.all([
      this.userProfile.save(),
      this.userPreferredGender.save(),
      ...favoriteTracksPromises,
      ...secondaryPicturesPromises,
    ]).then(() => {
      user.is_profile_complete = true;
      return user.save();
    }).then(() => response.ok({ message: "Ton profil a été configuré avec succès" }))
    .catch((e) => response.badRequest({ message: e }))
  }
}

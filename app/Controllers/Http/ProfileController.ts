import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
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

  public async setup({ request, response, user }: HttpContextContract) {
    const birth_date_fd = JSON.parse(request.input("birth_date"));
    const first_name_fd = JSON.parse(request.input("first_name"));
    const last_name_fd = JSON.parse(request.input("last_name"));
    const { gender: gender_fd } = JSON.parse(request.input("gender"));
    const { gender: preferred_gender_fd } = JSON.parse(
      request.input("preferred_gender")
    );
    const additional_informations_fd = JSON.parse(
      request.input("additional_informations")
    );
    const city_fd = JSON.parse(request.input("city"));
    const tracks_fd = JSON.parse(request.input("tracks"));

    const files = request.allFiles();
    let fileList: MultipartFileContract[] = [];
    for (const fileArray of Object.values(files)) {
      fileList = Array.isArray(fileArray) ? fileArray : [fileArray];

      for (const file of fileList) {
        if (file) {
          console.log(file.size > 5 * 1024 * 1024);

          if (file.size > 5 * 1024 * 1024) {
            return response.badRequest({
              message: `Le fichier ${file.clientName} est trop volumineux. La taille maximale autorisée est de 5MB.`,
            });
          }
          const allowedExtensions = ["jpg", "png", "jpeg", "webp"];
          if (!allowedExtensions.includes(file.extname as string)) {
            return response.badRequest(
              `L'extension du fichier ${file.clientName} n'est pas autorisée.`
            );
          }
        }
      }
    }

    const preferred_gender: Gender | null = await Gender.findByOrFail(
      "id",
      Number(preferred_gender_fd) - 1
    );
    const city = await City.findOrFail(city_fd.id);

    const authUser = await User.findOrFail(user?.id);
    this.userPreferredGender.fill({
      user_id: authUser?.id,
      gender_id: preferred_gender.id,
    });

    const favoriteTracksPromises: Promise<UserFavoriteTrack>[] = tracks_fd.map(
      ({ id }: any) => {
        const userFavoriteTrack = new UserFavoriteTrack();
        userFavoriteTrack.fill({ user_id: authUser?.id, track_id: id });
        return userFavoriteTrack.save();
      }
    );

    let errorMessages: string[] = [];

    const invalidFiles: MultipartFileContract[] = fileList.filter(
      (file) => !file.isValid
    );
    invalidFiles.forEach(
      (file) =>
        (errorMessages = errorMessages.concat(
          file.errors.map((error) => error.message)
        ))
    );

    if (invalidFiles.length)
      return response.badRequest({ message: errorMessages });

    const uploadPromises: Promise<string>[] = fileList.map(({ tmpPath }) => {
      if (!tmpPath)
        return Promise.reject("Le fichier n'a pas de chemin temporaire défini");
      return UploadImage.upload(tmpPath);
    });

    const [main_picture, ...secondary_pictures] = await Promise.all(
      uploadPromises
    );

    const secondaryPicturesPromises: Promise<UserSecondaryProfilePicture>[] =
      secondary_pictures.map((picture_url) => {
        const userSecondaryProfilePicture = new UserSecondaryProfilePicture();
        userSecondaryProfilePicture.fill({
          user_id: authUser?.id,
          picture_url,
        });
        return userSecondaryProfilePicture.save();
      });

    const birth_date = new Date(
      birth_date_fd.year,
      birth_date_fd.month - 1,
      birth_date_fd.day
    );

    const formatted_birth_date = [
      birth_date.getDate().toString().padStart(2, "0"),
      (birth_date.getMonth() + 1).toString().padStart(2, "0"),
      birth_date.getFullYear(),
    ].join("-");

    this.userProfile.fill({
      userId: authUser?.id,
      first_name: first_name_fd,
      last_name: last_name_fd,
      cityId: city.id,
      date_of_birth: new Date(formatted_birth_date),
      bio: additional_informations_fd.bio,
      genderId: Number(gender_fd) - 1,
      profile_picture: main_picture,
    });

    this.userProfile.related("user").query().update({ is_profile_complete: true });

    await Promise.all([
      this.userProfile.save(),
      this.userPreferredGender.save(),
      ...favoriteTracksPromises,
      ...secondaryPicturesPromises,
    ])
      .then(() => {
        authUser.is_profile_complete = true;
        return authUser.save();
      })
      .then(() =>
        response.ok({ message: "Ton profil a été configuré avec succès" })
      )
      .catch((e) => response.badRequest({ message: e }));

    return response.ok({
      req: request.allFiles(),
    });
  }
}

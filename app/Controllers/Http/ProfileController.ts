import type { MultipartFileContract } from "@ioc:Adonis/Core/BodyParser";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import City from "../../Models/City";
import Gender from "../../Models/Gender";
import User from "../../Models/User";
import UserFavoriteTrack from "../../Models/UserFavoriteTrack";
import UserPreferredGender from "../../Models/UserPreferredGender";
import UserProfile from "../../Models/UserProfile";
import UserSecondaryProfilePicture from "../../Models/UserSecondaryProfilePicture";
import UploadImage from "../../Services/UploadImage";
import { StrictValues } from "@ioc:Adonis/Lucid/Database";

export default class ProfilesController {
  private userProfile = new UserProfile();
  private userPreferredGender = new UserPreferredGender();

  private verifyFile(file: MultipartFileContract) {
    if (file.size > 5 * 1024 * 1024) {
      return `Le fichier ${file.clientName} est trop volumineux. La taille maximale autorisée est de 5MB.`;
    }
    const allowedExtensions = ["jpg", "png", "jpeg", "webp"];
    if (!allowedExtensions.includes(file.extname as string)) {
      return `L'extension du fichier ${file.clientName} n'est pas autorisée.`;
    }
  }

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

    if (!birth_date_fd.year || !birth_date_fd.month || !birth_date_fd.day || isNaN(birth_date_fd.year) || isNaN(birth_date_fd.month) || isNaN(birth_date_fd.day)) {
      return response.badRequest({ message: "La date de naissance fournie est invalide." });
    }

    const files = request.allFiles();
    let fileList: MultipartFileContract[] = [];
    for (const fileArray of Object.values(files)) {
      fileList = Array.isArray(fileArray) ? fileArray : [fileArray];

      for (const file of fileList) {
        if (file) {
          const error = this.verifyFile(file);
          if (error) {
            return response.badRequest({ message: error });
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

    const uploadPromises: Promise<any>[] = fileList.map(({ tmpPath }) => {
      if (!tmpPath)
        return Promise.reject("Le fichier n'a pas de chemin temporaire défini");
      return UploadImage.upload(tmpPath);
    });

    const [main_picture, ...secondary_pictures] = (await Promise.all(
      uploadPromises
    )) as any[];

    const secondaryPicturesPromises: Promise<UserSecondaryProfilePicture>[] =
      secondary_pictures.map(({ picture_url, public_id }: any) => {
        const userSecondaryProfilePicture = new UserSecondaryProfilePicture();
        userSecondaryProfilePicture.fill({
          user_id: authUser?.id,
          picture_url,
          public_id,
        });
        return userSecondaryProfilePicture.save();
      });

    const year = parseInt(birth_date_fd.year, 10);
    const month = parseInt(birth_date_fd.month, 10);
    const day = parseInt(birth_date_fd.day, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return response.badRequest({ message: "La date de naissance fournie est invalide." });
    }

    const formatted_birth_date = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;

    // const birth_date = new Date(
    //   birth_date_fd.year,
    //   birth_date_fd.month - 1,
    //   birth_date_fd.day
    // );
    //
    // const formatted_birth_date = [
    //   birth_date.getDate().toString().padStart(2, "0"),
    //   (birth_date.getMonth() + 1).toString().padStart(2, "0"),
    //   birth_date.getFullYear(),
    // ].join("-");

    this.userProfile.fill({
      userId: authUser?.id,
      first_name: first_name_fd,
      last_name: last_name_fd,
      cityId: city.id,
      date_of_birth: formatted_birth_date,
      bio: additional_informations_fd.bio,
      genderId: Number(gender_fd) - 1,
      profile_picture: main_picture.picture_url,
    });

    this.userProfile
      .related("user")
      .query()
      .update({ is_profile_complete: true });

    try {
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
    } catch (e) {
      return response.badRequest({ message: e });
    }
  }

  public async editPicture({ request, response, user }: HttpContextContract) {
    const files = request.files("files");
    const roles = request.input("roles");
    const imageToDelete = request.input("imagesToDelete")
      ? JSON.parse(request.input("imagesToDelete"))
      : null;

    if (imageToDelete) {
      for (const publicId of imageToDelete) {
        if (publicId === "") continue;

        await UploadImage.delete(publicId);
        await UserSecondaryProfilePicture.query()
          .where("public_id", publicId)
          .delete();
      }
    }

    for (let index = 0; index < files.length; index++) {
      const role = Array.isArray(roles) ? roles[index] : roles;
      const file = files[index];

      const error = this.verifyFile(file);
      if (error) {
        return response.badRequest({ message: error });
      }

      const uploadResult = await UploadImage.upload(file.tmpPath as string);
      if (!uploadResult) {
        return response.internalServerError({
          message: "Failed to upload image",
        });
      }

      if (role === "main") {
        if (user) {
          const userProfile = await UserProfile.findByOrFail(
            "user_id",
            user.id
          );
          userProfile.profile_picture = uploadResult.picture_url;
          await userProfile.save();
        }
      } else if (role === "secondary") {
        await UserSecondaryProfilePicture.create({
          user_id: user?.id,
          picture_url: uploadResult.picture_url,
          public_id: uploadResult.public_id,
        });
      }
    }

    const main_picture = await UserProfile.query()
      .where("user_id", user?.id as StrictValues)
      .select("profile_picture")
      .first();

    const secondary_pictures = await UserSecondaryProfilePicture.query()
      .where("user_id", user?.id  as StrictValues)
      .select("picture_url")
      .exec();

    return response.ok({
      message: "Le profil a été mis à jour avec succès",
      profile_picture: main_picture?.profile_picture,
      secondary_pictures: secondary_pictures.map((pic) => pic.picture_url),
    });
  }
}

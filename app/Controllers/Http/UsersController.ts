import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import { isPasswordValid } from "../../../utils/passwordActions";
import NewPasswordValidator from "../../Validators/NewPasswordValidator";

export default class UsersController {
  public async me({ user, response }: HttpContextContract) {
    if (!user) {
      return response.badRequest({ message: "Invalid user" });
    }

    const data: User | null = await User.query()
      .select("id", "email", "is_admin", "is_verified", "is_banned", "is_profile_complete")
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
      }).preload("favorite_tracks").where("id", user?.id).firstOrFail();

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
}

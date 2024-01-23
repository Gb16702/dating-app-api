import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import { isPasswordValid } from "../../../utils/passwordActions";
import NewPasswordValidator from "../../Validators/NewPasswordValidator";

export default class UsersController {
  public async me({ user, response }: HttpContextContract) {
    if (!user) {
      return response.badRequest({ message: "Invalid user" });
    }

    const data: User = await User.query()
      .preload("profile")
      .preload("favorite_tracks")
      .where("id", user?.id)
      .firstOrFail();

    return response.ok({
      data,
    });
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

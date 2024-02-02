import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import RegisterValidator from "../../Validators/RegisterValidator";
import User from "../../Models/User";
import { AuthService } from "../../Services/AuthService";
import type { AuthPayload } from "../../../types/AuthPayloadTypes";
import Providers from "../../Models/Providers";

export default class RegistersController {
  public async post({ request, response }: HttpContextContract): Promise<void> {
    try {
      const validatedData: AuthPayload = await request.validate(
        RegisterValidator
      );

      const isExistingUser: User | null = await User.findBy(
        "email",
        validatedData.email
      );

      if (isExistingUser)
        return response.unprocessableEntity({
          message: "This email address already exists",
      });

      const userSchema: User = await User.create({
        email: validatedData.email,
        password: validatedData.password,
        is_admin: validatedData.email === process.env?.ADMIN_EMAIL && true,
        is_verified: false,
        is_profile_complete: false,
      });

      const provider: Providers = await Providers.create({
        user_id: userSchema.id,
        provider: "credentials",
      });

      await provider.save();

      const authService = new AuthService();
      const token: string = await authService.authenticate(userSchema.id);

      return response.created({
        message: "User created",
        token,
        id: userSchema.id,
      });
    } catch (error) {
      const message: string =
        process.env.NODE_ENV === "development"
          ? error.message
          : "Une erreur est survenue";
      return response.forbidden({ message });
    }
  }
}

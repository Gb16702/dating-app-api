import { AuthService } from "../../Services/AuthService";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import AuthValidator from "../../Validators/AuthValidator";
import User from "../../Models/User";
import { isPasswordValid } from "../../../utils/passwordActions";
import type { AuthPayload } from "../../../types/AuthPayloadTypes";
import ForgotPasswordValidator from "../../Validators/ForgotPasswordValidator";
import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";
import EmailService from "../../Services/EmailService";
import Providers from "../../Models/Providers";

export default class AuthController {
  public authService = new AuthService();
  public async login({ request, response }: HttpContextContract) {
    const validatedData: AuthPayload = await request.validate(AuthValidator);
    try {
      const user: User | null = await User.findBy("email", validatedData.email);
      if (!user) {
        return response.unprocessableEntity({
          message: "Invalid credentials",
        });
      }

      const isValid: boolean = await isPasswordValid({
        hashedPassword: user.password,
        plainTextPassword: validatedData.password,
      });

      if (!isValid) {
        return response.unprocessableEntity({
          message: "Invalid credentials",
        });
      }

      const token: string = await this.authService.authenticate(user.id);
      if (!token) {
        return response.internalServerError({
          message: "Unable to generate token",
        });
      }

      return response.ok({
        message: "Logged in",
        token,
        id: user.id,
      });
    } catch (error) {
      const message: string =
        process.env.NODE_ENV === "development"
          ? error.message
          : "Une erreur est survenue";
      return response.forbidden({ message });
    }
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email }: { email: string } = await request.validate(
      ForgotPasswordValidator
    );
    const user: User = await User.query()
      .preload("profile")
      .where("email", email)
      .firstOrFail();
    const token: string = jwt.sign({ id: user.id }, Env.get("APP_KEY"), {
      expiresIn: "1h",
    });
    const url = `${Env.get("FRONTEND_URL")}/forgot-password/${token}`;
    const data = { first_name: user.profile.first_name, url };

    EmailService.sendEmail(email, "d-a9024935c7c4471d8157da406d86d946", data);

    return response.ok({
      message: "Un mail a été envoyé à l'adresse indiquée",
    });
  }

  public async verifyToken({ request, response }: HttpContextContract) {
    const { token } = request.body();

    if (!token) {
      return response.unprocessableEntity({
        message: "Jeton invalide",
      });
    }

    const decodedToken = await jwt.verify(token, Env.get("APP_KEY"));
    if (!decodedToken) {
      return response.unprocessableEntity({
        message: "Jeton invalide",
      });
    }

    const isOutdated = Date.now() > decodedToken.exp * 1000;
    if (isOutdated) {
      return response.unprocessableEntity({
        message: "Jeton expiré",
      });
    }

    const user: User | null = await User.find(decodedToken.id);
    if (!user) {
      return response.unprocessableEntity({
        message: "Utilisateur introuvable",
      });
    }


    return response.ok({
      message: decodedToken,
    });
  }

  public async resetForgottenPassword({ request, response }: HttpContextContract) {
    const { token, password } = request.body();

    if (!token) {
      return response.unprocessableEntity({
        message: "Jeton invalide",
      });
    }

    const decodedToken = await jwt.verify(token, Env.get("APP_KEY"));
    if (!decodedToken) {
      return response.unprocessableEntity({
        message: "Jeton invalide",
      });
    }

    const isOutdated = Date.now() > decodedToken.exp * 1000;
    if (isOutdated) {
      return response.unprocessableEntity({
        message: "Jeton expiré",
      });
    }

    const user: User | null = await User.find(decodedToken.id);
    if (!user) {
      return response.unprocessableEntity({
        message: "Utilisateur introuvable",
      });
    }

    const isSamePassword: boolean = await isPasswordValid({
      hashedPassword: user.password,
      plainTextPassword: password,
    });

    if (isSamePassword) {
      return response.badRequest({
        message: "Le nouveau mot de passe doit être différent de l'ancien",
      });
    }

    user.password = password;

    await user.save();

    return response.ok({
      message: "Mot de passe mis à jour",
    });
  }

  public async verifySessionToken({ response, user }: HttpContextContract) {
    console.log(user);
    
    return response.ok({
      user
    })
  }

  public async logout({ request, response }: HttpContextContract) {
    try {
      const token: string =
        request.header("Authorization")?.split(" ")[1] || "";
      if (!token) {
        return response.unprocessableEntity({
          message: "Invalid token",
        });
      }

      await this.authService.revoke(token);
      return response.ok({
        message: "Logged out",
      });
    } catch (e) {
      return response.internalServerError({
        message: "Unable to logout",
      });
    }
  }
}

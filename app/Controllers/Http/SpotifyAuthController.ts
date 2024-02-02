import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import {
  AllyUserContract,
  SpotifyDriverContract,
  SpotifyToken,
} from "@ioc:Adonis/Addons/Ally";
import { AuthService } from "../../Services/AuthService";
import Providers from "../../Models/Providers";
import { randomUUID } from "crypto";
import Redis from "@ioc:Adonis/Addons/Redis";
import { afterCreate } from "@ioc:Adonis/Lucid/Orm";

export default class SpotifyAuthController {
  public authService = new AuthService();
  public async redirect({ ally, response }: HttpContextContract) {
    try {
      await ally.use("spotify").redirect();
    } catch (e) {
      return response.badRequest({ message: e });
    }
  }

  public async getAuthToken({ request, response }: HttpContextContract) {
    const sessionId: string | undefined = request
      .header("Authorization")
      ?.split(" ")[1];

    if (!sessionId)
      return response.status(400).json({ message: "Requête incomplète" });

    const token = await Redis.get(`sessionId:${sessionId}`);

    if (!token)
      return response.status(404).json({ message: "Token introuvable" });

    await Redis.del(`sessionId:${sessionId}`);

    const userId = await this.authService.verify(token);

    const user: User | null = await User.query()
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
      }).where("id", userId).firstOrFail();

    return response.ok({ token, user });
  }

  public async callback({ response, ally }: HttpContextContract) {
    try {
      const spotify: SpotifyDriverContract = ally.use("spotify").stateless();

      if (spotify.accessDenied()) {
        return response.badRequest({ message: "Access was denied" });
      }

      if (spotify.stateMisMatch()) {
        return response.badRequest({ message: "Request expired. Try again" });
      }

      if (spotify.hasError()) {
        return response.badRequest({ message: spotify.getError() });
      }

      const spotifyUser: AllyUserContract<SpotifyToken> = await spotify.user();
      if (!spotifyUser || !spotifyUser.email) {
        return response.badRequest({
          message: "Unable to get user or user email",
        });
      }

      // Cherche ou crée l'utilisateur basé sur l'email Spotify
      const user = await User.firstOrCreate(
        { email: spotifyUser.email },
        {
          email: spotifyUser.email,
          is_verified: false,
          is_profile_complete: false,
          is_admin: spotifyUser.email === process.env?.ADMIN_EMAIL,
        }
      );

      // Cherche ou crée le provider associé à l'utilisateur
      await Providers.firstOrCreate(
        { provider: "spotify", user_id: user.id },
        { provider: "spotify" }
      );
      
      const sessionId = randomUUID();

      const token = await this.authService.authenticate(user.id);
      if (!token) {
        return response.internalServerError({
          message: "Unable to generate token",
        });
      }

      await Redis.set(`sessionId:${sessionId}`, token, "EX", 300);
      return response.redirect(
        `http://localhost:3000/authentification/temp?sessionId=${sessionId}`
      );
    } catch (e) {
      return response.badRequest({ message: e.message });
    }
  }
}
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";
import { AllyUserContract, SpotifyDriverContract, SpotifyToken } from "@ioc:Adonis/Addons/Ally";
import { AuthService } from "../../Services/AuthService";

export default class SpotifyAuthController {
  public authService = new AuthService();
  public async redirect({ ally, response }: HttpContextContract) {
    try {
      await ally.use("spotify").redirect();
    } catch (e) {
      return response.badRequest({ message: e });
    }
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
      if (!spotifyUser) {
        return response.badRequest({ message: "Unable to get user" });
      }

      if (!spotifyUser.email) {
        return response.badRequest({ message: "Unable to get user email" });
      }

      const user: User | null = await User.findBy("email", spotifyUser.email);

      if (!user) {
        const userInstance = new User();

        userInstance.email = spotifyUser.email;
        userInstance.is_verified = userInstance.is_profile_complete = false;
        userInstance.is_admin = spotifyUser.email === process.env?.ADMIN_EMAIL && true;
        userInstance.provider = "spotify";

        await userInstance.save();
      } else if (user && user.provider !== "spotify") {
        return response.badRequest({ message: "An account with this email already exists" });
      }

      const token: string = await this.authService.authenticate(user!.id);
      if (!token) {
        return response.internalServerError({ message: "Unable to generate token" });
      }

      return response.ok({ message: "Logged in", token, user });
    } catch (e) {
      return response.badRequest({ message: e });
    }
  }
}

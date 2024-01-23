import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AuthService } from "../../Services/AuthService";

export default class RedisTempController {
  public async get({ response }: HttpContextContract): Promise<void> {

    const authService = new AuthService();
    const token = await authService.authenticate("56e08aab-bf4e-49be-b509-f718c09cd364");
    const auth = response.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "none",
      expires: new Date(Date.now() + 60 * 60 * 24 * 30),
    })

    return response.status(200).json({ message: "Token generated", auth });
  }
}

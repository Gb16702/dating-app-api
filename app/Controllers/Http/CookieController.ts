import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CookieController {
  public async get({ response }: HttpContextContract) {
    response.cookie("test", "test", {
      httpOnly: false,
      sameSite: "lax",
      expires: new Date(Date.now() + 60 * 60 * 24 * 30),
      secure: false,
      domain: "localhost",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response.status(200).json({ message: "Cookie generated" });
  }
}

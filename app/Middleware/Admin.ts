import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Redis from "@ioc:Adonis/Addons/Redis";
import User from "../Models/User";

export default class Admin {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const token = ctx.request.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return ctx.response.unauthorized({
        error: "You must be logged in to access this route",
      });
    }

    const userId = await Redis.get(`token:${token}`);
    if (!userId) {
      return ctx.response.unauthorized({
        error: "You must be logged in to access this route",
      });
    }

    const user = await User.find(userId);
    if (!user) {
      return ctx.response.unauthorized({
        error: "You must be logged in to access this route",
      });
    }

    if (!user.is_admin) {
      return ctx.response.unauthorized({
        error: "You must be an admin to access this route",
      });
    }

    ctx["user"] = user;

    console.log(ctx["user"]);

    await next();
  }
}

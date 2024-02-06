import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class LikeController {
  public async create({ request, response, user }: HttpContextContract) {
    return response.ok({ message: "Like created successfully" });
  }
}
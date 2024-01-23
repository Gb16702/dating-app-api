import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Gender from "../../Models/Gender";

export default class GendersController {
  public async getAll({ response }: HttpContextContract) {
    return response.ok({
        genders: await Gender.all()
    })
  }
}

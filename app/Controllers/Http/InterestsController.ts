import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Interest from "../../Models/Interest";

export default class InterestsController {
  public regex = /^[a-zA-Z]+$/;
  public async get({ request, response }: HttpContextContract) {
    const { id } = request.params();

    const interest: Interest | null = await Interest.find(id);
    if (!interest) {
      return response.notFound({ message: "Interest not found" });
    }

    return response.ok({
      interest,
    });
  }

  public async all({ response }: HttpContextContract) {
    return response.ok({
      interests: await Interest.all(),
    });
  }

  public async create({ request, response }: HttpContextContract) {
    const { name } = request.body();

    if (!name || !name.trim().length) {
      return response.badRequest({ message: "Name is required" });
    }

    if (!this.regex.test(name)) {
      return response.badRequest({ message: "Name must only contain letters" });
    }

    if (await Interest.findBy("name", name)) {
      return response.badRequest({ message: "Interest already exists" });
    }

    await Interest.create({ name });

    return response.ok({
      message: "L'intérêt a été créé avec succès",
      name,
    });
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params();

    const interest: Interest | null = await Interest.find(id);
    if (!interest) {
      return response.notFound({ message: "Interest not found" });
    }

    await interest.delete();

    return response.ok({
      message: "L'intérêt a été supprimé avec succès",
    });
  }

  public async update({ request, response }: HttpContextContract) {
    const { id } = request.params();

    const interest: Interest | null = await Interest.find(id);
    if (!interest) {
      return response.notFound({ message: "Interest not found" });
    }
    const { name } = request.body();
    if (!name.trim().length) {
      return response.badRequest({ message: "Name is required" });
    }

    if (!this.regex.test(name)) {
      return response.badRequest({ message: "Name must only contain letters" });
    }

    if (await Interest.findBy("name", name)) {
      return response.badRequest({ message: "Interest already exists" });
    }

    interest.name = name;

    await interest.save();

    return response.ok({
      message: "L'intérêt a été modifié avec succès",
    });
  }
}

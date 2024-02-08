import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Interest from "../../Models/Interest";

export default class InterestsController {
  public regex = /^[\wÀ-ü-\s]+$/;
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

  public async all({ request, response }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const getAll = request.input("getAll", false);

    const searchQuery = request.input('search');

    try {
      const query = Interest.query();

      if (searchQuery !== undefined) {
        query.whereRaw("LOWER(name) LIKE ?", [
          `%${searchQuery.toLowerCase()}%`,
        ]);
      }

      const interests = getAll
        ? await query.orderBy("name", "asc").exec()
        : await query.paginate(page, limit);

      return response.ok(interests);
    } catch (e) {
      console.error("Error getting paginated users:", e);
      return response.internalServerError({
        message: "Une erreur est survenue",
      });
    }
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

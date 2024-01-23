import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import City from "../../Models/City";
import CityValidator from "../../Validators/CityValidator";

type CityType = {
  name: string;
  latitude: string;
  longitude: string;
  zip: string;
};

export default class AdminCitiesController {
  public async get({ request, response }: HttpContextContract) {
    const { id } = request.params();

    try {
      const city: City | null = await City.query()
        .where("id", id)
        .firstOrFail();

      return response.ok({
        city,
      });
    } catch (_) {
      return response.notFound({
        message: "City not found",
      });
    }
  }

  public async all({ response }: HttpContextContract) {
    const cities: City[] = await City.all();

    return response.ok({
      cities,
    });
  }

  public async create({ request, response }: HttpContextContract) {
    const data: CityType = await request.validate(CityValidator);
    if (!data) {
      return response.badRequest({
        message: "Bad request",
      });
    }

    const isAlreadyExisting: City | null = await City.findBy("name", data.name);
    if (isAlreadyExisting) {
      return response.badRequest({
        message: "City already exists",
      });
    }

    try {
      await City.create({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        zip: data.zip,
      });

      return response.ok({
        message: "City created",
      });
    } catch (e) {
      return response.badRequest({
        message: e,
      });
    }
  }

  public async edit({ request, response }: HttpContextContract): Promise<void> {
    const { id } = request.params();

    const data: CityType = request.only(["name", "latitude", "longitude", "zip"]);

    try {
      const city = await City.findByOrFail("id", id);
      city.merge(data);

      await city.save();

      return response.ok({
        city,
      });
    } catch (_) {
      return response.notFound({
        message: "City not found",
      });
    }
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params();

    try {
      const city: City | null = await City.findByOrFail("id", id);
      await city.delete();
      return response.ok({
        message: "City deleted",
      });

    } catch (_) {
      return response.notFound({
        message: "City not found",
      });
    }
  }
}

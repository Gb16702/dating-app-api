import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import fs from "fs";
import Application from "@ioc:Adonis/Core/Application";
import City from "../../app/Models/City";

export default class ProvinceSeeder extends BaseSeeder {
  public async run() {
    const jsonPath = Application.makePath(
      "database",
      "seeders",
      "data",
      "cities.json"
    );

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    await City.createMany(data);
  }
}

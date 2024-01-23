import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Gender from "../../app/Models/Gender";

export default class GenderSeeder extends BaseSeeder {
  public async run() {
    await Gender.createMany([
      { id: 0, name: "homme" },
      { id: 1, name: "femme" },
      { id: 2, name: "tous" },
    ]);
  }
}

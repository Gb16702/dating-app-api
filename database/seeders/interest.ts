import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Interest from "../../app/Models/Interest";

export default class InterestSeeder extends BaseSeeder {
  public async run() {
    await Interest.createMany([
      { id: 0, name: "Sport" },
      { id: 1, name: "Séries" },
      { id: 2, name: "Sorties" },
      { id: 3, name: "Mode" },
      { id: 4, name: "Musique" },
      { id: 5, name: "Lecture" },
      { id: 6, name: "Pharmacologie" },
      { id: 7, name: "Photo" },
      { id: 8, name: "Jeux vidéo" },
      { id: 9, name: "Cuisine" },
      { id: 10, name: "Voyages" },
      { id: 11, name: "Animaux" },
      { id: 12, name: "Bricolage" },
      { id: 13, name: "Jardinage" },
      { id: 14, name: "Nature" },
    ]);
  }
}

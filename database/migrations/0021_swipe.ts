import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Providers extends BaseSchema {
  protected tableName = "swipes";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("swiper_user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
      table.uuid("swiped_user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
      table.timestamp("created_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

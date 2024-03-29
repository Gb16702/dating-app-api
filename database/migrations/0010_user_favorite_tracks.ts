import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_favorite_tracks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("track_id", 255).notNullable();
      table.uuid("user_id").references("id").inTable("users");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

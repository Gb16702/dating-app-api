import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_favorite_tracks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("user_id").references("id").inTable("users");
      table.integer("track_id", 255).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

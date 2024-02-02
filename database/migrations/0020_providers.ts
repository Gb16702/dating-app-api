import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Providers extends BaseSchema {
  protected tableName = "providers";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("provider");
      table.uuid("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

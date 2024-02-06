import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Providers extends BaseSchema {
  protected tableName = "tokens";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("user_id").references("id").inTable("users").notNullable().onDelete("CASCADE");
      table.uuid("token").notNullable();
      table.timestamp("expires_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

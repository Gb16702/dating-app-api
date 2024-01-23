import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_matches";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("matcher_user_id").references("id").inTable("users").notNullable();
      table.uuid("matched_user_id").references("id").inTable("users").notNullable();
      table.boolean("is_match").notNullable().defaultTo(false);
      table.timestamp("created_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

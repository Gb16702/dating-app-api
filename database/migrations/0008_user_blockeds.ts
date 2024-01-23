import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_blockeds";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("blocker_id").references("id").inTable("users").notNullable();
      table.uuid("blocked_id").references("id").inTable("users").notNullable();
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
      table.unique(["blocker_id", "blocked_id"]);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

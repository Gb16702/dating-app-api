import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "messages";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("conversation_id").references("id").inTable("conversations");
      table.uuid("sender_id").references("id").inTable("users").notNullable();
      table.uuid("receiver_id").references("id").inTable("users").notNullable();
      table.text("content").notNullable();
      table.boolean("is_read").notNullable().defaultTo(false);
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

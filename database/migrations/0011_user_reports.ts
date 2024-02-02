import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_reports";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .string("reporter_user_id")
        .references("email")
        .inTable("users")
        .notNullable();
      table
        .string("reported_user_id")
        .references("email")
        .inTable("users")
        .notNullable();
      table.string("report_reason").notNullable();
      table.string("report_description").notNullable();
      table.timestamp("created_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

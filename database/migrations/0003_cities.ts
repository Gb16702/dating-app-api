import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "cities";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("name").notNullable();
      table.string("latitude").notNullable();
      table.string("longitude").notNullable();
      table.string("zip").notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

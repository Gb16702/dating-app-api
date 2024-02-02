import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary();
      table.string("email", 255).notNullable().unique();
      table.string("password", 255);
      table.boolean("is_admin").notNullable().defaultTo(false);
      table.boolean("is_verified").notNullable().defaultTo(false);
      table.boolean("is_profile_complete").notNullable().defaultTo(false);
      table.boolean("is_banned").notNullable().defaultTo(false);
      table.integer("daily_likes_count").notNullable().defaultTo(5);
      table.integer("daily_swipes_count").notNullable().defaultTo(20);
      table.timestamp("last_swipe_at", { useTz: true }).defaultTo(null);
      table.timestamp("created_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

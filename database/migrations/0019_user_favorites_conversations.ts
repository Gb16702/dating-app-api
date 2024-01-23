import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UserFavorites extends BaseSchema {
  protected tableName = "user_favorites_conversations";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .uuid("user_id")
        .unsigned()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .uuid("conversation_id")
        .references("id")
        .inTable("conversations")
        .onDelete("CASCADE");
      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

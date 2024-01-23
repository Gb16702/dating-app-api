import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "user_profiles";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.uuid("user_id").references("id").inTable("users");
      table.integer("gender_id").references("id").inTable("genders");
      table.integer("city_id").references("id").inTable("cities");
      table.string("first_name", 255).notNullable();
      table.string("last_name", 255).notNullable();
      table.date("date_of_birth").notNullable();
      table.string("bio", 255).nullable();
      table.string("profile_picture", 255).notNullable();
      table.boolean("is_profile_displayed").notNullable().defaultTo(true);
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}

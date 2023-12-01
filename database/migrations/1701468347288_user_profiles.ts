import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'user_profiles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string("first_name", 255).notNullable()
      table.string("last_name", 255).notNullable()
      table.date("date_of_birth").notNullable()
      table.string("gender", 255).notNullable()
      table.string("user_preferred_gender", 255).notNullable()
      table.string("bio", 255).notNullable()
      table.string("profile_picture", 255).notNullable()
      table.boolean("is_profile_displayed").notNullable().defaultTo(true)
      table.uuid("user_id").unsigned().references("id").inTable("users");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

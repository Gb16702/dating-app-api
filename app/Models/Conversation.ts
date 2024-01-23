import { DateTime } from "luxon";
import {
  BaseModel,
  HasMany,
  ManyToMany,
  beforeCreate,
  column,
  hasMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { randomUUID } from "crypto";
import Message from "./Message";
import User from "./User";

export default class Conversation extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public first_user_id: string;

  @column()
  public second_user_id: string;

  @manyToMany(() => User, {
    pivotTable: "user_favorites_conversations",
  })
  public users: ManyToMany<typeof User>;

  @hasMany(() => Message)
  public messages: HasMany<typeof Message>;

  @beforeCreate()
  public static async genereateUUID(conversation: Conversation) {
    conversation.id = randomUUID();
  }

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}

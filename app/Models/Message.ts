import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Conversation from "./Conversation";
import User from "./User";

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public conversation_id: string;

  @column()
  public sender_id: string;

  @column()
  public receiver_id: string;

  @column()
  public content: string;

  @column()
  public is_read: boolean;

  @belongsTo(() => Conversation, {
    foreignKey: "conversation_id",
  })
  public conversation: BelongsTo<typeof Conversation>;

  @belongsTo(() => User, {
    foreignKey: "sender_id",
  })
  public sender: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "receiver_id",
  })
  public receiver: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}

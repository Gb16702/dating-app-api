import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Conversation from "./Conversation";

export default class UserFavoritesConversations extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: string;

  @column()
  public conversationId: string;

  @belongsTo(() => User, {
    foreignKey: "userId",
  })
  public user: BelongsTo<typeof User>;

  @belongsTo(() => Conversation, {
    foreignKey: "conversationId",
  })

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}

import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, BelongsTo, beforeCreate } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import { randomUUID } from "crypto";

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public user_id: string;

  @column()
  public token: string;

  @column.dateTime({ autoCreate: true })
  public expires_at: DateTime;

  @belongsTo(() => User, {
    foreignKey: "user_id",
  })
  public user: BelongsTo<typeof User>;

  @beforeCreate()
  public static generateUUID(model: Token): void {
    model.token = randomUUID();
  }
}

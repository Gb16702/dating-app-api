import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class UserBlocked extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public bloker_id: string;

  @column()
  public blocked_id: string;

  @belongsTo(() => User, {
    foreignKey: "bloker_id",
  })
  public bloker: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "blocked_id",
  })
  public blocked: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}

import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class UserMatch extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public matcher_user_id: string;

  @column()
  public matched_user_id: string;

  @column()
  public is_match: boolean;

  @belongsTo(() => User, {
    foreignKey: "matcher_user_id",
  })
  public matcher_user: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "matched_user_id",
  })
  public matched_user: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}

import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class UserReport extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public reporter_user_id: string;

  @column()
  public reported_user_id: string;

  @column()
  public report_reason: string;

  @column()
  public report_description: string;

  @belongsTo(() => User, {
    foreignKey: "reporter_user_id",
  })
  public reporter: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "reported_user_id",
  })
  public reported: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
}

import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class Swipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public swiper_user_id: string;

  @column()
  public swiped_user_id: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: "swiper_user_id",
  })
  public swiper: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "swiped_user_id",
  })
  public swiped: BelongsTo<typeof User>;
}

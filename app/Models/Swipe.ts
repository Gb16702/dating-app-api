import { DateTime } from "luxon";
import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class Swipe extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public swiperUserId: string;

  @column()
  public swipedUserId: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: "swiperUserId",
  })
  public swiper: BelongsTo<typeof User>;

  @belongsTo(() => User, {
    foreignKey: "swipedUserId",
  })
  public swiped: BelongsTo<typeof User>;
}

import { column, BaseModel, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Gender from "./Gender";
import City from "./City";

export default class UserProfile extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public cityId: number;

  @column()
  public genderId: number;

  @column()
  public first_name: string;

  @column()
  public last_name: string;

  @column()
  public date_of_birth: Date;

  @column()
  public bio: string;

  @column()
  public profile_picture: string;

  @column()
  public is_profile_displayed: boolean;

  @column()
  public userId: string;

  @belongsTo(() => Gender, {
    foreignKey: "genderId",
  })
  public gender: BelongsTo<typeof Gender>;

  @belongsTo(() => User, {
    foreignKey: "userId",
  })
  public user: BelongsTo<typeof User>;

  @belongsTo(() => City, {
    foreignKey: "cityId",
  })
  public city: BelongsTo<typeof City>;
}

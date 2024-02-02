import { BaseModel, BelongsTo, afterCreate, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";

export default class Providers extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public provider: string;

  @column()
  public user_id: string;

  @belongsTo(() => User, {
    foreignKey: "user_id",
  })
  public user: BelongsTo<typeof User>;

  @afterCreate()
  public static async sendVerificationEmail(user: User): Promise<void> {
    if (!user.is_verified) {

    }
  }
}

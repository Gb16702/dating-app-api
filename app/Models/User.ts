import {DateTime} from "luxon";
import {column, BaseModel, HasOne, hasOne, beforeCreate} from "@ioc:Adonis/Lucid/Orm";
import UserProfile from "./UserProfile";
import {randomUUID} from "crypto";

export default class User extends BaseModel {
  @column({isPrimary: true})
  public id: string;

  @column.dateTime({autoCreate: true})
  public created_at: DateTime;

  @column()
  public email: string;

  @column({serializeAs: null})
  public password: string;

  @column()
  public is_admin: boolean;

  @column()
  public is_verified: boolean;

  @hasOne(() => UserProfile)
  public profile: HasOne<typeof UserProfile>;

  @beforeCreate()
  public static generateUUID(user: User): void {
    user.id = randomUUID();
  }
}

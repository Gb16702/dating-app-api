import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  HasOne,
  hasOne,
  beforeCreate,
  beforeSave,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import UserProfile from "./UserProfile";
import { randomUUID } from "crypto";
import Hash from "@ioc:Adonis/Core/Hash";
import Ban from "./Ban";
import UserFavoriteTrack from "./UserFavoriteTrack";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public is_admin: boolean;

  @column()
  public is_verified: boolean;

  @column()
  public is_profile_complete: boolean;

  @column()
  public provider: string;

  @column()
  public is_banned: boolean;

  @hasOne(() => UserProfile)
    public profile: HasOne<typeof UserProfile>;

  @hasMany(() => Ban, {
    foreignKey: "user_id",
  })
  public bans: HasMany<typeof Ban>;

  @hasMany(() => Ban, {
    foreignKey: "banned_by",
  })
  public banned_users: HasMany<typeof Ban>;

  @hasMany(() => UserFavoriteTrack, {
    foreignKey: "user_id",
  })
  public favorite_tracks: HasMany<typeof UserFavoriteTrack>;

  @beforeCreate()
  public static generateUUID(user: User): void {
    user.id = randomUUID();
  }

  @beforeSave()
  public static async hashPassword(user: User): Promise<void> {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}

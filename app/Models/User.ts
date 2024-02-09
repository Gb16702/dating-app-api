import { DateTime } from "luxon";
import {
  column,
  BaseModel,
  HasOne,
  hasOne,
  beforeCreate,
  hasMany,
  HasMany,
  beforeSave,
} from "@ioc:Adonis/Lucid/Orm";
import UserProfile from "./UserProfile";
import { randomUUID } from "crypto";
import Ban from "./Ban";
import UserFavoriteTrack from "./UserFavoriteTrack";
import Hash from "@ioc:Adonis/Core/Hash";
import UserPreferredGender from "./UserPreferredGender";
import Swipe from "./Swipe";
import UserSecondaryProfilePicture from "./UserSecondaryProfilePicture";

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
  public is_banned: boolean;

  @column()
  public dailyLikesCount: number;

  @column()
  public dailySwipesCount: number;

  @column.dateTime()
  public lastSwipeAt: DateTime;

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

  @hasMany(() => UserPreferredGender, {
    foreignKey: "user_id",
  })
  public preferredGenders: HasMany<typeof UserPreferredGender>;

  @hasMany(() => UserSecondaryProfilePicture, {
    foreignKey: "user_id",
  })
  public user_secondary_profile_pictures: HasMany<typeof UserSecondaryProfilePicture>;

  @hasMany(() => Swipe, {
    foreignKey: "swiper_user_id",
  })
  public swiper: HasMany<typeof Swipe>;

  @hasMany(() => Swipe, {
    foreignKey: "swiped_user_id",
  })
  public swiped: HasMany<typeof Swipe>;

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

import {column, BaseModel} from "@ioc:Adonis/Lucid/Orm";

export default class UserProfile extends BaseModel {
  @column({isPrimary: true})
  public id: string;

  @column()
  public first_name: string;

  @column()
  public last_name: string;

  @column()
  public date_of_birth: Date;

  @column()
  public gender: string;

  @column()
  public user_preferred_gender: string;

  @column()
  public bio: string;

  @column()
  public profile_picture: string;

  @column()
  public is_profile_displayed: boolean;

  @column()
  public user_id: number;
}

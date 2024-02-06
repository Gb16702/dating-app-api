import {
  BaseModel,
  BelongsTo,
  afterCreate,
  belongsTo,
  column,
} from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import EmailService from "../Services/EmailService";
import Token from "./Token";
import { DateTime } from "luxon";

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
  public static async sendVerificationEmail(p: Providers): Promise<void> {
    const relatedUser: User = await p.related("user").query().firstOrFail();

    if (!relatedUser.is_verified && p.provider === "credentials") {
      const token = await Token.create({
        user_id: relatedUser.id,
        expires_at: DateTime.now().plus({ days: 1 }),
      });

      const dynamicTemplateData = {
        token: token.token,
      };

      await EmailService.sendVerificationEmail(
        relatedUser.email,
        dynamicTemplateData
      );
    } else if (p.provider === "spotify") {
      await EmailService.sendWelcomeEmail(relatedUser.email);
    }
  }
}

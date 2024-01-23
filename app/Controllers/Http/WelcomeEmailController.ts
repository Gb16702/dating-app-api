import EmailService from "../../Services/EmailService";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";

export default class WelcomeEmailController {
  public async sendWelcomeEmail({ request, response }: HttpContextContract) {
    const { email }: { email: string } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.exists({ table: "users", column: "email" }),
        ]),
      }),
    });

    const user: User = await User.query()
      .preload("profile")
      .where("email", email)
      .firstOrFail();

    const { first_name } = user.profile;

    await EmailService.sendEmail(email, "d-6608825f02f8449b844975531d840f23", Object.assign({}, { first_name }));

    return response.ok({ message: "Email sent" });
  }
}

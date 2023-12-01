import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterValidator from "../../Validators/RegisterValidator";
export default class RegistersController {
  public async post({request, response}: HttpContextContract): Promise<void> {
      console.log(request.body());
      const validatedData = await request.validate(RegisterValidator);
      console.log(validatedData, "Validated Data");

      return response.status(200).json({message: "Test"})
  }
}

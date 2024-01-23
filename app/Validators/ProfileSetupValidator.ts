import { schema, CustomMessages, rules } from "@ioc:Adonis/Core/Validator";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class ProfileSetupValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    first_name: schema.string({ trim: true }, [
      rules.minLength(2),
      rules.maxLength(50),
    ]),
    last_name: schema.string({ trim: true }, [
      rules.minLength(2),
      rules.maxLength(50),
    ]),
    date_of_birth: schema.date({
      format: "yyyy-MM-dd",
    }),
    gender: schema.number(),
    city_id: schema.number(),
    gender_preference: schema.number(),
    bio: schema.string.optional({ trim: true }),
    favorite_tracks_ids: schema.array().members(schema.number.optional([])),
  });

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    required: "The {{field}} is required",
    minLength:
      "The {{field}} must be at least {{options.minLength}} characters",
    maxLength: "The {{field}} must be at most {{options.maxLength}} characters",
  };
}

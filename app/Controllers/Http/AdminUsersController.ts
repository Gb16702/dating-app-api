import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../../Models/User";

export default class AdminController {
  public async get({ request, response }: HttpContextContract) {
    const { id } = request.params();
    try {
      const user: User | null = await User.query()
        .preload("profile")
        .where("id", id)
        .firstOrFail();

      return response.ok({
        user,
      });
    } catch (_) {
      return response.notFound({ message: "User not found" });
    }
  }

  public async getAll({ response }: HttpContextContract) {
    const users: User[] = await User.query().preload("profile");

    return response.ok({
      users,
    });
  }

  public async getPaginatedUsers({ request, response }: HttpContextContract) {
    const page = request.input('page', 1);
    const search = request.input('search', null);
    const perPage = 10;

    try {
      let query = User.query().preload('profile');

      if (search !== "undefined") {
        query = query
          .where('email', 'LIKE', `%${search}%`)
          .orWhereHas('profile', (profileQuery) => {
            profileQuery
              .where('first_name', 'LIKE', `%${search}%`)
              .orWhere('last_name', 'LIKE', `%${search}%`);
          });
      }

      const paginatedResult = await query.paginate(page, perPage);
      return response.ok(paginatedResult);
    } catch (e) {
      console.error('Error getting paginated users:', e);
      return response.internalServerError({
        message: "Une erreur est survenue",
      });
    }
  }

  public async editUsersRole({ request, response }: HttpContextContract) {
    const { users } = request.body();

    if (!users || !users.length) {
      return response.badRequest({ message: "Bad request" });
    }

    const ids: string[] = users.map((user: User) => user);

    let error: boolean = false;

    try {
      for (const id of ids) {
        const user: User | null = await User.findBy("id", id);
        if (!user || user.email === process.env?.ADMIN_EMAIL) {
          error = true;
          continue;
        }

        user.is_admin = !user.is_admin;
        await user.save();
      }

      if (error) {
        return response.badRequest({
          message: "Some users couldn't be updated",
        });
      }

      return response.ok({
        message: "Users updated",
      });
    } catch (error) {
      return response.badRequest({ message: "Bad request" });
    }
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params();

    try {
      const user: User | null = await User.findBy("id", id);
      if (!user || user.email === process.env?.ADMIN_EMAIL) {
        return response.badRequest({ message: "Bad request" });
      }

      await user.delete();
      return response.ok({ message: "User deleted" });
    } catch (_) {
      return response.notFound({ message: "User not found" });
    }
  }
}

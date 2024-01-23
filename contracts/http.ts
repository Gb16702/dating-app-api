import User from "../app/Models/User";

declare module "@ioc:Adonis/Core/HttpContext" {
    interface HttpContextContract {
        user?: User;
    }
}

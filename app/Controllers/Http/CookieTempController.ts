export default class CookieTempController {
  public async get({ response }) {
    return response
      .plainCookie("name", 10, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
      })
      .redirect("http://localhost:3000/");
  }
}

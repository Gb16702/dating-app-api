/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", "CookieTempController.get");

Route.post("/", "WelcomeEmailController.sendWelcomeEmail");

Route.group(() => {
  Route.group(() => {
    Route.group(() => {
      Route.group(() => {
        Route.patch("/role", "AdminUsersController.editUsersRole");
      }).prefix("/edit");
      Route.get("/all", "AdminUsersController.getAll");
      Route.get("/paginate", "AdminUsersController.getPaginatedUsers");
      Route.get("/search", "AdminUsersController.searchUsers");
      Route.get("/:id", "AdminUsersController.get");
      Route.group(() => {
        Route.get("/all", "ReportsController.all");
        Route.get("/:id", "ReportsController.get");
      }).prefix("/reports");
    }).prefix("/users");
    Route.group(() => {
      Route.get("/all", "AdminCitiesController.all");
      Route.post("/create", "AdminCitiesController.create");
      Route.get("/:id", "AdminCitiesController.get");
      Route.patch("/edit/:id", "AdminCitiesController.edit");
      Route.delete("/delete/:id", "AdminCitiesController.delete");
    }).prefix("/cities");
    Route.group(() => {
      Route.get("/all", "SupportTicketController.all");
      Route.patch("/update/:id", "SupportTicketController.update");
      Route.delete("/delete/:id", "SupportTicketController.delete");
    }).prefix("/tickets");
  }).prefix("/admin");
  Route.group(() => {
    Route.post("/create", "BanController.create");
    Route.get("/all", "BanController.all");
    Route.delete("/delete/:id", "BanController.delete");
  })
    .prefix("/ban")
    .prefix("/admin")
    .middleware("admin");
  Route.group(() => {
    Route.get("/redirect", "SpotifyAuthController.redirect");
    Route.get("/callback", "SpotifyAuthController.callback");
    Route.get("/getAuthToken", "SpotifyAuthController.getAuthToken");
    Route.post("/register", "RegistersController.post");
    Route.post("/login", "AuthController.login");
    Route.get("/logout", "AuthController.logout").middleware("auth");
    Route.post("/forgot-password", "AuthController.forgotPassword");
    Route.post(
      "/reset-forgotten-password",
      "AuthController.resetForgottenPassword"
    );
    Route.post("/verify-token", "AuthController.verifyToken");
    Route.get(
      "/verify-session-token",
      "AuthController.verifySessionToken"
    ).middleware("auth");
  }).prefix("/authentication");
  Route.group(() => {
    Route.get("/me", "UsersController.me").middleware("auth");
    Route.post("/edit-password", "UsersController.editPassword").middleware(
      "auth"
    );
    Route.group(() => {
      Route.post("/setup", "ProfileController.setup");
      Route.group(() => {
        Route.get("/all", "UserInterestsController.all");
        Route.post("/add", "UserInterestsController.addUserInterests");
        Route.delete("/delete", "UserInterestsController.removeUserInterests");
      }).prefix("/interests");
    })
      .prefix("/profile")
      .middleware("auth");

    Route.group(() => {
      Route.post("/create", "MatchController.create").middleware("auth");
      Route.delete("/delete/:id", "MatchController.delete").middleware("auth");
    })
      .prefix("/matches")
      .middleware("auth");

    Route.group(() => {
      Route.get("/all", "SpotifyDataController.search");
      Route.post("/getTrack", "SpotifyDataController.getTrack");
    })
      .prefix("/spotify")
      .middleware("auth");

    Route.post("/messages", "MessagesController.create").middleware("auth");

    Route.patch(
      "/conversations/:id/pin",
      "UserFavoritesConversationsController.pin"
    ).middleware("auth");

    Route.get(
      "/conversations/:id/messages",
      "MessagesController.show"
    ).middleware("auth");

    Route.group(() => {
      Route.post("/create", "ReportsController.create");
      Route.delete("/cancel", "ReportsController.cancel");
      Route.delete("/delete/:id", "ReportsController.delete");
    })
      .prefix("/reports")
      .middleware("auth");

    Route.group(() => {
      Route.get("/getUserTickets", "SupportTicketController.getUserTickets");
      Route.post("/create", "SupportTicketController.create");
      Route.delete("/cancel", "SupportTicketController.cancel");
    })
      .prefix("/tickets")
      .middleware("auth");

    Route.post("/swipe", "SwipeController.create").middleware("auth");
    Route.post("/like", "MatchController.create").middleware("auth");
    Route.post("/verify-account", "AuthController.verifyAccount");
    Route.get("/meet-users", "UsersController.meetUsers").middleware("auth");
  }).prefix("/users");

  Route.group(() => {
    Route.get("/all", "InterestsController.all");
    Route.post("/create", "InterestsController.create");
    Route.get("/:id", "InterestsController.get");
    Route.delete("/delete/:id", "InterestsController.delete");
    Route.patch("/update/:id", "InterestsController.update");
  }).prefix("/interests");
}).prefix("/api");

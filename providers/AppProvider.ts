import type { ApplicationContract } from "@ioc:Adonis/Core/Application";
import cloudinary from "../config/cloudinary";

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_PUBLIC,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    const scheduler = this.app.container.use("Adonis/Addons/Scheduler");
    scheduler.run();

    // if (this.app.environment === "web") {
    //   await import("../start/socket");
    // }
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

export default class UploadImage {

  public static async upload(path: string) {
    if (!path) {
      throw new Error("Le fichier n'a pas de chemin temporaire défini");
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(path, {
      upload_preset: "dating",
    });

    return {
      picture_url: result.secure_url,
      public_id: result.public_id,
    };
  }

  public static async delete(public_id: string) {
    await cloudinary.uploader.destroy(public_id);
  }
}

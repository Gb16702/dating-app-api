import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

export default class UploadImage {
  // private static allowedFormats: string[] = ["jpg", "png", "jpeg", "webp"];
  // private static ImageConstraints(result: UploadApiResponse) {
  //     const maxFileSize: number = 5 * 1024 * 1024;
  //     if (result.bytes > maxFileSize) throw new Error("The file is too big");
  // }
  public static async upload(path: string) {
    //   const fileExtension: string = file.split(".").pop();
    //   if (!UploadImage.allowedFormats.includes(fileExtension)) {
    //     throw new Error("Unauthorized file format");
    //   }

    if (!path) {
      throw new Error("Le fichier n'a pas de chemin temporaire défini");
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(path, {
      upload_preset: "dating",
    });

    //   UploadImage.ImageConstraints(result);

    return result.secure_url as string;
  }
}
